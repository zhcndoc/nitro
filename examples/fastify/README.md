## Server Entry

```ts [server.node.ts]
import Fastify from "fastify";

const app = Fastify();

app.get("/", () => "Hello, Fastify with Nitro!");

await app.ready();

export default app.routing;
```

Nitro 会自动检测项目根目录中的 `server.node.ts` 并将其用作服务器入口。

调用 `await app.ready()` 以初始化所有已注册的插件，然后再导出。导出 `app.routing`（而非 `app`）以向 Nitro 提供请求处理函数。

::note
`.node.ts` 后缀表明此入口文件是针对 Node.js 的，不能在 Cloudflare Workers、Deno 等其他运行时中使用。
::
