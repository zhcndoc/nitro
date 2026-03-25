# DigitalOcean

> 将 Nitro 应用部署到 DigitalOcean。

**预设：** `digital_ocean`

:read-more{title="Digital Ocean 应用平台" to="https://docs.digitalocean.com/products/app-platform/"}

## 设置应用

1. 按照[指南](https://docs.digitalocean.com/products/app-platform/how-to/create-apps/)创建一个新的 Digital Ocean 应用。

1. 接下来，你需要配置环境变量。在应用设置中，确保设置以下应用级环境变量：

   ```bash
   NITRO_PRESET=digital_ocean
   ```

   [更多信息](https://docs.digitalocean.com/products/app-platform/how-to/use-environment-variables/).

1. 你需要确保在应用的 `package.json` 中设置了 `engines.node` 字段，以确保 Digital Ocean 使用受支持的 Node.js 版本：

   ```json
   {
      "engines": {
         "node": "20.x"
      }
   }
   ```

   [查看更多信息](https://docs.digitalocean.com/products/app-platform/languages-frameworks/nodejs/#node-version).

1. 你还需要添加一个运行命令，以便 Digital Ocean 知道构建后要运行什么命令。你可以通过向 `package.json` 添加一个 start 脚本来实现：

   ```json
   {
      "scripts": {
         "start": "node .output/server/index.mjs"
      }
   }
   ```

1. 最后，你需要将这个 start 脚本添加到 Digital Ocean 应用的运行命令中。转到 `Components > Settings > Commands`，点击"编辑"，然后添加 `npm run start`

你的应用应该会在 Digital Ocean 生成的 URL 上上线，你现在可以遵循 [Digital Ocean 部署指南的其余部分](https://docs.digitalocean.com/products/app-platform/how-to/manage-deployments/).
