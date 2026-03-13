## Server Entry

```ts [server.node.ts]
import Express from "express";

const app = Express();

app.use("/", (_req, res) => {
  res.send("Hello from Express with Nitro!");
});

export default app;
```

Nitro 会自动检测项目根目录下的 `server.node.ts` 并将其作为服务器入口。Express 应用处理所有传入请求，让你完全控制路由和中间件。

::note
`.node.ts` 后缀表示该入口仅限于 Node.js 使用，无法在 Cloudflare Workers 或 Deno 等其他运行时环境中运行。
::
