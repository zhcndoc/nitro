# Vite 开发中间件 — 请求路由

> 范围：`src/build/vite/dev.ts` 中的请求路由逻辑——两个
> `server.middlewares.use(...)` 注册（`nitroDevMiddlewarePre` 和
> 兜底的 `nitroDevMiddleware`）：当前设计为何采用这种形式。

## 1. 所在位置与连接方式

- 逻辑：`src/build/vite/dev.ts` → `configureViteDevServer(ctx, server)`。
- 入口：`src/build/vite/plugin.ts:266` — 插件的 `configureServer` 钩子
  `return` `configureViteDevServer` 的结果。

Vite 的 `configureServer` 契约：在钩子内部**同步**注册的中间件会在
Vite 的内部中间件**之前**运行；从钩子中**返回**的函数会在这些中间件
**之后**运行（即“post”钩子）。Nitro 同时使用了两端：

| 注册项 | 位置 | 运行时机 | 作用 |
|---|---|---|---|
| `nitroDevMiddlewarePre`（`const` 形式） | `dev.ts:284` | **早于** Vite 静态资源/转换 | 分类器。立即将明确的 Nitro 路由和确定的导航请求路由到 Nitro；让确定的资源请求继续交给 Vite，同时将其标记为 `_nitroHandled`（透明兜底）或 `_nitroAssetCheck`（不透明兜底/无匹配）。 |
| `nitroDevMiddleware` | 定义于 `dev.ts:213`，在返回的 `() => { ... }` 内注册 | **晚于** Vite 静态资源/转换 | 兜底处理器。将请求包装为 Web `Request`，尝试调用 `ctx.devApp.fetch`，然后调用 `nitroEnv.dispatchFetch`，同时遵循 `baseURL`；检查 `_nitroAssetCheck` 请求的响应。对于 `_nitroHandled` 请求则跳过。 |

**为什么需要两个，以及为什么需要 pre？** 如果没有 pre 阶段，Vite 的静态资源/转换
中间件会从项目根目录提供文件，并在 Nitro 看到服务器路由之前处理这些请求（参见上游
**vitejs/vite#20866**；该问题使 Vite 参考 `sec-fetch-dest`，从而让文档请求继续向后传递——
这也是 Nitro 分类器所依赖的同一个请求头）。

关于 Vite 这一侧的事实（已针对 vite@8.1.4 验证）：Nitro 默认将
`appType` 设置为 `"custom"`（`plugin.ts:199` — 用户可覆盖；以下分析假设使用默认值），
因此 Vite 不会注册
`htmlFallback`/`indexHtml`/`notFound` 中间件，并且**每个普通未命中请求都会调用
`next()`**（sirv 和 transformMiddleware 都不会为缺失的文件/模块自行返回 404）。
唯一的终端 404 是位于 Nitro post-hook **之后**的 connect `finalhandler`。因此，Vite 确实会将
所有无法处理的请求交给后续流程——post 兜底处理器是 `finalhandler` 之前的最后一个处理器。

## 2. 分类

SSR 应用中的 `nitro.routing.routes` **始终**包含一个兜底路由 `/**`，因此“是否匹配 Nitro 路由？”的答案几乎总是“是”。该设计区分以下情况：

