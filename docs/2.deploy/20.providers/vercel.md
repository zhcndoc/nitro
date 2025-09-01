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

- 独立的 `server/routes/api/`

## 自定义构建输出配置

您可以通过在 `nitro.config` 中使用 `vercel.config` 键来提供额外的 [构建输出配置](https://vercel.com/docs/build-output-api/v3)，该配置将与内置自动生成的配置合并。

## 按需增量静态再生 (ISR)

按需重新验证允许你在任意时间清除 ISR 路由缓存，无需等待后台重新验证的时间间隔。

要按需重新验证页面：

1. 创建一个环境变量以存储重新验证密钥
   - 您可以使用命令 `openssl rand -base64 32` 或通过 [生成一个密钥](https://generate-secret.vercel.app/32) 来生成一个随机值。

2. 更新您的配置：

    ::code-group

    ```ts [nitro.config.ts]
    export default defineNitroConfig({
      vercel: {
        config: {
          bypassToken: process.env.VERCEL_BYPASS_TOKEN
        }
      }
    })
    ```

    ```ts [nuxt.config.ts]
    export default defineNuxtConfig({
      nitro: {
        vercel: {
          config: {
            bypassToken: process.env.VERCEL_BYPASS_TOKEN
          }
        }
      }
    })
    ```

    ::

3. 要触发“按需增量静态再生（ISR）”并重新验证指向预渲染函数的路径，向该路径发出带有头部 `x-prerender-revalidate: bypassToken` 的 GET 或 HEAD 请求。当带有此头部的预渲染函数端点被访问时，缓存将被重新验证。之后的请求将返回最新响应。

### 通过路由规则进行细粒度 ISR 配置

默认情况下，缓存将忽略查询参数。

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