## 服务器入口

```ts [server.ts]
import { Elysia } from "elysia";

const app = new Elysia();

app.get("/", () => "Hello, Elysia with Nitro!");

export default app.compile();
```

Nitro 会自动检测项目根目录中的 `server.ts` 并将其作为服务器入口。Elysia 应用处理所有传入的请求，让你完全控制路由和中间件。

在导出之前调用 `app.compile()` 以优化生产环境的路由器。
