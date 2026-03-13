## Server Entry

```ts [server.ts]
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello, Hono with Nitro!");
});

export default app;
```

Nitro 会自动检测项目根目录中的 `server.ts` 并将其用作服务器入口。Hono 应用处理所有传入请求，使你可以完全控制路由和中间件。

Hono is cross-runtime compatible, so this server entry works across all Nitro deployment targets including Node.js, Deno, Bun, and Cloudflare Workers.
