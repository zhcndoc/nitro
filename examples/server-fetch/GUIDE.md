当你需要一个路由调用另一个路由时，使用 Nitro 的 `fetch` 函数而不是全局的 fetch。它会发起内部请求，保持进程内处理，避免网络往返。请求永远不会离开服务器。

## 主路由

```ts [routes/index.ts]
import { defineHandler } from "nitro/h3";
import { fetch } from "nitro";

export default defineHandler(() => fetch("/hello"));
```

主路由从 `nitro` 导入了 `fetch`（而不是全局的 fetch），并调用了 `/hello` 路由。此请求在内部处理，不经过网络栈。

## 内部 API 路由

```ts [routes/hello.ts]
import { defineHandler } from "nitro/h3";

export default defineHandler(() => "Hello!");
```

一个简单的路由，返回 "Hello!"。当主路由调用 `fetch("/hello")` 时，这个处理器会运行并直接返回它的响应。