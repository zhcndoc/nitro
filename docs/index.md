---
seo:
  title: Nitro 中文文档 - 构建全栈 Web 服务器
  description: Nitro 为你的 Vite 应用扩展出一个可用于生产的服务器，兼容任意运行时。为你的应用添加服务端路由，并以零配置体验部署到众多托管平台。
---

::u-page-hero
---
orientation: horizontal
---
::code-group
  :::prose-pre
  ---
  filename: vite.config.ts
  ---
  ```ts
  import { defineConfig } from 'vite'
  import { nitro } from 'nitro/vite'

  export default defineConfig({
    plugins: [nitro()],
    nitro: {
      serverDir: "./server"
    }
  })
  ```
  :::
  :::prose-pre
  ---
  filename: nitro.config.ts
  ---
  ```ts
  import { defineConfig } from 'nitro'

  export default defineConfig({
    preset: "node",
    serverDir: "./server",
    routeRules: {
      "/api/**": { cache: true }
    }
  })
  ```
  :::
::

:hero-background

#title
构建 [服务器]{.text-primary}

#description
Nitro 为你的 Vite 应用扩展出一个可用于生产的服务器，兼容任意运行时。为你的应用添加服务端路由，并以零配置体验部署到众多托管平台。

#links
:app-hero-links
::

::hero-features
---
features:
  - title: 快速
    description: 享受由 Vite 8（由 rolldown 驱动）带来的极速开发体验，服务端支持 HMR，并针对生产环境进行了优化。
    icon: i-lucide-zap
    color: text-amber-500
    bgColor: bg-amber-500/10
    borderColor: "group-hover:border-amber-500/30"
  - title: 无绑定
    description: 使用同一套代码库，以零配置且无供应商锁定的方式部署到任意部署提供商。
    icon: i-lucide-globe
    color: text-sky-500
    bgColor: bg-sky-500/10
    borderColor: "group-hover:border-sky-500/30"
  - title: 轻量
    description: Nitro 不会给运行时带来额外开销。使用你喜欢的任何现代工具来构建服务器。
    icon: i-lucide-feather
    color: text-emerald-500
    bgColor: bg-emerald-500/10
    borderColor: "group-hover:border-emerald-500/30"
---
::

::performance-showcase
---
metrics:
  - label: 裸金属性能
    value: "~Native"
    unit: RPS
    description: 使用编译路由器，以及用于请求处理的快速路径。
    icon: i-lucide-gauge
    color: text-emerald-500
    bgColor: bg-emerald-500/10
    barWidth: "95%"
    barColor: bg-emerald-500
  - label: 最小安装体积
    value: Tiny
    unit: 依赖
    description: 最少的依赖。没有臃肿的 node_modules。
    icon: i-lucide-package
    color: text-sky-500
    bgColor: bg-sky-500/10
    barWidth: "15%"
    barColor: bg-sky-500
  - label: 小巧且便携的输出
    value: "‹ 10"
    unit: kB
    description: 标准服务器构建会生成极小的输出包。
    icon: i-lucide-file-output
    color: text-violet-500
    bgColor: bg-violet-500/10
    barWidth: "10%"
    barColor: bg-violet-500
  - label: 极速构建
    value: "‹ 1"
    unit: sec
    description: 冷启动生产构建在几秒内完成，而不是几分钟。
    icon: i-lucide-timer
    color: text-amber-500
    bgColor: bg-amber-500/10
    barWidth: "12%"
    barColor: bg-amber-500
---
::

::landing-features
#body
  :::feature-card
  ---
  headline: 路由
  link: /docs/routing
  link-label: 路由文档
  ---
  #title
  文件系统路由

  #description
  在 routes/ 文件夹中创建服务端路由，它们会自动注册。或者通过一个 server.ts 入口引入你自己的框架——H3、Hono、Elysia、Express——都可以。
  :::

  :::feature-card
  ---
  headline: 多用途
  link: /deploy
  link-label: 探索部署目标
  ---
  #title
  部署到任意地方

  #description
  同一套代码库可部署到 Node.js、Cloudflare Workers、Deno、Bun、AWS Lambda、Vercel、Netlify 等平台——零配置，没有供应商锁定。
  :::

  :::feature-card
  ---
  headline: 存储
  link: /docs/storage
  link-label: 存储文档
  ---
  #title
  通用存储

  #description
  由 unstorage 提供支持的内置键值存储抽象。可与文件系统、Redis、Cloudflare KV 等配合使用——所有环境下 API 一致。
  :::

  :::feature-card
  ---
  headline: 缓存
  link: /docs/cache
  link-label: 缓存文档
  ---
  #title
  内置缓存

  #description
  使用简单的 API 缓存路由处理器和任意函数。支持多种存储后端以及 stale-while-revalidate 模式。
  :::

  :::feature-card
  ---
  headline: 服务端入口
  link: /docs/server-entry
  link-label: 服务端入口文档
  ---
  #title
  Web 标准服务器

  #description
  完全遵循 Web 标准，并选择你喜欢的库。可使用 H3、Hono、Elysia、Express，或原生 fetch API——其余交给 Nitro 处理。
  :::

  :::feature-card
  ---
  headline: 渲染器
  link: /docs/renderer
  link-label: 渲染器文档
  ---
  #title
  通用渲染器

  #description
  将任意前端框架用作你的渲染器。Nitro 提供服务器层，而你的框架负责 UI。
  :::

  :::feature-card
  ---
  headline: 插件
  link: /docs/plugins
  link-label: 插件文档
  ---
  #title
  服务端插件

  #description
  使用插件扩展 Nitro 的运行时行为。可接入生命周期事件、注册自定义逻辑，并从 plugins/ 目录自动加载。
  :::

  :::feature-card
  ---
  headline: 数据库
  link: /docs/database
  link-label: 数据库文档
  ---
  #title
  内置数据库

  #description
  由 db0 提供支持的轻量级 SQL 数据库层。开箱即预配置 SQLite，并支持 PostgreSQL、MySQL 和 Cloudflare D1。
  :::

  :::feature-card
  ---
  headline: 资源
  link: /docs/assets
  link-label: 资源文档
  ---
  #title
  静态与服务器资源

  #description
  直接向客户端提供公共资源，或将服务器资源打包以供程序化访问。可在所有部署目标上无缝工作。
  :::
::


::page-sponsors
