中间件函数会在每个请求中路由处理程序之前运行。它们可以修改请求、添加上下文或提前返回响应。

## 定义中间件

在 `server/middleware/` 中创建文件。它们会按字母顺序运行：

```ts [server/middleware/auth.ts]
import { defineMiddleware } from "nitro";

export default defineMiddleware((event) => {
  event.context.auth = { name: "User " + Math.round(Math.random() * 100) };
});
```

中间件可以：
- 向 `event.context` 添加数据，以供处理程序使用
- 提前返回响应，以短路请求
- 修改请求标头或其他属性

## 在处理程序中访问上下文

在中间件中添加到 `event.context` 的数据可在所有后续处理程序中使用：

```ts [server.ts]
import { defineHandler } from "nitro";

export default defineHandler((event) => ({
  auth: event.context.auth,
}));
```