- **显式路由** — 已设置 `route`、`!== "/**"`，且不是 `startsWith("/**:")`（例如 `/api/photos/**` 这样的带前缀的通配路由属于显式路由）。结果是确定的 → **始终使用 Nitro**，任何启发式规则都不能覆盖这一判断（#4108、#4241、#4252、#4270）。
- **显式公共资源** — 在非根 `baseURL` 下、且 `fallthrough: false` 的公共资源目录拥有其子树 → 使用 Nitro，与显式路由相同。
- **透明兜底路由** — 根级别的*用户路由文件*（`routes/[...].ts` → `/**`，`routes/[...slug].ts` → `/**:slug`）。Nitro 能处理它所能处理的一切，因此 Vite 仍是确定的资源处理器：带资源标记的请求会被标记为 `_nitroHandled`，而 Vite 未命中时**不得**再回退到该路由（#4234/#4266）。
- **不透明兜底路由** — SSR 渲染器 `/**` 或自定义 `serverEntry` `/**`（两者都在 `routing.ts` 中注册，并带有可识别的 `handler` 路径）。它们的*真实*路由对宿主不可见（`server.ts` 的 H3 应用路由、TanStack Start 等框架路由器），因此 Vite 未命中的带资源标记请求仍必须被**分发** — 标记为 `_nitroAssetCheck`，并通过检查响应来决定。
- **无匹配** — 没有匹配项。无扩展名 → 页面导航 → Nitro；带资源标记 → 与不透明兜底路由相同（`_nitroAssetCheck`，在 Vite 处理后进行分发）。

## 3. 资源启发式规则（仅适用于兜底 / none 情况）

设置 `Vary: sec-fetch-dest, accept`，然后：

- **存在且具体的 `Sec-Fetch-Dest`**（不是 `empty`）：`document`/`iframe`/
  `frame` = 导航 → Nitro；其他任何值（`image`、`video`、`style`，……） =
  资源。
- **缺失或为 `empty`**：Vite 的 `?import` 模块图标记
  （URL 上匹配 `/[?&]import(?:[&=]|$)/`）⇒ 资源 — 只有 Vite 的模块图会生成该标记，
  页面导航永远不会生成，因此对于 `ASSET_EXT_RE` 中未包含的扩展名（例如被导入的
  `.json`，#4433），它仍然具有权威性。否则回退到扩展名判断 — `ASSET_EXT_RE.test(ext)`
  **且** `Accept` 中不包含 `text/html` ⇒ 资源。（`empty` = fetch/XHR
  含义不明确：它既会标记 API 调用，也会标记通过 `fetch()` 获取的资源。）
- **只有 `GET`/`HEAD` 才可能是资源** — `POST /upload.png` 绝不会是浏览器资源加载，
  因此其他方法会完全绕过该启发式规则。
- 非资源 +（已匹配或无扩展名）→ 立即交由 Nitro 处理（Vite 之前）。

以下两个正则表达式必须保持不变：
- `ASSET_EXT_RE`（`dev.ts:24`）— 有意保持范围较窄，这样像
  `/foo.bar.1` 这样的带点 Nitro 参数仍会交由 Nitro 处理（#4108）。
- 扩展名仅从路径中提取（会去除查询字符串/哈希），因此
  `?file=bar.png` 不会导致错误分类。

## 4. 响应检查（`_nitroAssetCheck`）

仅由不透明的兜底处理器处理的、带有资源标签的请求无法被**先验分类**——`/image.png` 可能是真实的自定义入口路由（#4252），也可能是真正缺失的资源，而朴素的 SSR `/**` 会将其渲染为 200 页面（#4234）。但可以根据**响应**进行分类：在 Vite 放弃处理、post catch-all 将请求分派给 Nitro 后，如果响应状态为 2xx 且 content-type 为 `text/html`（在 post middleware 中进行内联检查），则意味着兜底处理器为缺失的资源渲染了页面 → 通过 `next()` 丢弃该响应（connect `finalhandler` 返回 404，与之前相同）。其他情况——真实资源类型、JSON、`text/plain`、没有 content-type、非 2xx（框架 404 页面、重定向）——均原样放行。

拒绝列表的理由（均已通过实证验证）：

- 只有 `text/html` 会被视为吞掉响应。最初也拒绝 `application/json`，但这会破坏真正的不透明框架：TanStack Start 会有意对标记为资源加载的 API 路由返回 JSON
  （`<img src="/api/.../thumbnail">`、TanStack/router#7403、nitro PR #4274），
  而 sourcemap（`.map` ∈ `ASSET_EXT_RE`）合法地使用 JSON。所接受的权衡是：如果某个 SSR 入口使用
  *JSON* 吞掉缺失的资源（这种情况很反常——真正朴素的 SSR 会渲染 HTML），那么现在开发环境中会返回 200 JSON，而不是 404。
