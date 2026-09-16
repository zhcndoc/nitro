# Netlify

> 将 Nitro 应用部署到 Netlify 函数或边缘。

**预设：** `netlify`

:read-more{title="Netlify 函数" to="https://www.netlify.com/platform/core/functions/"}

::note
与此提供商的集成可以通过[零配置](/deploy#zero-config-providers)实现。
::

通常，将应用部署到 Netlify 不需要任何配置。
Nitro 会自动检测你处于 [Netlify](https://www.netlify.com) 构建环境中，并构建正确版本的服务器。

对于新站点，Netlify 会检测到你正在使用 Nitro，并将发布目录设置为 `dist`，将构建命令设置为 `npm run build`。如果你正在升级现有站点，请检查这些设置，并在需要时更新它们。

要添加自定义重定向，请使用 [`routeRules`](/config#routerules)，或将 [`_redirects`](https://docs.netlify.com/routing/redirects/#syntax-for-the-redirects-file) 文件添加到你的 `public` 目录中。

要进行部署，只需像平常为 Netlify 执行的那样推送到你的 git 仓库[即可](https://docs.netlify.com/configure-builds/get-started/)。

::note
创建新项目时，请确保发布目录设置为 `dist`
::

## Netlify 边缘函数

**预设：** `netlify_edge`

Netlify Edge Functions 使用 Deno 和强大的 V8 JavaScript 运行时，让你可以运行全局分布的函数，以实现最快的响应时间。

:read-more{title="Netlify 边缘函数" to="https://docs.netlify.com/edge-functions/overview/"}

使用此预设时，Nitro 会直接在边缘运行服务器，使其距离用户更近。

::note
创建新项目时，请确保发布目录设置为 `dist`
::

## Netlify 静态

**预设：** `netlify_static`

使用 `netlify_static` 预设预渲染你的应用，并将其作为完全静态站点（无函数）部署到 Netlify。

## 自定义部署配置

你可以在 `nitro.config` 中使用 `netlify.config` 键提供额外的部署配置。它遵循 [Netlify Frameworks API](https://docs.netlify.com/build/frameworks/frameworks-api/) 的 `config.json` 格式，并会与内置的自动生成配置合并。

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  netlify: {
    config: {
      // Netlify Image CDN remote images
      images: {
        remote_images: ["https://example.com/.*"],
      },
      // Custom headers
      headers: [{ for: "/static/*", values: { "cache-control": "public, max-age=31536000" } }],
      // Custom redirects
      redirects: [{ from: "/old", to: "/new", status: 301 }],
    },
  },
});
```

支持的键：

- `edge_functions`：其他[边缘函数声明](https://docs.netlify.com/edge-functions/declarations/)。
- `functions`：[函数配置](https://docs.netlify.com/build/frameworks/frameworks-api/#functions)，可以是全局配置，也可以按函数模式配置（例如 `included_files`）。
- `headers`：自定义[标头规则](https://docs.netlify.com/routing/headers/)。
- `images`：[Netlify Image CDN](https://docs.netlify.com/image-cdn/create-integration/) 配置（例如 `remote_images`）。
- `redirects`：自定义[重定向规则](https://docs.netlify.com/routing/redirects/)。

::note
顶层的 `netlify.images` 选项已弃用。请改用 `netlify.config.images`
::
