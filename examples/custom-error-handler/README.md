This example shows how to intercept all errors and return a custom response format. When any route throws an error, Nitro calls your error handler instead of returning the default error page.

## 错误处理器

在项目根目录创建一个 `error.ts` 文件，定义全局错误处理器：

```ts [error.ts]
import { defineErrorHandler } from "nitro";

export default defineErrorHandler((error, _event) => {
  return new Response(`自定义错误处理器: ${error.message}`, {
    status: 500,
    headers: { "Content-Type": "text/plain" },
  });
});
```

该处理器接收抛出的错误和 H3 事件对象。你可以使用事件对象访问请求的详细信息，如头信息、cookie 或 URL 路径，以便针对不同路由定制响应。

## 触发错误

主处理器抛出一个错误，用以演示自定义错误处理器的作用：

```ts [server.ts]
import { defineHandler, HTTPError } from "nitro";

export default defineHandler(() => {
  throw new HTTPError("示例错误！", { status: 500 });
});
```

When you visit the page, instead of seeing a generic error page, you'll see "Custom Error Handler: Example Error!" because the error handler intercepts the thrown error.
