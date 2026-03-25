部署 - Nitro 中文文档

[![Nitro 中文文档 logo](/icon.svg)Nitro 中文文档](/)

v3 (beta)

- [Docs](/docs)
- [部署](/deploy)
- [配置](/config)
- [示例](/examples)
- [Blog](/blog)
- [](/)

Search…```k`

[Github](https://github.com/zhcndoc/nitro)

- [Docs](/docs)
- [部署](/deploy)
- [配置](/config)
- [示例](/examples)
- [](/)

- [部署](/deploy)
- Runtimes
  - [Node.js](/deploy/runtimes/node)
  - [Bun](/deploy/runtimes/bun)
  - [Deno](/deploy/runtimes/deno)
- Providers
  - [Alwaysdata](/deploy/providers/alwaysdata)
  - [AWS Lambda](/deploy/providers/aws)
  - [AWS Amplify](/deploy/providers/aws-amplify)
  - [Azure](/deploy/providers/azure)
  - [Cleavr](/deploy/providers/cleavr)
  - [Cloudflare](/deploy/providers/cloudflare)
  - [Deno Deploy](/deploy/providers/deno-deploy)
  - [DigitalOcean](/deploy/providers/digitalocean)
  - [Firebase](/deploy/providers/firebase)
  - [Flightcontrol](/deploy/providers/flightcontrol)
  - [Genezio](/deploy/providers/genezio)
  - [GitHub Pages](/deploy/providers/github-pages)
  - [GitLab Pages](/deploy/providers/gitlab-pages)
  - [Heroku](/deploy/providers/heroku)
  - [IIS](/deploy/providers/iis)
  - [Koyeb](/deploy/providers/koyeb)
  - [Netlify](/deploy/providers/netlify)
  - [Platform.sh](/deploy/providers/platform-sh)
  - [Render.com](/deploy/providers/render)
  - [StormKit](/deploy/providers/stormkit)
  - [Vercel](/deploy/providers/vercel)
  - [Zeabur](/deploy/providers/zeabur)
  - [Zephyr Cloud](/deploy/providers/zephyr)
  - [Zerops](/deploy/providers/zerops)

# 部署

Copy Page

了解更多关于 Nitro 部署提供商的信息。

Nitro 可以从同一代码库生成适合不同托管提供商的不同输出格式。 使用内置的预设，你可以轻松配置 Nitro 来调整其输出格式，几乎不需要额外的代码或配置！

## [默认输出](#默认输出)

默认的生产输出预设是 [Node.js 服务器](/deploy/runtimes/node)。

在开发模式下运行 Nitro 时，Nitro 将始终使用一个名为 `nitro-dev` 的特殊预设，该预设使用 Node.js 和 ESM，在隔离的 Worker 环境中运行，行为尽可能接近生产环境。

## [零配置提供商](#零配置提供商)

使用 CI/CD 部署到生产环境时，Nitro 会尝试自动检测提供商环境并设置正确的配置，无需任何额外的配置。目前，以下提供商可以通过零配置自动检测。

- [aws amplify](/deploy/providers/aws-amplify)
- [azure](/deploy/providers/azure)
- [cloudflare](/deploy/providers/cloudflare)
- [firebase app hosting](/deploy/providers/firebase#firebase-app-hosting)
- [netlify](/deploy/providers/netlify)
- [stormkit](/deploy/providers/stormkit)
- [vercel](/deploy/providers/vercel)
- [zeabur](/deploy/providers/zeabur)

对于 Turborepo 用户，零配置检测会受到其严格环境模式（Strict Environment Mode）的干扰。你可能需要显式允许这些变量，或使用松散环境模式（使用 `--env-mode=loose` 标志）。

其他内置提供商可以通过显式预设使用，包括 [zephyr](/deploy/providers/zephyr)。

## [更改部署预设](#更改部署预设)

如果你需要针对特定提供商构建 Nitro，可以通过定义名为 `NITRO_PRESET` 或 `SERVER_PRESET` 的环境变量来实现，也可以通过更新 Nitro [配置](/docs/configuration) 或使用 `--preset` 参数。

对于依赖 CI/CD 的部署，建议使用环境变量方法。

**示例：** 定义 `NITRO_PRESET` 环境变量

```
nitro build --preset cloudflare_pages
```

**示例：** 更新 `nitro.config.ts` 文件

```
import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  preset: 'cloudflare_pages'
})
```

## [兼容性日期](#兼容性日期)

部署提供商会定期更新其运行时行为。Nitro 预设会更新以支持这些新功能。

为了防止破坏现有部署，Nitro 使用兼容性日期。这些日期让你在项目创建时锁定行为。你也可以在准备好时选择加入未来的更新。

当你创建新项目时，`compatibilityDate` 会被设置为当前日期。此设置保存在你的项目配置中。

你应该定期更新兼容性日期。更新后始终彻底测试你的部署。下面是一系列关键日期及其影响。

- [Edit this page ](https://github.com/zhcndoc/nitro/edit/main/docs/2.deploy/0.index.md)

  

本页目录

本页目录

- [默认输出](#默认输出)
- [零配置提供商](#零配置提供商)
- [更改部署预设](#更改部署预设)
- [兼容性日期](#兼容性日期)

![Nitro 中文文档 logo](/icon.svg)

[Discord](https://discord.nitro.build) [Bluesky](https://bsky.app/profile/nitro.build) [X](https://x.com/nitrojsdev) [Github](https://github.com/zhcndoc/nitro)

[Nitro 中文文档](https://github.com/zhcndoc/nitro)  构建全栈 Vite 应用程序.