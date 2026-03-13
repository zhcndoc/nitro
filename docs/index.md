---
seo:
  title: Nitro 中文文档 - 发布全栈 Vite 应用
  description: Nitro 为您的 Vite 应用扩展了一个生产就绪的服务器，兼容任何运行时。向应用添加服务器路由，并以零配置体验部署到多种托管平台。
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
发布 [全栈]{.text-primary} Vite 应用

#description
Nitro 为您的 Vite 应用扩展了一个生产就绪的服务器，兼容任何运行时。向应用添加服务器路由，并以零配置体验部署到多种托管平台。

#links
  :::u-button
  ---
  size: xl
  to: /docs/quick-start
  trailing-icon: i-lucide-arrow-right
  ---
  快速开始
  :::

  :::u-button
  ---
  color: neutral
  icon: i-simple-icons-github
  size: xl
  target: _blank
  to: https://github.com/nitrojs/nitro
  variant: outline
  ---
  GitHub
  :::
::

::div{class="bg-neutral-50 dark:bg-neutral-950/30 py-10 border-y border-default"}
  :::u-container
    ::::u-page-grid
      :::::u-page-feature
      #title
      快速

      #description
      享受带有服务器端 HMR 的 Vite 开发体验，并针对生产环境进行优化。
      :::::

      :::::u-page-feature
      #title
      多样

      #description
      使用零配置将相同代码库部署到任何部署提供商，无供应商锁定。
      :::::

      :::::u-page-feature
      #title
      极简

      #description
      极简设计，适配任何解决方案，开销最低。
      :::::
    ::::
  :::
::

::u-page-section
---
features:
  - title: 'routes/'
    description: '在 routes/ 目录中创建服务器路由，它们将自动注册。'
    icon: 'i-lucide-folder-tree'
  - title: 'server.ts'
    description: '完全遵循 Web 标准，使用您选择的标准库，在 server.ts 文件中创建服务器路由。'
    icon: 'i-lucide-file-code'
---
#title
创建服务器路由

#description
在 routes/ 目录中开始创建 API 路由，或使用您喜欢的后端框架，在 `server.ts` 文件中开始。

#default
::div{class="min-h-[506px]"}
  ::tabs
    ::tabs-item{label="文件系统路由" icon="i-lucide-folder"}
      ::code-tree{defaultValue="routes/hello.ts" expand-all}
        ::prose-pre{filename="vite.config.ts"}
        ```ts
        import { defineConfig } from 'vite'
        import { nitro } from 'nitro/vite'

        export default defineConfig({
          plugins: [
            nitro()
          ],
        });
        ```
        ::
        ::prose-pre{filename="routes/hello.ts"}
        ```ts
        import { defineHandler } from 'nitro/h3'

        export default defineHandler(({ req }) => {
          return { api: 'works!' }
        })
        ```
        ::
        ::prose-pre{filename="index.html"}
        ```html
          <html>
          <head>
            <title>Nitro + Vite</title>
          </head>
          <body>
            <h1>Hey, there!</h1>
          </body>
          </html>
        ```
        ::
      ::
    ::
    ::tabs-item{label="Web 标准" icon="i-lucide-globe"}
      ::prose-pre{filename="server.ts"}
      ```ts
      export default {
        async fetch(req: Request): Promise<Response> {
          return new Response(`Hello world! (${req.url})`);
        },
      };
      ```
      ::
    ::
    ::tabs-item{label="H3" icon="i-undocs-h3"}
      ::prose-pre{filename="server.ts"}
      ```ts
      import { H3 } from 'h3'

      const app = new H3()

      app.get("/", () => '⚡️ Hello from H3!')

      export default app
      ```
      ::
    ::
    ::tabs-item{label="Hono" icon="i-undocs-hono"}
      ::prose-pre{filename="server.ts"}
      ```ts
      import { Hono } from 'hono'

      const app = new Hono()

      app.get("/", (c) => c.text('🔥 Hello from Hono!'))

      export default app
      ```
      ::
    ::
    ::tabs-item{label="Elysia" icon="i-undocs-elysia"}
      ::prose-pre{filename="server.ts"}
      ```ts
      import { Elysia } from 'elysia'

      const app = new Elysia()

      app.get("/", (c) => '🦊 Hello from Elysia!')

      export default app
      ```
      ::
    ::
  ::
