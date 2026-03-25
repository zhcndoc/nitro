# Netlify

> 将 Nitro 应用部署到 Netlify 函数或边缘。

**预设：** `netlify`

<read-more title="Netlify 函数" to="https://www.netlify.com/platform/core/functions/">



</read-more>

<note>

与该提供商的集成可以通过[零配置](/deploy/#zero-config-providers)实现。

</note>

通常，部署到 Netlify 不需要任何配置。
Nitro 会自动检测你处于 [Netlify](https://www.netlify.com) 构建环境，并构建正确的服务器版本。

对于新站点，Netlify 会检测到你正在使用 Nitro，并将发布目录设置为 `dist`，构建命令设置为 `npm run build`。

如果你要升级现有站点，应该检查这些设置，并在需要时更新它们。

如果你想添加自定义重定向，可以使用 [`routeRules`](/config#routerules) 或在 `public` 目录中添加 [`_redirects`](https://docs.netlify.com/routing/redirects/#syntax-for-the-redirects-file) 文件来实现。

部署时，只需推送到你的 git 仓库[按照你通常在 Netlify 上的做法](https://docs.netlify.com/configure-builds/get-started/)即可。

<note type="note">

创建新项目时，请确保发布目录设置为 `dist`。

</note>

## Netlify 边缘函数

**预设：** `netlify_edge`

Netlify Edge Functions 使用 Deno 和强大的 V8 JavaScript 运行时，让你可以运行全局分布的函数，以实现最快的响应时间。

<read-more title="Netlify 边缘函数" to="https://docs.netlify.com/edge-functions/overview/">



</read-more>

Nitro 输出可以直接在边缘运行服务器。离你用户更近。

<note type="note">

创建新项目时，请确保发布目录设置为 `dist`。

</note>

## 自定义部署配置

你可以在 `nitro.config` 中使用 `netlify` 键提供额外的部署配置。它将与内置的自动生成的配置合并。目前唯一支持的值是 `images.remote_images`，用于[配置 Netlify Image CDN](https://docs.netlify.com/image-cdn/create-integration/)。
