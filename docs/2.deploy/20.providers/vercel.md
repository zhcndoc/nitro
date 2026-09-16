# Vercel

> 将 Nitro 应用部署到 Vercel。

**预设：** `vercel`

:read-more{title="Vercel 框架支持" to="https://vercel.com/docs/frameworks"}

::note
与此提供商的集成支持[零配置](/deploy#zero-config-providers)。
::

## 入门指南

部署到 Vercel 具有以下功能以及其他特性：

- [预览部署](https://vercel.com/docs/deployments/environments)
- [流式计算](https://vercel.com/docs/fluid-compute)
- [可观测性](https://vercel.com/docs/observability)
- [Vercel 防火墙](https://vercel.com/docs/vercel-firewall)

在 [Vercel 文档](https://vercel.com/docs)中了解更多信息。

### 通过 Git 部署

Vercel 支持 Nitro 零配置部署。[立即将 Nitro 部署到 Vercel](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fvercel%2Ftree%2Fmain%2Fexamples%2Fnitro)。

## API 路由

Nitro 顶层的 `/api` 目录与 Vercel 不兼容。请改用 `routes/api/` 目录。

## Bun 运行时

:read-more{title="Vercel" to="https://vercel.com/docs/functions/runtimes/bun"}

你可以通过在 `nitro.config` 中使用 `vercel.functions` 键指定运行时，从而使用 [Bun](https://bun.com) 替代 Node.js：

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  vercel: {
    functions: {
      runtime: "bun1.x"
    }
  }
})
```

或者，如果你在 `vercel.json` 中指定了 `bunVersion` 属性，Nitro 也会自动检测 Bun：

```json [vercel.json]
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "bunVersion": "1.x"
}
```

## 每条路由的函数配置

使用 `vercel.functionRules` 为特定路由覆盖[无服务器函数设置](https://vercel.com/docs/build-output-api/primitives#serverless-function-configuration)。每个键都是一个路由模式，其值是一个部分函数配置对象，会与基础的 `vercel.functions` 配置合并。

::note
路由配置中的数组属性（例如 `regions`）会替换基础配置中的数组，而不是与其合并。
::

当某些路由需要不同的资源限制、区域或功能（如 [Vercel Queues 触发器](https://vercel.com/docs/queues)）时，这非常有用。

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  vercel: {
    functionRules: {
      "/api/heavy-computation": {
        maxDuration: 800,
        memory: 4096,
      },
      "/api/regional": {
        regions: ["lhr1", "cdg1"],
      },
      "/api/queues/process-order": {
        experimentalTriggers: [{ type: "queue/v2beta", topic: "orders" }],
      },
    },
  },
});
```

路由模式支持通过 [rou3](https://github.com/h3js/rou3) 匹配通配符（例如，`/api/slow/**` 匹配 `/api/slow/` 下的所有路由）。

## 代理路由规则

Nitro 通过在构建时生成 [CDN 级别的重写规则](https://vercel.com/docs/rewrites)，自动优化 Vercel 上的 `proxy` 路由规则。这意味着匹配的请求将在边缘进行代理，而无需调用无服务器函数，从而降低延迟和成本。

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  routeRules: {
    // Proxied at CDN level, no function invocation
    "/api/**": {
      proxy: "https://api.example.com/**",
    },
  },
});
```

### 何时应用 CDN 重写

当以下**所有**条件都为真时，代理规则会被卸载到 Vercel CDN 重写：

- 目标是**外部 URL**（以 `http://` 或 `https://` 开头）。
- 规则上没有设置高级 `ProxyOptions`。

### 回退到运行时代理

当代理规则使用了以下任何 `ProxyOptions` 时，Nitro 会将其保留为由无服务器函数处理的运行时代理：

- `headers`：对发往上游的请求使用自定义请求头
- `forwardHeaders` / `filterHeaders`：请求头过滤
- `fetchOptions`：自定义 fetch 选项
- `cookieDomainRewrite` / `cookiePathRewrite`：Cookie 操作
- `onResponse`：响应回调

::note
通过 `headers` 选项在路由规则上定义的响应头仍然会应用到 CDN 级别的重写。只有请求级别的 `ProxyOptions.headers`（发送到上游的）才需要运行时代理。
::

## 定时任务（Cron 作业）

:read-more{title="Vercel 定时任务" to="https://vercel.com/docs/cron-jobs"}

Nitro 会在构建时自动将你的 [`scheduledTasks`](/docs/tasks#scheduled-tasks) 配置转换为 [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)。在 Nitro 配置中定义计划并进行部署。无需手动配置 `vercel.json` 中的 Cron。

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  experimental: {
    tasks: true
  },
  scheduledTasks: {
    // 每小时运行 `cms:update`
    '0 * * * *': ['cms:update'],
    // 每天午夜运行 `db:cleanup`
    '0 0 * * *': ['db:cleanup']
  }
})
```

### 安全化 Cron 作业端点

:read-more{title="保护 Cron 作业" to="https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs"}

要防止未经授权访问 Cron 处理程序，请在 Vercel 项目设置中设置 `CRON_SECRET` 环境变量。设置 `CRON_SECRET` 后，Nitro 会验证每次 Cron 调用中的 `Authorization` 请求头，并对不匹配的请求返回 `401`。

::warning
默认情况下不会设置 `CRON_SECRET`。与 [Vercel 自身的行为](https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs)一致，当缺少此变量时，Cron 端点（`/_vercel/cron`，可通过 [`vercel.cronHandlerRoute`](#other-preset-options) 配置）不会执行身份验证。任何知道该路由的人都可以通过 `x-vercel-cron-schedule` 请求头选择一个计划，并按需运行为其注册的任务。在 Vercel 上使用 `scheduledTasks` 时，请始终设置 `CRON_SECRET`。
::

## 队列

:read-more{title="Vercel 队列" to="https://vercel.com/docs/queues"}

Nitro 集成了 [Vercel Queues](https://vercel.com/docs/queues)，可用于异步处理消息。你可以在 Nitro 配置中定义队列主题，并通过 `vercel:queue` 运行时钩子处理传入消息。

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  // 独立模式下，Nitro 会扫描 `serverDir` 中的路由和插件
  serverDir: "./server",
  vercel: {
    queues: {
      triggers: [
        // 仅需 `topic`
        { topic: "notifications" },
        { topic: "orders", retryAfterSeconds: 60, initialDelaySeconds: 5 },
      ],
    },
  },
});
```

### 处理消息

在 [Nitro 插件](/docs/plugins)中使用 `vercel:queue` 钩子来处理传入的队列消息：

```ts [server/plugins/queues.ts]
import { definePlugin } from "nitro";

export default definePlugin((nitroApp) => {
  nitroApp.hooks.hook("vercel:queue", ({ message, metadata, send }) => {
    console.log(`[${metadata.topicName}] Message ${metadata.messageId}:`, message);
  });
});
```

### 从队列消息中运行任务

你可以使用队列消息来触发 [Nitro 任务](/docs/tasks)：

```ts [server/plugins/queues.ts]
import { definePlugin } from "nitro";
import { runTask } from "nitro/task";

export default definePlugin((nitroApp) => {
  nitroApp.hooks.hook("vercel:queue", async ({ message, metadata }) => {
    if (metadata.topicName === "orders") {
      await runTask("orders:fulfill", { payload: message });
    }
  });
});
```

### 发送消息

直接使用 `@vercel/queue` 包向指定主题发送消息：

```ts [server/routes/api/orders.post.ts]
import { defineHandler } from "nitro";
import { send } from "@vercel/queue";

export default defineHandler(async (event) => {
  const order = await event.req.json();
  const { messageId } = await send("orders", order);
  return { messageId };
});
```

### 本地开发

队列可在 `nitro dev` 中运行：`send()` 会将消息直接发送到你的 `vercel:queue` 钩子，因此你无需部署即可进行迭代。先使用 `vercel link` 和 `vercel env pull` 拉取你的 Vercel 环境，以便 SDK 进行身份验证。

如果你的钩子抛出异常，消息会在本地重试。设置了 `retryAfterSeconds` 时，重试会遵循每个触发器中的该配置。

## 自定义构建输出配置

你可以在 `nitro.config` 中使用 `vercel` 键下的 `vercel.config` 提供额外的[构建输出配置](https://vercel.com/docs/build-output-api/v3)。它会与内置的自动生成配置合并。

## 公共资源缓存

不会回退的公共资源目录（任何非根 `baseURL` 的默认行为）会由 Vercel CDN 直接从文件系统提供，并使用根据目录 `maxAge` 生成的 `Cache-Control` 请求头。没有显式设置 `maxAge` 的目录会缓存一年，这是 Vercel 特有的默认值，为保持向后兼容而保留。

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  publicAssets: [
    {
      baseURL: "build",
      dir: "public/build",
      maxAge: 3600,
    },
  ],
})
```

在此类基础路径下，如果请求不匹配任何文件，将返回带有 `Cache-Control: no-store` 的 `404`，而不会到达服务器函数。这与 Nitro 运行时的行为一致：在非回退基础路径下找不到资源时同样会返回 `404`，并可避免动态内容在资源 URL 下被提供，继而按照 `max-age` 的生命周期进行缓存。

设置 `maxAge: 0` 可选择退出一年的默认缓存时间。此时不会为该基础路径生成 `Cache-Control` 请求头：

```ts [nitro.config.ts]
export default defineConfig({
  publicAssets: [
    {
      baseURL: "build",
      dir: "public/build",
      maxAge: 0,
    },
  ],
})
```

针对该基础路径的 `cache-control` 路由规则优先级高于上述两项，因此可以使用自定义请求头提供目录内容：

```ts [nitro.config.ts]
export default defineConfig({
  routeRules: {
    "/build/**": { headers: { "cache-control": "no-cache" } },
  },
})
```

::note
回退目录不受影响，包括顶层的 `public/` 目录，该目录默认使用 `fallthrough: true`。其中缺失的文件仍会到达你的应用处理程序。
::

:read-more{to="/docs/assets"}

## 不可变静态文件

::important
此功能目前仅在 Nitro v3 的 [nightly 发布频道](/docs/nightly)中可用。
::

<!-- :read-more{title="Immutable static files" to="https://vercel.com/docs/skew-protection"} -->

客户端构建资源（例如 JS 和 CSS 分块）可以作为**不可变静态文件**输出。这些文件会从保留的 `/_vercel/immutable/` 路径提供，因此可以跨部署共享，即使更新后的部署不再引用它们也能继续解析，从而改善跨部署缓存。

此功能需要选择启用。可以通过 `vercel.immutableStaticFiles` 选项启用，也可以设置 `NITRO_VERCEL_IMMUTABLE_STATIC_FILES_ENABLED` 环境变量。

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  vercel: {
    immutableStaticFiles: true
  }
})
```

启用后，Nitro 会在 `/_vercel/immutable/` 下输出基于内容寻址的构建资源。

::note
系统环境变量 [`VERCEL_HASH_SALT`](https://vercel.com/docs/environment-variables/system-environment-variables) 会计入生成的资源路径，从而提供轮换这些路径的方式。
::

::warning
不可变静态文件必须从保留的 `/_vercel/immutable/` 路径提供，因此在使用非根 `baseURL` 时不受支持。在这种情况下，Nitro 会跳过不可变输出，并在构建期间发出警告。
::

::note
此功能与 **Nitro + Vite** 集成开箱即用：Nitro 的 Vercel 预设会设置 `buildAssetsDir` 配置，Vite 插件会自动将其应用为客户端和服务器渲染构建的 `assetsDir`，因此所有生成的资源 URL 都会指向 `/_vercel/immutable/` 下。

客户端构建设置和框架必须自行应用 `nitro.options.buildAssetsDir`。将其用作客户端打包器的资源输出目录（基础路径），以便生成的资源 URL 输出到该路径下。否则，资源仍会输出到默认位置，不可变清单将无法匹配。
::

## 其他预设选项

Nitro 配置中的 `vercel` 键下提供了其他选项：

- `entryFormat`：Vercel Functions 的处理程序格式。`"web"`（默认）或 `"node"`。`node` 格式支持与 Node.js 特定 API 的兼容性（例如 `req.runtime.node`）。
- `regions`：边缘函数的[区域](https://vercel.com/docs/concepts/functions/edge-functions#edge-function-regions)列表。
- `skewProtection`：设置为 `false` 以禁用 Nitro 的 [skew protection](https://vercel.com/docs/skew-protection) 集成（当 Vercel 控制面板中启用 skew protection 时，默认启用）。
- `cronHandlerRoute`：与 `scheduledTasks` 一起使用的 Vercel Cron 处理程序端点的路由路径（默认值：`"/_vercel/cron"`）。

## 按需增量静态再生成（ISR）

按需重新验证允许你随时清除 ISR 路由的缓存，而无需等待后台重新验证所使用的时间间隔。

::warning
不要在同一路由上同时使用 `isr` 和 `prerender` 路由规则。预渲染页面会在构建时作为静态文件写入，Vercel 会在到达 ISR 函数之前从文件系统提供这些页面，因此 `isr` 永远不会生效。需要在部署后重新生成时，请单独使用 `isr`。
::

要按需重新验证页面：

1. 创建一个环境变量来存储重新验证密钥
    - 你可以使用命令 `openssl rand -base64 32` 或[生成密钥](https://generate-secret.vercel.app/32)来生成随机值。

2. 更新你的配置：

    ```ts [nitro.config.ts]
    import { defineConfig } from "nitro";

    export default defineConfig({
      vercel: {
        config: {
          bypassToken: process.env.VERCEL_BYPASS_TOKEN
        }
      }
    })
    ```

3. 要按需重新验证 Prerender Function 的路径，请向该路径发起 GET 或 HEAD 请求，并在请求中添加 `x-prerender-revalidate: <bypassToken>` 请求头。当使用此请求头访问 Prerender Function 端点时，缓存会被重新验证，对该函数的下一次请求应返回新鲜响应。

### 通过路由规则进行细粒度 ISR 配置

默认情况下，查询参数会影响缓存键，但不会传递给路由处理程序，除非另有指定。

你可以向 `isr` 路由规则传递选项对象来配置缓存行为：

- `expiration`：缓存资源在通过调用无服务器函数重新生成之前的过期时间（以秒为单位）。将值设置为 `false`（或使用 `isr: true` 路由规则）表示永不过期。
- `group`：资源的组编号。具有相同组编号的预渲染资源会同时重新验证。
- `allowQuery`：独立缓存的查询字符串参数名称列表。
  - 如果为空数组，则不会将查询值纳入缓存因素。
  - 如果为 `undefined`，则每个不同的查询值都会独立缓存。
  - 对于通配符 `/**` 路由规则，始终会添加 `url`。
- `passQuery`：为 `true` 时，查询字符串会出现在传递给所调用函数的 `request` 参数中。`allowQuery` 过滤器仍然适用。
- `exposeErrBody`：为 `true` 时，无论状态码为何都会公开响应正文，包括错误状态码（默认值：`false`）。

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  routeRules: {
    "/products/**": {
      isr: {
        allowQuery: ["q"],
        passQuery: true,
        exposeErrBody: true
      },
    },
  },
});
```