::
::

::performance-showcase
---
metrics:
  - label: Bare metal perf
    value: "~Native"
    unit: RPS
    description: Using compile router, and fast paths for request handling.
    icon: i-lucide-gauge
    color: text-emerald-500
    bgColor: bg-emerald-500/10
    barWidth: "95%"
    barColor: bg-emerald-500
  - label: Minimum install Size
    value: Tiny
    unit: deps
    description: Minimal dependencies. No bloated node_modules.
    icon: i-lucide-package
    color: text-sky-500
    bgColor: bg-sky-500/10
    barWidth: "15%"
    barColor: bg-sky-500
  - label: Small and portable output
    value: "‹ 10"
    unit: kB
    description: Standard server builds produce ultra-small output bundles.
    icon: i-lucide-file-output
    color: text-violet-500
    bgColor: bg-violet-500/10
    barWidth: "10%"
    barColor: bg-violet-500
  - label: FAST builds
    value: "‹ 1"
    unit: sec
    description: Cold production builds complete in seconds, not minutes.
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
  headline: Routing
  link: /docs/routing
  link-label: Routing docs
  ---
  #title
  File-system routing

  #description
  Create server routes in the routes/ folder and they are automatically registered. Or bring your own framework — H3, Hono, Elysia, Express — via a server.ts entry.
  :::

  :::feature-card
  ---
  headline: Versatile
  link: /deploy
  link-label: Explore deploy targets
  ---
  #title
  Deploy everywhere

  #description
  The same codebase deploys to Node.js, Cloudflare Workers, Deno, Bun, AWS Lambda, Vercel, Netlify, and more — zero config, no vendor lock-in.
  :::

  :::feature-card
  ---
  headline: Storage
  link: /docs/storage
  link-label: Storage docs
  ---
  #title
  Universal storage

  #description
  Built-in key-value storage abstraction powered by unstorage. Works with filesystem, Redis, Cloudflare KV, and more — same API everywhere.
  :::

  :::feature-card
  ---
  headline: Caching
  link: /docs/cache
  link-label: Caching docs
  ---
  #title
  Built-in caching

  #description
  Cache route handlers and arbitrary functions with a simple API. Supports multiple storage backends and stale-while-revalidate patterns.
  :::

  :::feature-card
  ---
  headline: Server Entry
  link: /docs/server-entry
  link-label: Server entry docs
  ---
  #title
  Web standard server

  #description
  Go full Web standard and pick the library of your choice. Use H3, Hono, Elysia, Express, or the raw fetch API — Nitro handles the rest.
  :::

  :::feature-card
  ---
  headline: Renderer
  link: /docs/renderer
  link-label: Renderer docs
  ---
  #title
  Universal renderer

  #description
  Use any frontend framework as your renderer. Nitro provides the server layer while your framework handles the UI.
  :::

  :::feature-card
  ---
  headline: Plugins
  link: /docs/plugins
  link-label: Plugins docs
  ---
  #title
  Server plugins

  #description
  Extend Nitro's runtime behavior with plugins. Hook into lifecycle events, register custom logic, and auto-load from the plugins/ directory.
  :::

  :::feature-card
  ---
  headline: Database
  link: /docs/database
  link-label: Database docs
  ---
  #title
  Built-in database

  #description
  Lightweight SQL database layer powered by db0. Pre-configured with SQLite out of the box, with support for PostgreSQL, MySQL, and Cloudflare D1.
  :::

  :::feature-card
  ---
  headline: Assets
  link: /docs/assets
  link-label: Assets docs
  ---
  #title
  Static & server assets

  #description
  Serve public assets directly to clients or bundle server assets for programmatic access. Works seamlessly across all deployment targets.
  :::
::


::page-sponsors
