# Heroku

> 将 Nitro 应用部署到 Heroku。

**预设:** `heroku`

:read-more{title="heroku.com" to="https://heroku.com/"}

## 使用 heroku CLI

1. 创建一个新的 Heroku 应用。

   ```bash
   heroku create myapp
   ```

2. 配置 Heroku 使用 nodejs 构建包。

   ```bash
   heroku buildpacks:set heroku/nodejs
   ```

3. 配置你的应用。

   ```bash
   heroku config:set NITRO_PRESET=heroku
   ```

4. 确保在你的 `package.json` 文件中有 `start` 和 `build` 命令。

   ```json5
   "scripts": {
     "build": "nitro build", // 如果使用 nuxt 则为 `nuxt build`
     "start": "node .output/server/index.mjs"
   }
   ```

## 使用 nginx

1. 在[这里](https://github.com/heroku/heroku-buildpack-nginx.git)添加 heroku Nginx 构建包。

2. 在你的 `nuxt.config` 中更改为 'node' 预设。

   ```json5
   "nitro": {
      "preset":"node",
   }
   ```

3. 从构建包文档的 **现有应用** 部分，需要两个关键步骤以使其运行。

   步骤 1: 在 'tmp/nginx.socket' 上监听一个套接字  
   步骤 2: 当你的应用准备好接受连接时创建文件 '/tmp/app-initialized'  

4. 创建自定义应用运行器，例如：在项目根目录创建 apprunner.mjs（或任何其他首选位置），在此文件中，创建一个服务器，使用 node 预设生成的监听器，然后按照构建包文档的详细说明在套接字上监听。

   ```ts
   import { createServer } from 'node:http'
   import { listener } from './.output/server/index.mjs'

   const server = createServer(listener)

   server.listen('/tmp/nginx.socket') // 遵循构建包文档
   ```

5. 若要创建 'tmp/app-initialized' 文件，使用一个 nitro 插件，在项目根目录创建文件 'initServer.ts'（或任何其他首选位置）。

   ```ts
   import fs from "fs"

   export default defineNitroPlugin((nitroApp) => {
      if((process.env.NODE_ENV || 'development') != 'development') {
         fs.openSync('/tmp/app-initialized', 'w')
      }
   })
   ```

6. 最后，在项目根目录创建文件 'Procfile'，通过 Procfile，告诉 heroku 启动 nginx 并使用自定义的 apprunner.mjs 启动服务器。

   web: bin/start-nginx node apprunner.mjs

7. 附加：创建文件 'config/nginx.conf.erb' 来自定义你的 nginx 配置。使用 node 预设时，默认情况下，静态文件处理程序不会生成，你可以使用 nginx 来服务静态文件，只需在服务器块中添加正确的位置规则，或者，通过将 serveStatic 设置为 true 强制 node 预设生成静态文件的处理程序。