- 排除 `text/plain`，因为 h3 处理器返回的裸字符串在 h3 层**没有** content-type，但在 worker 的 HTTP 跳转过程中会以 `text/plain;
  charset=UTF-8` 到达——这是 srvx 的 node-adapter 默认行为（`srvx/dist/adapters/node.mjs`；取决于运行器，但最终会趋于一致）——因此必须放行（返回字符串的自定义入口处理器）。
- 透明的（用户文件）兜底处理器**不能**使用响应检查来替代 divert：它们返回的字符串 200 响应到达时没有可用于区分的 content-type。

这使整个机制保持零配置、仅在宿主侧生效（不改变运行时/构建产物，不改变生产环境行为）。已知遗留问题：

- **生产环境**中的 SSR 仍会为缺失资源的 URL 渲染 200 HTML——这是既有行为；修改它需要另行进行有意为之的破坏性变更讨论。
- 不透明语义要求通过 `renderer` / `serverEntry` 注册。通过 `routes:` / `handlers:` 配置或模块添加的 `/**` 兜底处理器会被分类为**透明**，并且对于带有资源标签的请求仍会被抢先处理（#4252 类限制）——以这种方式集成渲染器的框架应改用 `renderer`。
- 仅开发环境的开销：匹配不透明兜底处理器的缺失资源会触发一次完整的（随后被丢弃的）SSR 渲染，然后才返回 404。

## 5. Issue / PR 发展脉络（按时间顺序）

- **#3649** 首个粗略的“有扩展名 ⇒ Vite”规则；**#3804/#3805/#3817**
  改进中间件、跳过已挂载路径、跳过内部前缀（以
  `^\/(?:__|@)` 守卫的形式保留至今）；**#4098** 使用
  `sec-websocket-protocol` 区分 Vite HMR
  套接字与 Nitro WebSocket（`upgrade` 处理程序）。
- **#4108** 针对带点号 Nitro 路由的、能够感知 baseURL 的匹配
  （TanStack/router#6903）。
- **#4234** 非回环纯 HTTP 源会省略 `Sec-Fetch-*` → 通配规则吞掉
  `<script src>` 加载。通过 **#4238** 修复：`Accept` +
  `ASSET_EXT_RE` 回退方案 +
  `_nitroHandled` 标记。
- **#4241** #4238 过度积极：真实路由上的 `sec-fetch-dest: image`
  （`/api/image`）被发送到 Vite → 404。通过 **`7d49dcae`** + **`08f2ec69`**
  修复（在扩展名匹配前移除查询字符串）。
- **#4252 / #4270** 即使是显式路由，只要 URL 带有资源扩展名也会丢失。通过 **#4272**
  （`5b7e152b`）修复：显式路由 vs 通配路由 vs 无匹配的分类 — **显式路由具有确定性的优先级，任何启发式规则都无法影响它**。
- `7765bcb7` 添加了 `isExplicitPublicAsset`。
- **#4252 后续修复**（katywings、jantimon/TanStack/router#7403）：分类器无法看到的路由 — 例如提供 `/image.png` 的自定义
  `server.ts` H3 应用，或 SSR 框架提供的资源 — 会被 `_nitroHandled` 提前拦截，因而永远无法运行。通过上述不透明通配规则 + 响应检查设计（§2、§4）修复：现在仅对透明的用户文件通配规则应用提前拦截，而不透明分发则根据其响应的内容类型进行判断。

## 6. 运行时调度流程

全捕获 `nitroDevMiddleware` 分两个阶段进行调度：

