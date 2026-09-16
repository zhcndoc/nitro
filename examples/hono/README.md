## 服务器入口

```ts [server.ts]
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello, Hono with Nitro!");
});

export default app;
```

Nitro 会自动检测项目根目录中的 `server.ts`，并将其用作服务器入口。Hono 应用会处理所有传入请求，让你完全控制路由和中间件。

Hono 兼容多种运行时，因此此服务器入口可在所有 Nitro 部署目标中运行，包括 Node.js、Deno、Bun 和 Cloudflare Workers。
