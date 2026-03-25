# 简介

> Nitro 是一个全栈服务器框架，兼容任何运行环境和任何部署目标。

Nitro 为您提供生产就绪的服务器，具备文件系统路由、代码分割功能，并内置对存储、缓存和数据库的支持 —— 所有功能都与运行环境无关，可部署到任何地方。

## 什么是 Nitro？

在 `routes/` 目录内创建服务器和 API 路由。每个文件直接映射到一个 URL 路径，Nitro 负责处理其余工作 —— 路由、代码分割和优化构建。

您还可以通过创建 `server.ts` 文件完全掌控服务器入口。Nitro 的高级、与运行环境无关的方法让您可以使用任何 HTTP 库，例如 [Elysia](https://elysiajs.com/)、[h3](https://h3.dev) 或 [Hono](https://hono.dev)。

### 性能

Nitro 在构建时编译您的路由，无需运行时路由器。只需加载和执行处理每个传入请求所需的代码。这使其非常适合无服务器托管，无论项目大小如何，都能实现接近 0 毫秒的启动时间。

### 随处部署

将您的服务器构建到优化的 `.output/` 文件夹中，兼容 Node.js、Bun、Deno 以及许多托管平台，无需任何配置 —— 包括 Cloudflare Workers、Netlify、Vercel 等。无需更改一行代码即可利用平台功能，如 ESR、ISR 和 SWR。

### 服务端渲染

使用您喜欢的模板引擎渲染 HTML，或直接在服务器上使用 React、Vue 或 Svelte 等组件库。通过客户端注水实现完全通用渲染。Nitro 提供基础架构和渐进式方法来达成您的目标。

### 存储

Nitro 开箱即用地包含与运行环境无关的键值存储层。默认使用内存存储，但您可以连接 20 多种不同的驱动程序（FS、Redis、S3 等），将它们附加到不同的命名空间，并在不更改代码的情况下进行切换。

### 缓存

Nitro 支持服务器路由和服务器函数的缓存，直接由服务器存储支持（通过 `cache` 命名空间）。

### 数据库

Nitro 还包含内置的 SQL 数据库。默认为 SQLite，但您可以使用相同的 API 连接和查询 10 多种数据库（Postgres、MySQL、PGLite 等）。

### 元框架基础

Nitro 可用作构建您自己元框架的基础。Nuxt、SolidStart 和 TanStack Start 等流行框架都完全或部分地利用了 Nitro。

## Vite 集成

Nitro 作为插件与 [Vite](https://vite.dev) 无缝集成。如果您正在使用 Vite 构建前端应用程序，添加 Nitro 可为您提供 API 路由、服务端渲染和完整的生产服务器 —— 所有这些都通过 `vite build` 一起构建。

```ts [vite.config.ts]
import { defineConfig } from "vite";
import { nitro } from "nitro/vite";

export default defineConfig({
  plugins: [nitro()],
});
```

使用 Nitro，`vite build` 会生成一个优化的 `.output/` 文件夹，包含您的前端和后端 —— 准备好部署到任何地方。

准备好尝试了吗？进入 [快速开始](/docs/quick-start)。
