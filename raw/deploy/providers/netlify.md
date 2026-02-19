# Netlify

> 将 Nitro 应用部署到 Netlify 函数或边缘。

**预设:** `netlify`

<read-more title="Netlify 函数" to="https://www.netlify.com/platform/core/functions/">



</read-more>

<note>

与该提供商的集成可以通过 [零配置](/deploy/#zero-config-providers) 实现。

</note>

通常，部署到 Netlify 不需要任何配置。
Nitro 会自动检测您处于 [Netlify](https://www.netlify.com) 构建环境并构建正确版本的服务器。

对于新站点，Netlify 会检测到您正在使用 Nitro，并将发布目录设置为 `dist`，构建命令设置为 `npm run build`。

如果您正在升级现有站点，请检查这些设置并根据需要进行更新。

如果您想添加自定义重定向，可以使用 [`routeRules`](/config#routerules) 或通过将 [`_redirects`](https://docs.netlify.com/routing/redirects/#syntax-for-the-redirects-file) 文件添加到您的 `public` 目录来实现。

对于部署，只需像往常一样将代码推送到您的 git 存储库 [以进行 Netlify 部署](https://docs.netlify.com/configure-builds/get-started/)。

<note type="note">

在创建新项目时，请确保发布目录设置为 `dist`。

</note>

## Netlify 边缘函数

**预设:** `netlify_edge`

Netlify 边缘函数使用 Deno 和强大的 V8 JavaScript 运行时，让您为实现最快的响应时间运行全球分布的函数。

<read-more title="Netlify 边缘函数" to="https://docs.netlify.com/edge-functions/overview/">



</read-more>

Nitro 输出可以直接在边缘运行服务器，更靠近您的用户。

<note type="note">

在创建新项目时，请确保发布目录设置为 `dist`。

</note>

## 自定义部署配置

您可以通过在 `nitro.config` 中使用 `netlify` 键来提供额外的部署配置。它将与内置自动生成的配置合并。当前唯一支持的值是 `images.remote_images`，用于 [配置 Netlify 图像 CDN](https://docs.netlify.com/image-cdn/create-integration/)。
