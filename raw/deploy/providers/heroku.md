# Heroku

> 将 Nitro 应用部署到 Heroku。

**预设：** `heroku`

<read-more title="heroku.com" to="https://heroku.com/">



</read-more>

## 使用 Heroku CLI

<steps level="4">

#### 创建一个新的 Heroku 应用。```bash
heroku create myapp
```



#### 配置 Heroku 使用 nodejs 构建包。```bash
heroku buildpacks:set heroku/nodejs
```



#### 配置你的应用。```bash
heroku config:set NITRO_PRESET=heroku
```



#### 确保在 `package.json` 文件中有 `start` 和 `build` 命令。```json5
"scripts": {
  "build": "nitro build", // 如果使用 nuxt 则为 `nuxt build`
  "start": "node .output/server/index.mjs"
}
```

</steps>

## 使用 Nginx

<steps level="4">

#### 在此处添加 Heroku Nginx 构建包 [here](https://github.com/heroku/heroku-buildpack-nginx.git)

#### 在 `nitro.config` 中更改为 'node' 预设```json5
"nitro": {
   "preset":"node",
}
```



#### 根据构建包文档的 **Existing app** 部分，需要两个关键步骤来启动运行<br />步骤 1：在 'tmp/nginx.socket' 监听套接字
步骤 2：当你的应用准备好接受连接时，创建文件 '/tmp/app-initialized'

#### 创建自定义应用运行器，例如：在项目根目录（或其他首选位置）创建 apprunner.mjs，在这个文件中，使用 node 预设生成的监听器创建服务器，然后按照构建包文档的说明监听套接字```ts
import { createServer } from 'node:http'
import { listener } from './.output/server/index.mjs'

const server = createServer(listener)

server.listen('/tmp/nginx.socket') //遵循构建包文档
```



#### 要创建 'tmp/app-initialized' 文件，请使用 nitro 插件，在项目根目录（或其他首选位置）创建文件 'initServer.ts'```ts
import fs from "fs"

export default definePlugin((nitroApp) => {
   if((process.env.NODE_ENV || 'development') != 'development') {
      fs.openSync('/tmp/app-initialized', 'w')
   }
})
```



#### 最后，在项目根目录创建文件 'Procfile'，通过 Procfile，我们告诉 Heroku 启动 nginx 并使用自定义的 apprunner.mjs 来启动服务器<br />web: bin/start-nginx node apprunner.mjs

#### 额外提示：创建文件 'config/nginx.conf.erb' 来自定义你的 nginx 配置。使用 node 预设时，默认情况下不会生成静态文件处理程序，你可以使用 nginx 来提供静态文件服务，只需在 server 块中添加正确的 location 规则，或者，通过将 serveStatic 设置为 true 来强制 node 预设生成静态文件的处理程序。

</steps>
