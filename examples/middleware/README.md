Middleware functions run before route handlers on every request. They can modify the request, add context, or return early responses.

## 定义中间件

在 `server/middleware/` 目录下创建文件。它们将按字母顺序执行：

```ts [server/middleware/auth.ts]
import { defineMiddleware } from "nitro";

export default defineMiddleware((event) => {
  event.context.auth = { name: "User " + Math.round(Math.random() * 100) };
});
```

中间件可以：
- 向 `event.context` 添加数据，以便处理器使用
- 提前返回响应以短路请求
- 修改请求头或其他属性

## 在处理器中访问上下文

中间件中添加到 `event.context` 的数据，在所有后续处理器中可用：

```ts [server.ts]
import { defineHandler } from "nitro";

export default defineHandler((event) => ({
  auth: event.context.auth,
}));
```
