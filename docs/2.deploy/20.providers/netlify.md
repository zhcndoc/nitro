# Netlify

> 将 Nitro 应用部署到 Netlify 函数或边缘。

**预设:** `netlify`

:read-more{title="Netlify 函数" to="https://www.netlify.com/platform/core/functions/"}

::note
与此提供商的集成可以通过 [零配置](/deploy/#zero-config-providers) 实现。
::

通常，部署到 Netlify 不需要任何配置。
Nitro 将自动检测您处于 [Netlify](https://www.netlify.com) 构建环境，并构建正确版本的服务器。

要启用 Netlify Functions 2.0 并使用其功能（例如流响应和 [Netlify Blobs](https://docs.netlify.com/blobs/overview/)），您需要在您的 nitro 配置文件中将兼容性日期设置为 `2024-05-07` 或更晚。

::code-group

```ts [nitro.config.ts]
export default defineNitroConfig({
    compatibilityDate: "2024-05-07",
})
```

```ts [nuxt.config.ts]
export default defineNuxtConfig({
    compatibilityDate: "2024-05-07",
})
```

::

对于新网站，Netlify 将检测您正在使用 Nitro，并将发布目录设置为 `dist`，构建命令设置为 `npm run build`。

如果您正在升级现有网站，您应检查这些设置，并在需要时进行更新。

如果您想添加自定义重定向，可以使用 [`routeRules`](/config#routerules) 或通过在 `public` 目录中添加一个 [`_redirects`](https://docs.netlify.com/routing/redirects/#syntax-for-the-redirects-file) 文件来实现。

对于部署，只需按照通常的方式将代码推送到您的 git 仓库 [进行 Netlify 部署](https://docs.netlify.com/configure-builds/get-started/)。

::note{type="note"}
确保在创建新项目时，将发布目录设置为 `dist`。
::

## Netlify 边缘函数

**预设:** `netlify_edge`

Netlify 边缘函数使用 Deno 和强大的 V8 JavaScript 运行时，让您能够运行全球分布的函数，以获取最快的响应时间。

:read-more{title="Netlify 边缘函数" to="https://docs.netlify.com/edge-functions/overview/"}

Nitro 输出可以直接在边缘运行服务器，更接近您的用户。

::note{type="note"}
确保在创建新项目时，将发布目录设置为 `dist`。
::

## 按需构建器

**预设:** `netlify_builder`

::warning
**注意:** 此预设已被弃用。请使用带有 `isr` 路由规则的 `netlify` 预设。
::

按需构建器是无服务器函数，用于根据需要生成网页内容，并自动缓存到 Netlify 的边缘 CDN。它们使您能够在用户首次访问页面时为您的网站生成页面，并在边缘缓存以供后续访问。

:read-more{title="Netlify 按需构建器" to="https://docs.netlify.com/configure-builds/on-demand-builders/"}

## 自定义部署配置

您可以使用 `nitro.config` 中的 `netlify` 键提供额外的部署配置。它将与内置的自动生成配置合并。目前唯一支持的值是 `images.remote_images`，用于 [配置 Netlify 图片 CDN](https://docs.netlify.com/image-cdn/create-integration/)。
