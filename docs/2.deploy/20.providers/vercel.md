# Vercel

> 将 Nitro 应用程序部署到 Vercel Functions。

**预设:** `vercel`

:read-more{title="Vercel Functions" to="https://vercel.com/docs/functions"}

::note
可以通过 [零配置](/deploy/#zero-config-providers) 集成此提供程序。
::

::tip
建议启用 [Fluid compute](https://vercel.com/docs/functions/fluid-compute)。
::

## 使用 git 部署

1. 将您的代码推送到 git 仓库（GitHub、GitLab、Bitbucket）。
2. [将您的项目导入](https://vercel.com/new) 到 Vercel。
3. Vercel 将检测到您正在使用 Nitro，并将启用您的部署所需的正确设置。
4. 您的应用程序已部署！

在您的项目导入和部署后，之后对分支的所有推送将生成 [预览部署](https://vercel.com/docs/concepts/deployments/environments#preview)，而对生产分支（通常为“main”）所做的所有更改将导致 [生产部署](https://vercel.com/docs/concepts/deployments/environments#production)。

了解更多关于 Vercel 的 [Git 集成](https://vercel.com/docs/concepts/git)。

## Monorepo

Vercel 支持 Monorepo。然而，必须在“项目设置 > 常规”选项卡中指定自定义的 "[根目录](https://vercel.com/docs/deployments/configure-a-build#root-directory)"。确保勾选“包括根目录外的源文件”。

“根目录”的示例值： `apps/web` 或 `packages/app`。

## API 路由

Nitro `/api` 目录与 Vercel 不兼容。相反，您应该使用：

- `server/routes/api/` 进行独立使用

## 自定义构建输出配置

您可以通过在 `nitro.config` 中使用 `vercel.config` 键提供额外的 [构建输出配置](https://vercel.com/docs/build-output-api/v3)。这将与内置自动生成的配置合并。

## 按需增量静态再生 (ISR)

按需重新验证允许您随时清除 ISR 路由的缓存，而无需等待背景重新验证所需的时间间隔。

要按需重新验证页面：

1. 创建一个环境变量来存储重新验证密钥
    - 您可以使用命令 `openssl rand -base64 32` 或 [生成一个密钥](https://generate-secret.vercel.app/32) 来生成一个随机值。

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

3. 要触发“按需增量静态再生（ISR）”并重新验证指向预渲染函数的路径，请向该路径发出带有头部 x-prerender-revalidate: `bypassToken` 的 GET 或 HEAD 请求。当带有此头部的预渲染函数端点被访问时，缓存将被重新验证。下一次对该函数的请求应返回最新的响应。

### 通过路由规则进行细粒度 ISR 配置

默认情况下，缓存会忽略查询参数。

您可以向 `isr` 路由规则传递一个选项对象来配置缓存行为。

- `expiration`: 缓存资产在通过调用无服务器函数重新生成之前的过期时间（以秒为单位）。将值设置为 `false`（或 `isr: true` 路由规则）表示它永远不会过期。
- `group`: 资产的组编号。具有相同组编号的预渲染资产将同时重新验证。
- `allowQuery`: 将独立缓存的查询字符串参数名称列表。
  - 如果为空数组，则不考虑查询值进行缓存。
  - 如果 `undefined`，每个唯一的查询值将独立缓存。
  - 对于通配符 `/**` 路由规则，`url` 始终被添加

- `passQuery`: 当 `true` 时，查询字符串将出现在传递给调用函数的 `request` 参数中。`allowQuery` 筛选器仍然适用。

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