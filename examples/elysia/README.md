## Server Entry

```ts [server.ts]
import { Elysia } from "elysia";

const app = new Elysia();

app.get("/", () => "Hello, Elysia with Nitro!");

export default app.compile();
```

Nitro 会自动检测项目根目录下的 `server.ts` 并将其作为服务端入口。Elysia 应用负责处理所有传入请求，让你可以完全掌控路由和中间件。

Call `app.compile()` before exporting to optimize the router for production.
