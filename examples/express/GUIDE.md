## 服务器入口

```ts [server.node.ts]
import Express from "express";

const app = Express();

app.use("/", (_req, res) => {
  res.send("Hello from Express with Nitro!");
});

export default app;
```

Nitro 会自动检测项目根目录下的 `server.node.ts` 并将其作为服务器入口。Express 应用处理所有传入请求，使你能够完全控制路由和中间件。

::note
`.node.ts` 后缀表示此入口特定于 Node.js，无法在 Cloudflare Workers 或 Deno 等其他运行环境中运行。
::