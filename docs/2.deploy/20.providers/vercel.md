# Vercel

> 将 Nitro 应用部署到 Vercel 函数或边缘。

**预设:** `vercel`

:read-more{title="Vercel 函数" to="https://vercel.com/docs/functions"}

::note
与此提供商的集成可以通过 [零配置](/deploy/#zero-config-providers) 实现。
::

## 使用 git 部署

1. 将代码推送到您的 git 仓库（GitHub、GitLab、Bitbucket）。
2. [将项目导入](https://vercel.com/new) 到 Vercel。
3. Vercel 会检测到您正在使用 Nitro，并会为您的部署启用正确的设置。
4. 您的应用程序已部署！

在您的项目导入并部署后，所有后续推送到分支将生成 [预览部署](https://vercel.com/docs/concepts/deployments/environments#preview)，对生产分支（通常是“main”）所做的所有更改将导致 [生产部署](https://vercel.com/docs/concepts/deployments/environments#production)。

了解更多关于 Vercel 的 [Git 集成](https://vercel.com/docs/concepts/git)。

## Monorepo

Vercel 支持单模块仓库。但是必须在“项目设置 > 常规”标签中指定自定义 “[根目录](https://vercel.com/docs/deployments/configure-a-build#root-directory)”。确保勾选“包括根目录外的源文件”。

“根目录”的值示例：`apps/web` 或 `packages/app`。

## Vercel 边缘函数

**预设:** `vercel_edge`

:read-more{title="Vercel 边缘函数" to="https://vercel.com/docs/concepts/functions/edge-functions"}

可以将您的 Nitro 应用程序直接部署到 [Vercel 边缘函数](https://vercel.com/docs/concepts/functions/edge-functions)。

要启用此目标，请将 `NITRO_PRESET` 环境变量设置为 `vercel_edge`。

## Vercel KV 存储

您可以轻松地将 [Vercel KV 存储](https://vercel.com/docs/storage/vercel-kv) 与 [Nitro 存储](/guide/storage) 一起使用。

::warning
此功能目前处于测试阶段。请查看 [驱动程序文档](https://unstorage.unjs.io/drivers/vercel-kv)。
::

1. 安装 `@vercel/kv` 依赖项：

```json [package.json]
{
  "devDependencies": {
    "@vercel/kv": "latest"
  }
}
```

更新您的配置：

::code-group

```ts [nitro.config.ts]
export default defineNitroConfig({
  storage: {
    data: { driver: 'vercelKV' }
  }
})
```

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  nitro: {
    storage: {
      data: { driver: 'vercelKV' }
    }
  }
})
```

::

::note
您需要设置 `KV_REST_API_URL` 和 `KV_REST_API_TOKEN` 环境变量，或者将 `url` 和 `token` 传递到驱动程序选项中。有关使用的信息，请查看 [驱动程序文档](https://unstorage.unjs.io/drivers/vercel-kv)。
::

现在您可以在任何事件处理程序中访问数据存储：

```ts
export default defineEventHandler(async (event) => {
  const dataStorage = useStorage("data");
  await dataStorage.setItem("hello", "world");
  return {
    hello: await dataStorage.getItem("hello"),
  };
});
```

## API 路由

Nitro 的 `/api` 目录与 Vercel 不兼容。
相反，您必须使用：

- `routes/api/` 进行独立使用
- `server/api/` 与 [Nuxt](https://nuxt.com) 一起使用。

## 自定义构建输出配置

您可以通过在 `nitro.config` 中使用 `vercel.config` 键提供额外的 [构建输出配置](https://vercel.com/docs/build-output-api/v3)。它将与内置的自动生成配置合并。

## 按需增量静态再生 (ISR)

按需重新验证允许您随时清除 ISR 路由的缓存，舍弃背景重新验证所需的时间间隔。

要按需重新验证页面：

1. 创建一个环境变量以存储重新验证密钥
    - 您可以使用命令 `openssl rand -base64 32` 或 [生成密钥](https://generate-secret.vercel.app/32) 来生成随机值。

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

3. 要触发“按需增量静态再生 (ISR)”并重新验证路径到 Prerender 函数，请使用带有 x-prerender-revalidate: `bypassToken` 头部向该路径发出 GET 或 HEAD 请求。当该 Prerender 函数端点使用此头部访问时，缓存将被重新验证。下一个对该函数的请求应返回一个新的响应。

### 通过路由规则进行细粒度 ISR 配置

默认情况下，查询参数被缓存忽略。

您可以传递一个选项对象到 `isr` 路由规则来配置缓存行为。

- `expiration`: 在秒内缓存资产将被重新生成之前的时间。将值设置为 `false`（或 `isr: true` 路由规则）意味着它将永远不会过期。
- `group`: 资产的组号。具有相同组号的预渲染资产将同时重新验证。
- `allowQuery`: 将独立缓存的查询字符串参数名称列表。
  - 如果为空数组，则不考虑查询值的缓存。
  - 如果为 `undefined`，每个唯一的查询值将独立缓存。
  - 对于通配符 `/**` 路由规则，`url` 总是被添加。

- `passQuery`: 当为 `true` 时，查询字符串将出现在传递给调用函数的 `request` 参数中。`allowQuery` 过滤器仍然适用。

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
