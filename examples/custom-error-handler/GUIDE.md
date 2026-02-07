这个示例展示了如何拦截所有错误并返回自定义的响应格式。当任何路由抛出错误时，Nitro 会调用你的错误处理器，而不是返回默认的错误页面。

## 错误处理器

在项目根目录下创建一个 `error.ts` 文件来定义全局错误处理器：

```ts [error.ts]
import { defineErrorHandler } from "nitro";

export default defineErrorHandler((error, _event) => {
  return new Response(`自定义错误处理器: ${error.message}`, {
    status: 500,
    headers: { "Content-Type": "text/plain" },
  });
});
```

该处理器接收抛出的错误和 H3 事件对象。你可以使用事件对象访问请求详情，如请求头、Cookie 或 URL 路径，以针对不同路由自定义响应。

## 触发错误

主处理器抛出一个错误，以演示自定义错误处理器：

```ts [server.ts]
import { defineHandler, HTTPError } from "nitro/h3";

export default defineHandler(() => {
  throw new HTTPError("示例错误！", { status: 500 });
});
```

当你访问该页面时，不会看到通用的错误页面，而是看到“自定义错误处理器: 示例错误！”，因为错误处理器拦截了抛出的错误。