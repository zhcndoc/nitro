# Heroku

> 将 Nitro 应用部署到 Heroku。

**预设：** `heroku`

:read-more{title="heroku.com" to="https://heroku.com/"}

## 使用 Heroku CLI

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

1. 确保在 `package.json` 文件中有 `start` 和 `build` 命令。

   ```json5
   "scripts": {
     "build": "nitro build", // 如果使用 nuxt 则为 `nuxt build`
     "start": "node .output/server/index.mjs"
   }
   ```

## 使用 Nginx

1. 添加 [Heroku nginx buildpack](https://github.com/heroku/heroku-buildpack-nginx.git)

1. 将 Nitro 配置中的预设更改为 `node_middleware`

   ```ts [nitro.config.ts]
   import { defineConfig } from "nitro";

   export default defineConfig({
     preset: "node_middleware",
   })
   ```

   或者，如果你使用的是 Nuxt：

   ```ts [nuxt.config.ts]
   export default defineNuxtConfig({
     nitro: {
       preset: "node_middleware",
     },
   })
   ```

1. 如构建包文档的**现有应用**部分所述，需要完成以下两个关键步骤才能正常运行：

   - 在 `/tmp/nginx.socket` 上监听套接字
   - 在应用准备好接受连接时创建文件 `/tmp/app-initialized`

1. 创建一个自定义应用运行器（例如，在项目根目录下创建 `apprunner.mjs`）。在此文件中，使用 `node_middleware` 预设生成的中间件创建服务器，然后按照构建包文档中的详细说明监听套接字：

   ```ts
   import { createServer } from 'node:http'
   import { middleware } from './.output/server/index.mjs'

   const server = createServer(middleware)

   server.listen('/tmp/nginx.socket') //遵循构建包文档
   ```

1. 要创建 `/tmp/app-initialized` 文件，请使用 Nitro 插件（例如，在项目根目录下创建 `initServer.ts`）：

   ```ts
   import fs from "node:fs"
   import { definePlugin } from "nitro"

   export default definePlugin((nitroApp) => {
      if((process.env.NODE_ENV || 'development') != 'development') {
         fs.openSync('/tmp/app-initialized', 'w')
      }
   })
   ```

1. 最后，在项目根目录下创建一个 `Procfile`。它会告知 Heroku 启动 nginx，并使用自定义的 `apprunner.mjs` 启动服务器：

   ```txt [Procfile]
   web: bin/start-nginx node apprunner.mjs
   ```

1. 附加内容：创建一个 `config/nginx.conf.erb` 文件来定制你的 nginx 配置。默认情况下，`node_middleware` 预设不会生成静态文件处理程序，因此你可以通过向服务器代码块中添加正确的 location 规则，让 nginx 提供静态文件。或者，将 `serveStatic` 设置为 `true`，强制预设生成静态文件处理程序。
