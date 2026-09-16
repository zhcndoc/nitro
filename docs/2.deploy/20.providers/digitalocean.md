# DigitalOcean

> 将 Nitro 应用部署到 DigitalOcean。

**预设：** `digital_ocean`

:read-more{title="DigitalOcean App Platform" to="https://docs.digitalocean.com/products/app-platform/"}

## 设置应用

1. 按照[指南](https://docs.digitalocean.com/products/app-platform/how-to/create-apps/)创建一个新的 DigitalOcean 应用。

1. 接下来，配置环境变量。在您的应用设置中，确保设置了以下应用级环境变量：

   ```bash
   NITRO_PRESET=digital_ocean
   ```

   [更多信息](https://docs.digitalocean.com/products/app-platform/how-to/use-environment-variables/).

1. 在应用的 `package.json` 中设置 `engines.node` 字段，以便 DigitalOcean 使用受支持的 Node.js 版本：

   ```json
   {
      "engines": {
         "node": "20.x"
      }
   }
   ```

   [查看更多信息](https://docs.digitalocean.com/products/app-platform/languages-frameworks/nodejs/#node-version).

1. 在 `package.json` 中添加启动脚本，以便 DigitalOcean 知道构建后要运行的命令：

   ```json
   {
      "scripts": {
         "start": "node .output/server/index.mjs"
      }
   }
   ```

1. 最后，将此启动脚本添加到 DigitalOcean 应用的运行命令中。转到 `Components > Settings > Commands`，点击“Edit”，然后添加 `npm run start`。

现在，您的应用应该已经通过 DigitalOcean 生成的 URL 上线，您可以继续阅读[其余的 DigitalOcean 部署指南](https://docs.digitalocean.com/products/app-platform/how-to/manage-deployments/)。
