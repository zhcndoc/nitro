---
seo:
  title: 构建全栈服务器
  description: Nitro 构建可在任何地方运行的生产就绪服务器。编写 API 路由，然后无需任何配置即可将同一代码库部署到 Node.js、Bun、Deno 或无服务器环境。
---

::page-hero

<!-- :hero-command{command="create-nitro-app"} -->

#title
构建 [服务器]{.text-brand}

#description
Nitro 构建可在任何地方运行的生产就绪服务器。

编写 API 路由，然后无需任何配置即可将同一代码库部署到 Node.js、Bun、Deno 或无服务器环境。

#links
:app-hero-links
::

::stat-strip
---
# `animateFrom` 仅表示每个计数器开始滚动时的数值。它是一种视觉
# 效果，没有实际含义，绝不代表真实测量值。
stats:
  - value: "3.8 kB"
    label: Gzip 压缩后输出
    animateFrom: 100
  - value: "0"
    label: 运行时依赖
    animateFrom: 35
  - value: "25+"
    label: 部署目标
    animateFrom: 0
  - value: "~50 ms"
    label: 冷启动
    animateFrom: 350
---
::

::feature-section
---
eyebrow: 路由
link: /docs/routing
link-label: 路由文档
points:
  - 路由会被编译，包中不会包含运行时路由器
  - 动态参数、通配符和按方法区分的文件
  - 路由组可以整理文件，而不会改变 URL
---
#title
文件即路由

#description
将文件放入 `routes/`，它就会成为一个路由。在文件名后追加 HTTP 方法来限定它，将文件夹嵌套以表示路径参数，并用括号包裹文件夹来对路由分组，而不会影响 URL。

#visual
  :::route-map
  ---
  dir: routes/
  routes:
    - file: hello.get.ts
      method: GET
      route: /hello
    - file: hello.post.ts
      method: POST
      route: /hello
    - file: api/test.ts
      route: /api/test
    - file: api/[org]/[repo].ts
      route: /api/:org/:repo
    - file: (admin)/users.ts
      route: /users
  ---
  :::
::

::feature-section
---
eyebrow: 服务器入口
reverse: true
link: /docs/server-entry
link-label: 服务器入口文档
---
#title
使用你自己的框架

#description
任何支持 Web `fetch(request): Response` 接口的框架都可以作为你的服务器入口，只需在 `server.ts` 中导出它，它就会在匹配路由之前处理每个请求。Node 风格的 `(req, res)` 框架同样适用：将文件命名为 `server.node.ts`，Nitro 会对其进行适配。

#visual
  :::tabs
    ::::tab{label="H3" icon="i-unjs-h3"}
    ```ts [server.ts]
    import { H3 } from "h3";

    const app = new H3();

    app.get("/", () => "⚡️ Hello from H3!");

    export default app;
    ```
    ::::

    ::::tab{label="Hono" icon="i-logos-hono"}
    ```ts [server.ts]
    import { Hono } from "hono";

    const app = new Hono();

    app.get("/", (c) => c.text("🔥 Hello from Hono!"));

    export default app;
    ```
    ::::

    ::::tab{label="Elysia" icon="i-skill-icons-elysia-dark"}
    ```ts [server.ts]
    import { Elysia } from "elysia";

    const app = new Elysia();

    app.get("/", () => "🦊 Hello from Elysia!");

    export default app.compile();
    ```
    ::::

    ::::tab{label="Express" icon="i-simple-icons-express"}
    ```ts [server.node.ts]
    import Express from "express";

    const app = Express();

    app.use("/", (_req, res) => {
      res.send("Hello from Express with Nitro!");
    });

    export default app;
    ```
    ::::
  :::
::

::feature-section
---
eyebrow: 部署
link: /deploy
link-label: 所有部署目标
points:
  - CI 中会自动检测提供商，无需安装适配器
  - 通过单个 `preset` 选项切换目标
  - 兼容性日期可让提供商行为长期保持稳定
---
#title
一个代码库，适用于所有平台

#description
同一个服务器可以构建到 Node.js、Deno、Bun、边缘 Worker 和无服务器函数。Nitro 会生成每个主机所需的输出格式，因此在它们之间迁移无需修改代码！

