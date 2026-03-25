# Nitro 服务端入口

> 使用服务端入口创建一个全局中间件，该中间件会在所有路由匹配之前运行。

服务端入口是 Nitro 中一个特殊的处理器，它作为全局中间件运行，在每个传入请求到达路由匹配之前执行。它通常用于横切关注点，如身份验证、日志记录、请求预处理或创建自定义路由逻辑。

## 自动检测的 `server.ts`

默认情况下，Nitro 会自动在项目根目录中查找 `server.ts`（或 `.js`、`.mjs`、`.mts`、`.tsx`、`.jsx`）文件。

如果找到，Nitro 将使用它作为服务端入口，并针对所有传入请求运行它。

<code-group>

```ts [server.ts]
export default {
  async fetch(req: Request) {
    const url = new URL(req.url);

    // 处理特定路由
    if (url.pathname === "/health") {
      return new Response("OK", {
        status: 200,
        headers: { "content-type": "text/plain" }
      });
    }

    // 为所有请求添加自定义请求头
    // 不返回内容以继续执行下一个处理器
  }
}
```

```ts [routes/api/hello.ts]
import { defineHandler } from "nitro";

export default defineHandler((event) => {
  return { hello: "API" };
});
```

</code-group>

<tip>

当检测到 `server.ts` 时，Nitro 将在终端输出：`Detected \`server.ts` as server entry.`

</tip>

使用此配置：

- `/health` → 由服务端入口处理（返回响应）
- `/api/hello` → 由 API 路由处理器直接处理
- `/about` 等 → 服务端入口先运行，如果没有返回响应，则继续执行到渲染器

## 框架兼容性

服务端入口是与其他框架集成的绝佳方式。任何公开标准 Web `fetch(request: Request): Response` 接口的框架都可以用作服务端入口。

### Web 兼容框架

实现 Web `fetch` API 的框架可以直接与 `server.ts` 配合使用：

<tabs>
<tabs-item label="H3" icon="i-undocs-h3">

```ts [server.ts]
import { H3 } from "h3";

const app = new H3()

app.get("/", () => "⚡️ Hello from H3!");

export default app;
```

</tabs-item>

<tabs-item label="Hono" icon="i-undocs-hono">

```ts [server.ts]
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => c.text("🔥 Hello from Hono!"));

export default app;
```

</tabs-item>

<tabs-item label="Elysia" icon="i-undocs-elysia">

```ts [server.ts]
import { Elysia } from "elysia";

const app = new Elysia();

app.get("/", () => "🦊 Hello from Elysia!");

export default app.compile();
```

</tabs-item>
</tabs>

### Node.js 框架

对于使用 `(req, res)` 风格处理器（如 [Express](https://expressjs.com/) 或 [Fastify](https://fastify.dev/)）的 Node.js 框架，请将服务端入口文件命名为 `server.node.ts` 而不是 `server.ts`。Nitro 将自动检测 `.node.` 后缀，并使用 [`srvx`](https://srvx.h3.dev/) 将 Node.js 处理器转换为兼容 Web 的 fetch 处理器。

<tabs>
<tabs-item label="Express">

```ts [server.node.ts]
import Express from "express";

const app = Express();

app.use("/", (_req, res) => {
  res.send("Hello from Express with Nitro!");
});

export default app;
```

</tabs-item>

<tabs-item label="Fastify">

```ts [server.node.ts]
import Fastify from "fastify";

const app = Fastify();

app.get("/", () => "Hello, Fastify with Nitro!");

await app.ready();

export default app.routing;
```

</tabs-item>
</tabs>

## 配置

### 自定义服务端入口文件

你可以使用 Nitro 配置中的 `serverEntry` 选项指定自定义服务端入口文件：

```ts [nitro.config.ts]
import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  serverEntry: "./nitro.server.ts"
})
```

你还可以提供一个包含 `handler` 和 `format` 选项的对象：

```ts [nitro.config.ts]
import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  serverEntry: {
    handler: "./server.ts",
    format: "node" // "web"（默认）或 "node"
  }
})
```

### 处理器格式

`format` 选项控制 Nitro 如何处理服务端入口的默认导出：

- **"web"**（默认）—— 期望一个兼容 Web 的处理器，具有 `fetch(request: Request): Response` 方法。
- **"node"** —— 期望一个 Node.js 风格的 `(req, res)` 处理器。Nitro 会自动将其转换为兼容 Web 的处理器。

自动检测时，格式由文件名决定：`server.node.ts` 使用 `"node"` 格式，而 `server.ts` 使用 `"web"` 格式。

### 禁用服务端入口

将 `serverEntry` 设置为 `false` 以禁用自动检测，并阻止 Nitro 使用任何服务端入口：

```ts [nitro.config.ts]
import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  serverEntry: false
})
```

## 使用事件处理器

你还可以使用 `defineHandler` 导出事件处理器，以获得更好的类型推断和对 h3 事件对象的访问：

```ts [server.ts]
import { defineHandler } from "nitro";

export default defineHandler((event) => {
  // 添加自定义上下文
  event.context.requestId = crypto.randomUUID();
  event.context.timestamp = Date.now();

  // 记录请求日志
  console.log(`[${event.context.requestId}] ${event.method} ${event.path}`);

  // 继续执行下一个处理器（不返回任何内容）
});
```

<important>

如果你的服务端入口返回 `undefined` 或不返回任何内容，请求将继续由路由和渲染器处理。如果它返回了响应，则请求生命周期在此停止。

</important>

## 请求生命周期

服务端入口被注册为通配符（`/**`）路由处理器。当特定路由（如 `/api/hello`）匹配到请求时，该路由处理器具有优先权。对于不匹配任何特定路由的请求，服务端入口在渲染器之前运行：

```md
1. 服务端钩子：`request`
2. 路由规则（headers、redirects 等）
3. 全局中间件（middleware/）
4. 路由匹配：
   a. 特定路由（routes/）← 如果匹配，处理该请求
   b. 服务端入口 ← 针对未匹配的路由运行
   c. 渲染器（renderer.ts 或 index.html）
```

当同时存在服务端入口和渲染器时，它们会串联执行：服务端入口先运行，如果它没有返回响应，则渲染器处理该请求。

## 开发模式

在开发过程中，Nitro 会监视服务端入口文件的变更。当文件被创建、修改或删除时，开发服务器会自动重新加载以获取最新更改。

## 最佳实践

- 使用服务端入口处理影响**所有路由**的横切关注点
- 返回 `undefined` 以继续处理，返回响应以终止
- 保持服务端入口逻辑轻量以获得更好的性能
- 使用全局中间件处理模块化关注点，而不是一个庞大的服务端入口
- 考虑使用 [Nitro 插件](/docs/plugins) 处理初始化逻辑
- 避免在服务端入口中进行重度计算（它会为每个请求运行）
- 不要将服务端入口用于特定路由逻辑（请改用路由处理器，因为它们的性能更高）
