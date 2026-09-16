## 服务器入口

```ts [server.node.ts]
import Express from "express";

const app = Express();

app.use("/", (_req, res) => {
  res.send("Hello from Express with Nitro!");
});

export default app;
```

Nitro 会自动检测项目根目录中的 `server.node.ts`，并将其用作服务器入口。Express 应用会处理所有传入的请求，让你能够完全控制路由和中间件。

::note
`.node.ts` 后缀表示此入口专用于 Node.js，无法在 Cloudflare Workers 或 Deno 等其他运行时中使用。
::
