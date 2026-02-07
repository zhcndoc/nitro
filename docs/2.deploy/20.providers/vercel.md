# Vercel

> 将 Nitro 应用部署到 Vercel。

**预设:** `vercel`

:read-more{title="Vercel 框架支持" to="https://vercel.com/docs/frameworks"}

::note
可以通过 [零配置](/deploy/#zero-config-providers) 集成此提供程序。
::

## 入门指南

部署到 Vercel 具有以下特点：
- [预览部署](https://vercel.com/docs/deployments/environments)
- [流体计算](https://vercel.com/docs/fluid-compute)
- [可观察性](https://vercel.com/docs/observability)
- [Vercel 防火墙](https://vercel.com/docs/vercel-firewall)

以及更多功能。了解更多信息请参阅 [Vercel 文档](https://vercel.com/docs)。

### 使用 Git 部署

Vercel 支持 Nitro 的零配置部署。[立即将 Nitro 部署到 Vercel](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fvercel%2Ftree%2Fmain%2Fexamples%2Fnitro)。

## API 路由

Nitro 的 `/api` 目录与 Vercel 不兼容。相反，您应使用：

- `routes/api/`，用于独立使用

## Bun 运行时

:read-more{title="Vercel" to="https://vercel.com/docs/functions/runtimes/bun"}

您可以通过在 `nitro.config` 内使用 `vercel.functions` 键指定运行时，来使用 [Bun](https://bun.zhcndoc.com) 替代 Node.js：

```ts [nitro.config.ts]
export default defineNitroConfig({
  vercel: {
    functions: {
      runtime: "bun1.x"
    }
  }
})
```

或者，如果您在 `vercel.json` 中指定了 `bunVersion` 属性，Nitro 也会自动检测 Bun：

```json [vercel.json]
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "bunVersion": "1.x"
}
```

## 代理路由规则

Nitro 在 Vercel 上通过构建时生成 [CDN 级别的重写](https://vercel.com/docs/rewrites) 自动优化 `proxy` 路由规则。这意味着匹配的请求会在边缘节点被代理，而无需调用无服务器函数，从而减少延迟和成本。

```ts [nitro.config.ts]
export default defineNitroConfig({
  routeRules: {
    // CDN 级别代理 — 无函数调用
    "/api/**": {
      proxy: "https://api.example.com/**",
    },
  },
});
```

### CDN 重写生效的条件

当满足 **以下所有条件** 时，代理规则会被卸载到 Vercel CDN 重写：

- 目标是一个 **外部 URL**（以 `http://` 或 `https://` 开头）。
- 规则上没有设置高级的 `ProxyOptions`。

### 回退到运行时代理

当代理规则使用了以下任何一个 `ProxyOptions`，Nitro 会将其保留为由无服务器函数处理的运行时代理：

- `headers` — 发送给上游请求的自定义头
- `forwardHeaders` / `filterHeaders` — 头过滤
- `fetchOptions` — 自定义 fetch 选项
- `cookieDomainRewrite` / `cookiePathRewrite` — cookie 操作
- `onResponse` — 响应回调

::note
通过路由规则 `headers` 选项定义的响应头仍然会应用于 CDN 级别重写。只有请求级别的 `ProxyOptions.headers`（发送到上游）需要运行时代理。
::

## 自定义构建输出配置

您可以通过在 `nitro.config` 中使用 `vercel.config` 键来提供额外的 [构建输出配置](https://vercel.com/docs/build-output-api/v3)，该配置将与内置自动生成的配置合并。

## 按需增量静态再生 (ISR)

按需重新验证允许你在任意时间清除 ISR 路由缓存，无需等待后台重新验证的时间间隔。

要按需重新验证页面：

1. 创建一个环境变量以存储重新验证密钥
   - 您可以使用命令 `openssl rand -base64 32` 或通过 [生成一个密钥](https://generate-secret.vercel.app/32) 来生成一个随机值。

2. 更新您的配置：

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

3. 要触发“按需增量静态再生（ISR）”并重新验证到预渲染函数的路径，请使用带有 x-prerender-revalidate: `bypassToken` 头的 GET 或 HEAD 请求访问该路径。当使用此请求头访问该预渲染函数端点时，缓存将被重新验证。下一次对该函数的请求应该返回最新的响应。

### 通过路由规则进行细粒度 ISR 配置

默认情况下，查询参数会影响缓存键，但不会传递给路由处理器，除非另有指定。

您可以向 `isr` 路由规则传递一个选项对象来配置缓存行为。

- `expiration`：缓存资产在通过调用无服务器函数重新生成之前的过期时间（单位：秒）。将其设置为 `false`（或路由规则写为 `isr: true`）表示缓存永不过期。
- `group`：资产的组编号。具有相同组编号的预渲染资产将会同时重新验证。
- `allowQuery`：允许独立缓存的查询参数名称列表。
  - 如果是空数组，则查询参数值不会影响缓存。
  - 如果是 `undefined`，则每个不同的查询参数值会被独立缓存。
  - 对于通配符路由 `/**`，`url` 参数始终被添加。

- `passQuery`：当设置为 `true`，查询字符串将包含在传递给调用函数的 `request` 参数中。`allowQuery` 过滤依然生效。

```ts
export default defineNitroConfig({
  routeRules: {
    "/products/**": {
      isr: {
        allowQuery: ["q"],
        passQuery: true,
      },
    },
  },
});
```