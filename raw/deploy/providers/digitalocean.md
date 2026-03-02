# DigitalOcean

> 将 Nitro 应用部署到 DigitalOcean。

**预设:** `digital_ocean`

<read-more title="Digital Ocean 应用平台" to="https://docs.digitalocean.com/products/app-platform/">



</read-more>

## 设置应用程序

<steps level="4">

#### 按照[指南](https://docs.digitalocean.com/products/app-platform/how-to/create-apps/)创建一个新的 Digital Ocean 应用。

#### 接下来，您需要配置环境变量。在您的应用设置中，请确保设置以下应用级环境变量：```bash
NITRO_PRESET=digital_ocean
```

<br />[更多信息](https://docs.digitalocean.com/products/app-platform/how-to/use-environment-variables/)。

#### 您需要确保在应用的 `package.json` 中设置 `engines.node` 字段，以确保 Digital Ocean 使用支持的 Node.js 版本：```json
{
   "engines": {
      "node": "16.x"
   }
}
```

<br />[查看更多信息](https://docs.digitalocean.com/products/app-platform/languages-frameworks/nodejs/#node-version)。

#### 您还需要添加一个运行命令，以便 Digital Ocean 知道在构建后要运行哪个命令。您可以通过在 `package.json` 中添加一个启动脚本来做到这一点：```json
{
   "scripts": {
      "start": "node .output/server/index.mjs"
   }
}
```



#### 最后，您需要将此启动脚本添加到 Digital Ocean 应用的运行命令中。转到 `Components > Settings > Commands`，点击“编辑”，然后添加 `npm run start`

</steps>

您的应用应该在 Digital Ocean 生成的 URL 上实时可用，您现在可以按照[其余 Digital Ocean 部署指南](https://docs.digitalocean.com/products/app-platform/how-to/manage-deployments/)进行操作。