#visual
  :::deploy-grid
  ---
  more: 25+ 个目标
  moreTo: /deploy
  targets:
    - name: Node.js
      icon: i-simple-icons-nodedotjs
      to: /deploy/runtimes/node
    - name: Deno
      icon: i-simple-icons-deno
      to: /deploy/runtimes/deno
    - name: Bun
      icon: i-simple-icons-bun
      to: /deploy/runtimes/bun
    - name: Cloudflare
      icon: i-simple-icons-cloudflare
      to: /deploy/providers/cloudflare
    - name: Vercel
      icon: i-simple-icons-vercel
      to: /deploy/providers/vercel
    - name: Netlify
      icon: i-simple-icons-netlify
      to: /deploy/providers/netlify
    - name: AWS Lambda
      icon: i-simple-icons-awslambda
      to: /deploy/providers/aws
    - name: Azure
      icon: i-simple-icons-microsoftazure
      to: /deploy/providers/azure
    - name: Firebase
      icon: i-simple-icons-firebase
      to: /deploy/providers/firebase
    - name: DigitalOcean
      icon: i-simple-icons-digitalocean
      to: /deploy/providers/digitalocean
    - name: Render
      icon: i-simple-icons-render
      to: /deploy/providers/render
  ---
  :::
::

::feature-section
---
eyebrow: 输出
reverse: true
link: /docs/quick-start
link-label: 构建你的第一个服务器
---
#title
小到足以阅读

#description
一个最小 Nitro 服务器的生产构建仅包含三个文件，无需在旁边安装任何内容。依赖会被打包并进行 Tree Shaking，因此你部署的就是自己编写的代码，以及让它运行所需的少量代码。

#visual
  :::bar-chart
  ---
  title: 生产服务器输出
  data:
    - label: 未压缩
      value: 16.2
      display: 16.2 kB
    - label: 已压缩
      value: 8.8
      display: 8.8 kB
    - label: 已压缩 + Gzip 压缩
      value: 3.8
      display: 3.8 kB
      highlight: true
  ---
  :::
::

::feature-section
---
eyebrow: 缓存
link: /docs/cache
link-label: 缓存文档
points:
  - 默认使用 stale-while-revalidate 响应
  - 开箱即用地支持 ETag、last-modified 和 304 处理
  - 对同一键的并发请求共享单次调用
---
#title
与存储相匹配的缓存

#description
包装一个处理器或任意异步函数，Nitro 就会在你的应用已经使用的同一存储层上缓存其结果：开发环境中使用内存，生产环境中则使用 Redis、Cloudflare KV、Vercel Blob 存储或文件系统。代码相同，后端不同。

#visual
  ```ts [routes/stars.ts]
  import { defineCachedHandler } from "nitro/cache";

  export default defineCachedHandler(
    async () => {
      const res = await fetch("https://api.github.com/repos/nitrojs/nitro");
      const { stargazers_count } = await res.json();
      return { stars: stargazers_count };
    },
    { maxAge: 60 * 60 }
  );
  ```
::

::feature-grid
---
eyebrow: 内置功能
title: 服务器所需的一切
description: 大多数应用都会用到的功能都已随 Nitro 一起提供，并且在每个部署目标上的行为都相同。
features:
  - title: KV 存储
    description: 在文件系统、Redis、Cloudflare KV 等之上提供统一的键值 API。
    icon: i-lucide-hard-drive
    to: /docs/storage
  - title: 数据库
    description: 由 db0 驱动的 SQL 层，已预配置 SQLite。
    icon: i-lucide-database
    badge: 实验性
    to: /docs/database
  - title: 任务
    description: 一次性运行时操作，可从 CLI 运行或按 cron 计划运行。
    icon: i-lucide-list-checks
    badge: 实验性
    to: /docs/tasks
  - title: WebSockets
    description: 基于 crossws 构建的跨运行时 WebSocket 支持。
    icon: i-lucide-radio
    to: /docs/websocket
  - title: 插件
    description: 从 plugins/ 目录接入服务器生命周期。
    icon: i-lucide-plug
    to: /docs/plugins
  - title: OpenAPI
    description: 根据你的处理器生成规范，并通过 Scalar 或 Swagger UI 提供服务。
    icon: i-lucide-file-json
    badge: 实验性
    to: /docs/openapi
  - title: 资源
    description: 直接提供公共文件，在运行时读取服务器资源。
    icon: i-lucide-image
    to: /docs/assets
  - title: 渲染器
    description: 用于处理未匹配路由的兜底处理器，可用于 SSR、SPA 外壳或纯 HTML。
    icon: i-lucide-layout-template
    to: /docs/renderer
  - title: 生命周期
    description: 请求按顺序经过的每一层，以及拦截请求的位置。
    icon: i-lucide-activity
    to: /docs/lifecycle
---
::

::call-to-action{command="create-nitro-app"}
#title
从一条命令开始

#description
创建项目脚手架，或将 Vite 插件添加到你已有的应用中。

#actions
:app-hero-links
::

::sponsors
