这个示例展示了如何捕获所有错误并返回自定义格式的响应。当路由抛出错误时，Nitro 会调用自定义错误处理器，而不是显示默认的错误页面。

## 错误处理

创建一个 `error.ts` 文件，放在项目根目录下，用于定义全局错误处理器：

```ts [error.ts]
import { defineErrorHandler } from "nitro";

export default defineErrorHandler((error, _event) => {
  return new Response(`自定义错误处理器：${error.message}`, {
    status: 500,
    headers: { "Content-Type": "text/plain" },
  });
});
```

错误处理器会接收到抛出的错误和 H3 事件对象。你可以通过事件对象访问请求的详细信息，如请求头、Cookie 或 URL 路径，从而根据不同的路由定制响应。

## 触发错误

主处理器会抛出一个错误，用于演示自定义错误处理器的功能：

```ts [server.ts]
import { defineHandler, HTTPError } from "nitro";

export default defineHandler(() => {
  throw new HTTPError("示例错误！", { status: 500 });
});
```

当你访问该页面时，你将看到“自定义错误处理器：示例错误！”的信息，而不是一个通用的错误页面，因为错误处理器拦截了抛出的错误。
