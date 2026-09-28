# Nitro 架构深入解析

## 核心实例（`src/nitro.ts`）

`createNitro(config, opts)` 创建主上下文，其中包含：
- `options: NitroOptions` — 解析后的配置
- `hooks: Hookable<NitroHooks>` — 构建生命周期钩子
- `vfs: Map<string, { render }>` — 虚拟文件系统
- `routing: { routes, routeRules, globalMiddleware, routedMiddleware }`
- `scannedHandlers: NitroEventHandler[]`
- `logger: ConsolaInstance`
- `updateConfig(config)` — 热重载配置
- `close()` — 清理

**设置流程：**
1. 通过 `loadOptions()` 加载选项
2. 通过 `installModules()` 安装模块
3. 通过 `initNitroRouting()` 初始化路由
4. 通过 `scanAndSyncOptions()` 扫描处理程序／插件／任务
5. 设置钩子

## 入口点

- `src/builder.ts` — 主要公共 API：`createNitro()`、`build()`、`createDevServer()`、`prerender()`、`copyPublicAssets()`、`prepare()`、`runTask()`、`listTasks()`
- `src/vite.ts` — 从 `src/build/vite/plugin.ts` 导出的 Vite 插件

## 构建系统（`src/build/`）

**构建器分发**（`build/build.ts`）：根据 `nitro.options.builder` 将构建任务委托给 `rollup`、`rolldown` 或 `vite`。

**构建器选择**（在 `config/resolvers/builder.ts` 中解析）：
- 检查 `NITRO_BUILDER`／`NITRO_VITE_BUILDER` 环境变量
- 自动检测可用的软件包
- 回退顺序：rolldown → vite → rollup

**基础配置**（`build/config.ts`）：
- 扩展名：`.ts`、`.mjs`、`.js`、`.json`、`.node`、`.tsx`、`.jsx`
- Import.meta 替换项（`import.meta.dev`、`import.meta.preset` 等）
- 用于 polyfill 的 Unenv 别名
- 外部依赖模式

**插件**（`build/plugins.ts`）：
1. 虚拟模块 — 从 `build/virtual/` 渲染
2. WASM 加载器 — unwasm
3. 注入服务器主入口 — `globalThis.__server_main__`
4. 原始导入 — `?raw` 后缀
5. 路由元信息 — OpenAPI 元数据
6. 替换插件 — 变量替换
7. 外部依赖插件 — Node.js 原生解析
8. Sourcemap 压缩（可选）

**虚拟模块**（`build/virtual/`，14 个模板）：
全部以 `#nitro/virtual/<name>` 为前缀：
- `routing.ts` — 编译后的路由匹配器
- `plugins.ts` — 插件注册表
- `error-handler.ts` — 错误处理程序
- `public-assets.ts` — 公共资源元数据
- `server-assets.ts` — 服务器资源元数据
- `runtime-config.ts` — 运行时配置对象
- `database.ts` — 数据库设置
- `kv.ts` — KV 存储后端
- `tasks.ts` — 任务注册表
- `polyfills.ts` — 环境 polyfill
- `feature-flags.ts` — 功能检测
- `routing-meta.ts` — 路由元数据（OpenAPI）
- `renderer-template.ts` — SSR 渲染器
- `_all.ts` — 聚合器

## 配置系统（`src/config/`）

**加载器**（`config/loader.ts`）：`loadOptions(config, opts)`
1. 与默认值合并（`NitroDefaults`）
2. 加载 c12 配置文件（`nitro.config.ts`、`package.json.nitro` 等）
3. 解析 preset
4. 依次运行配置解析器

**解析器**（`config/resolvers/`）：
`compatibility`、`tsconfig`、`paths`、`imports`、`route-rules`、`database`、`export-conditions`、`runtime-config`、`open-api`、`url`、`assets`、`storage`、`error`、`unenv`、`builder`

**默认值**（`config/defaults.ts`）：所有 NitroConfig 默认值。

## 运行时（`src/runtime/`）

**内部模块**（`runtime/internal/`）：
- `app.ts` — NitroApp 创建、H3 app 设置
- `cache.ts` — 响应缓存
- `context.ts` — 异步上下文
- `route-rule-handlers.ts` — Nitro 为编译后的匹配器提供的规则处理程序：一个绑定到 Nitro 缓存运行时的 `cache` 处理程序。内置处理程序（headers、redirect、proxy、cors）以及规则匹配／规范化位于 [`h3/rules`](https://h3.dev/guide/rules)。
- `static.ts` — 静态文件服务
- `task.ts` — 任务执行
- `plugin.ts` — 插件辅助函数
- `runtime-config.ts` — 配置 getter

**公共导出**：`runtime/app.ts`（`defineConfig()`）、`runtime/nitro.ts`（`serverFetch()`）、`runtime/cache.ts`、`runtime/task.ts`、`runtime/kv.ts` 等

## 开发服务器（`src/dev/`）

- `dev/server.ts` — `NitroDevServer`：通过 `env-runner` 管理 Worker，失败时重启（最多重试 3 次），支持 WebSocket，VFS 调试端点（`/_vfs/**`）
- `dev/app.ts` — `NitroDevApp`：带错误处理的 H3 app，支持压缩的静态服务，开发代理

## 预渲染（`src/prerender/`）

- `prerender/prerender.ts` — 主流程：解析路由 → 构建预渲染器（preset：`nitro-prerender`）→ 并行执行 → 爬取链接 → 写入磁盘 → 压缩
- `prerender/utils.ts` — `extractLinks()`、`matchesIgnorePattern()`、`formatPrerenderRoute()`

## 路由与扫描（`src/routing.ts`、`src/scan.ts`）

**扫描**：从文件系统发现路由、中间件、插件、任务和模块。

路由文件约定：
- `routes/index.ts` → `GET /`
- `routes/users/[id].ts` → `GET /users/:id`
- `routes/users/[...slug].ts` → `GET /users/**:slug`
- `api/users.post.ts` → `POST /api/users`
- `.dev`／`.prod`／`.prerender` 后缀用于环境筛选

**路由器**（`Router` 类）：基于 `rou3`，编译为优化的字符串匹配器，支持方法路由和环境条件。

## Preset（`src/presets/`）

多个部署目标 preset（以及内部的 `_nitro`／`_static`）；参见 `.agents/presets.md`。每个 preset 的结构：

```
presets/<name>/
├── preset.ts        # defineNitroPreset()
├── runtime/         # Runtime entry (bundled)
├── types.ts         # Types (optional)
├── utils.ts         # Build-time utils (optional)
└── unenv/           # Env overrides (optional)
```

关键 preset：`standard`、`node`（服务器／中间件／集群）、`cloudflare`（pages／workers）、`vercel`、`netlify`、`aws-lambda`、`deno`、`firebase`、`azure`、`bun`、`winterjs`

解析：`presets/_resolve.ts` 处理别名、开发／生产环境、兼容性日期和静态托管。

## CLI（`src/cli/`）

使用 `citty` 和延迟加载命令：`dev`、`build`、`deploy`、`preview`、`prepare`、`task`、`docs`。

## 关键库

| 库 | 用途 |
|---------|---------|
| `h3` | HTTP 框架 |
| `rou3` | 路由匹配 |
| `c12` | 配置加载 |
| `citty` | CLI 框架 |
| `hookable` | 钩子系统 |
| `unstorage` | 存储抽象 |
| `unenv` | 运行时 polyfill |
| `defu` | 配置合并 |
| `pathe` | 路径操作 |
| `consola` | 日志记录 |
| `env-runner` | Worker 管理 |
