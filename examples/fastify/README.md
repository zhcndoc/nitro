## 服务器入口

```ts [server.node.ts]
import Fastify from "fastify";

const app = Fastify();

app.get("/", () => "Hello, Fastify with Nitro!");

await app.ready();

export default app.routing;
```

Nitro 会自动检测项目根目录中的 `server.node.ts`，并将其用作服务器入口

在导出之前调用 `await app.ready()`，以初始化所有已注册的插件。导出 `app.routing`（而不是 `app`），为 Nitro 提供请求处理函数

::note
`.node.ts` 后缀表示此入口专用于 Node.js，无法在 Cloudflare Workers 或 Deno 等其他运行时中运行
::
