当你需要让一个路由调用另一个路由时，请使用 Nitro 的 `fetch` 函数，而不是全局 fetch。它会发起保持在进程内部的请求，避免网络往返。请求永远不会离开服务器。

## 主路由

```ts [routes/index.ts]
import { defineHandler } from "nitro";
import { fetch } from "nitro";

export default defineHandler(() => fetch("/hello"));
```

index 路由从 `nitro` 导入 `fetch`（而不是全局 fetch），并调用 `/hello` 路由。此请求会在内部处理，不会经过网络栈。

## 内部 API 路由

```ts [routes/hello.ts]
import { defineHandler } from "nitro";

export default defineHandler(() => "Hello!");
```

一个返回“Hello!”的简单路由。当 index 路由调用 `fetch("/hello")` 时，此处理程序会运行，并直接返回其响应。
