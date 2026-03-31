# Vercel

> 将 Nitro 应用部署到 Vercel。

**预设：** `vercel`

:read-more{title="Vercel 框架支持" to="https://vercel.com/docs/frameworks"}

::note
与此提供商的集成可以通过 [零配置](/deploy/#zero-config-providers) 实现。
::

## 入门指南

部署到 Vercel 具有以下功能：
- [预览部署](https://vercel.com/docs/deployments/environments)
- [流体计算](https://vercel.com/docs/fluid-compute)
- [可观测性](https://vercel.com/docs/observability)
- [Vercel 防火墙](https://vercel.com/docs/vercel-firewall)

以及更多功能。了解更多请参阅 [Vercel 文档](https://vercel.com/docs)。

### 通过 Git 部署

Vercel 支持 Nitro 零配置部署。[立即部署 Nitro 到 Vercel](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fvercel%2Ftree%2Fmain%2Fexamples%2Fnitro)。

## API 路由

Nitro 的 `/api` 目录与 Vercel 不兼容。相反，你应该使用：

- `routes/api/` 用于独立使用

## Bun 运行时

:read-more{title="Vercel" to="https://vercel.com/docs/functions/runtimes/bun"}

你可以通过在 `nitro.config` 中使用 `vercel.functions` 键指定运行时，从而使用 [Bun](https://bun.com) 替代 Node.js：

```ts [nitro.config.ts]
export default defineNitroConfig({
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

使用 `vercel.functionRules` 来覆盖特定路由的 [无服务器函数设置](https://vercel.com/docs/build-output-api/primitives#serverless-function-configuration)。每个键是一个路由模式，其值是一个部分函数配置对象，它会与基础的 `vercel.functions` 配置合并。注意：路由配置中的数组属性（例如 `regions`）将替换基础配置数组，而不是合并它们。

当某些路由需要不同的资源限制、区域或功能（如 [Vercel Queues 触发器](https://vercel.com/docs/queues)）时，这非常有用。

```ts [nitro.config.ts]
import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
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
export default defineNitroConfig({
  routeRules: {
    // 在 CDN 级别代理 — 无需函数调用
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

- `headers` — 对外部上游请求设置的自定义请求头
- `forwardHeaders` / `filterHeaders` — 请求头过滤
- `fetchOptions` — 自定义 fetch 选项
- `cookieDomainRewrite` / `cookiePathRewrite` — Cookie 操作
- `onResponse` — 响应回调

::note
通过 `headers` 选项在路由规则上定义的响应头仍然会应用到 CDN 级别的重写。只有请求级别的 `ProxyOptions.headers`（发送到上游的）才需要运行时代理。
::

## 定时任务（Cron 作业）

:read-more{title="Vercel 定时任务" to="https://vercel.com/docs/cron-jobs"}

Nitro 会在构建时自动将你的 [`scheduledTasks`](/docs/tasks#scheduled-tasks) 配置转换为 [Vercel 定时任务](https://vercel.com/docs/cron-jobs)。在你的 Nitro 配置中定义计划任务并部署 — 无需手动配置 `vercel.json` 的 cron 设置。

```ts [nitro.config.ts]
import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
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

为防止未经授权访问 cron 处理程序，请在 Vercel 项目设置中设置 `CRON_SECRET` 环境变量。当设置了 `CRON_SECRET` 时，Nitro 会在每次 cron 调用时验证 `Authorization` 请求头。

## 自定义构建输出配置

你可以在 `nitro.config` 中使用 `vercel.config` 键提供额外的 [构建输出配置](https://vercel.com/docs/build-output-api/v3)。它将与内置的自动生成配置合并。

## 按需增量静态再生（ISR）

按需重新验证允许你随时清除 ISR 路由的缓存，无需等待后台重新验证所需的时间间隔。

要按需重新验证页面：

1. 创建一个环境变量来存储重新验证密钥
    - 你可以使用命令 `openssl rand -base64 32` 或 [生成密钥](https://generate-secret.vercel.app/32) 来生成随机值。

2. 更新你的配置：

    ```ts [nitro.config.ts]
    import { defineNitroConfig } from "nitro/config";

    export default defineNitroConfig({
      vercel: {
        config: {
          bypassToken: process.env.VERCEL_BYPASS_TOKEN
        }
      }
    })
    ```

3. 要触发"按需增量静态再生（ISR）"并重新验证预渲染函数的路径，请向该路径发送带有 x-prerender-revalidate: `bypassToken` 请求头的 GET 或 HEAD 请求。当使用此请求头访问该预渲染函数端点时，缓存将被重新验证。对该函数的下一个请求应返回新鲜响应。

### 通过路由规则进行细粒度 ISR 配置

默认情况下，查询参数会影响缓存键，但不会传递给路由处理程序，除非另有指定。

你可以向 `isr` 路由规则传递一个选项对象来配置缓存行为。

- `expiration`：在调用无服务器函数重新生成缓存资源之前的过期时间（以秒为单位）。将值设置为 `false`（或 `isr: true` 路由规则）意味着永不过期。
- `group`：资源的分组编号。具有相同分组编号的预渲染资源将同时被重新验证。
- `allowQuery`：将被独立缓存的查询字符串参数名称列表。
  - 如果为空数组，查询值将不被考虑用于缓存。
  - 如果为 `undefined`，每个唯一的查询值将被独立缓存。
  - 对于通配符 `/**` 路由规则，`url` 始终被添加
- `passQuery`：当为 `true` 时，查询字符串将出现在传递给被调用函数的 `request` 参数中。`allowQuery` 过滤器仍然适用。
- `exposeErrBody`：当为 `true` 时，无论状态码如何（包括错误状态码），都会暴露响应体。（默认 `false`

```ts
export default defineNitroConfig({
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
