## 服务器入口

```ts [server.ts]
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello, Hono with Nitro!");
});

export default app;
```

Nitro 会自动检测项目根目录中的 `server.ts` 并将其作为服务器入口。Hono 应用处理所有传入请求，让你对路由和中间件拥有完全的控制权。

Hono 跨运行时兼容，因此该服务器入口支持所有 Nitro 部署目标，包括 Node.js、Deno、Bun 和 Cloudflare Workers。