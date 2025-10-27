---
seo:
  title: 发布全栈 Vite 应用
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
    plugins: [
      nitro()
    ],
    nitro: {
      preset: 'standard'
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
  ::u-container
    ::u-page-grid
      ::u-page-feature
      #title
      快速

      #description
      享受带有服务器端 HMR 的 Vite 开发体验，并针对生产环境进行优化。
      ::

      ::u-page-feature
      #title
      多样

      #description
      使用零配置将相同代码库部署到任何部署提供商，无供应商锁定。
      ::

      ::u-page-feature
      #title
      极简

      #description
      极简设计，适配任何解决方案，开销最低。
      ::

    ::
  ::
::

::u-page-section
---
orientation: horizontal
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

:page-sponsors

:page-contributors