1. **`ctx.devApp.fetch(req)`** — `NitroDevApp`（`src/dev/app.ts`），主机侧：
   `devHandlers`、`/_vfs/**`、`/_nitro/tasks`、公共资源目录、`devProxy`。
   不包含全捕获处理器 → 404 表示“不是我的请求，交由后续处理”；任何非 404
   响应都会直接返回（绝不会进行检查 — 确定性的主机处理结果具有权威性）。
2. **`nitroEnv.dispatchFetch(req)`** → env-runner → worker → `nitroApp.fetch` →
   完整路由表、中间件、全捕获处理器。

全捕获处理器的注册（`src/routing.ts`）：自定义的 `serverEntry` 以
`/**` 的形式推入，`handler = nitro.options.serverEntry.handler`；SSR 渲染器也以
`/**` 的形式推入，`handler = nitro.options.renderer.handler`（由 `plugin.ts`
的 `configResolved` 在存在 `ssr` 服务时设置为 `internal/vite/ssr-renderer`）。
这些处理器路径就是预处理阶段识别不透明全捕获处理器的依据。

## 7. 测试覆盖图

全部位于 `test/vite/` 下；通过 `test:rollup` 和 `test:rolldown` 运行。每个测试都会启动一个真实的 Vite 开发服务器，并使用手动设置的请求头进行 `fetch()`。

- `app.test.ts`（`app-fixture/`）——SSR `/**` 路径。#4234 吞没契约（`style`/缺失/`empty` 目标下缺失的 `.css`/`.js` 不得返回 200——该 fixture 的入口会为带扩展名的未命中路径渲染 HTML 页面），`sec-fetch-dest: image` 下的 JSON API 路由直接放行（TanStack/router#7403），#4252 有意提供的资源（`/dynamic-asset.png` → `image/png` 通过检查），`HTTPError` 传播、导航、存储/配置共享。
- `server-entry.test.ts`（`server-entry-fixture/`）——#4252 自定义 `server.ts` H3 应用：带资源扩展名的路由在 `image`/缺失/`script` 目标下均可访问（包括返回无内容类型字符串的情况），JSON sourcemap（`/generated.js.map`）直接放行，向带资源扩展名的路由发送 `POST` 请求时可到达其处理器（非 GET/HEAD 请求永远不是资源），缺失资源的 404 契约，导航。
- `root-wildcard.test.ts`——透明的根捕获全部路由 `/**:path`：在 `script`/`style`/`image`/缺失目标下访问 `/entry-client.ts` 时绝不能返回 200（#4234/#4266），导航仍可到达该路由。
- `baseurl-dotted-param.test.ts`——`baseURL: /subdir/` 下的显式通配路由：#4241、#4252、#4270、查询字符串扩展名，未匹配的资源 → Vite。
- 相关测试：`hmr.test.ts`（Vite 在 `script` 目标下提供已有模块）、`openapi.test.ts`（显式路由），其他测试（构建/环境，而非路由）。

## 8. 易错点

- `nitroDevMiddleware` 中对 `server.middlewares.stack` 的扫描会跳过 URL 以其他中间件挂载的 `base` 开头的请求（#3805）。
- `_nitroHandled` 是一个由预处理阶段（透明的 catch-all 资源）以及后置 catch-all 本身（防止重新进入）设置的一次性锁。对于真实处理器或不透明处理器仍应接收的请求，绝不要设置它（#4252 根本原因）。
- 扩展名检测必须保持仅针对路径（去除 `?#`），并且 `ASSET_EXT_RE` 必须保持狭窄，否则带点号的 Nitro 参数会出现回归问题（#4108）。
- 检查中的仅限 HTML 判断不得扩展到 `text/plain`（字符串返回值的桥接默认值）或 `application/json`（有意提供的 API，#7403），并且只能应用于 `envRes.ok` —— 框架 404 页面和重定向会原样透传。
- WebSocket 的 `upgrade` 处理程序是一个独立关注点，但同样涉及“Vite 的还是 Nitro 的？”这一主题。
