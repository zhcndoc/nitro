# Heroku

> 部署 Nitro 应用到 Heroku。

**预设:** `heroku`

:read-more{title="heroku.com" to="https://heroku.com/"}

## 使用 heroku CLI

1. 创建一个新的 Heroku 应用。

   ```bash
   heroku create myapp
   ```

1. 配置 Heroku 使用 nodejs 构建包。

   ```bash
   heroku buildpacks:set heroku/nodejs
   ```

1. 配置你的应用。

   ```bash
   heroku config:set NITRO_PRESET=heroku
   ```

1. 确保你的 `package.json` 文件中有 `start` 和 `build` 命令。

   ```json5
   "scripts": {
     "build": "nitro build", // 如果使用 nuxt，可以改为 `nuxt build`
     "start": "node .output/server/index.mjs"
   }
   ```

## 与 nginx 一起使用

1. 在 [这里](https://github.com/heroku/heroku-buildpack-nginx.git) 添加 Heroku Nginx 构建包。

1. 在你的 `nuxt.config` 中切换到 'node' 预设。

   ```json5
   "nitro": {
      "preset":"node",
   }
   ```

1. 从构建包文档的 **现有应用** 部分，执行两个关键步骤使其运行：

   步骤 1：在 'tmp/nginx.socket' 监听一个套接字
   步骤 2：当你的应用准备好接受连接时，创建一个文件 '/tmp/app-initialized'

1. 创建自定义应用运行器，例：在项目根目录下创建 `apprunner.mjs`（或其他任何首选位置），在此文件中，使用节点预设生成的监听器创建服务器，然后按照构建包文档在套接字上监听。

   ```ts
   import { createServer } from 'node:http'
   import { listener } from './.output/server/index.mjs'

   const server = createServer(listener)

   server.listen('/tmp/nginx.socket') // 按照构建包文档
   ```

1. 为了创建 'tmp/app-initialized' 文件，使用一个 Nitro 插件，在项目根目录下创建文件 `initServer.ts`（或其他任何首选位置）。

   ```ts
   import fs from "fs"

   export default defineNitroPlugin((nitroApp) => {
      if((process.env.NODE_ENV || 'development') != 'development') {
         fs.openSync('/tmp/app-initialized', 'w')
      }
   })
   ```

1. 最后，在项目根目录下创建文件 'Procfile'，通过 Procfile，我们告诉 Heroku 启动 nginx，并使用自定义的 `apprunner.mjs` 启动服务器。

   web: bin/start-nginx node apprunner.mjs

1. 额外：创建文件 'config/nginx.conf.erb' 来自定义你的 nginx 配置。使用节点预设时，默认情况下不会生成静态文件处理程序，你可以使用 nginx 来服务静态文件，只需将正确的位置规则添加到服务器块，或者通过将 `serveStatic` 设置为 true 强制节点预设生成静态文件的处理程序。
