When you need one route to call another, use Nitro's `fetch` function instead of the global fetch. It makes internal requests that stay in-process, avoiding network round-trips. The request never leaves the server.

## 主路由

```ts [routes/index.ts]
import { defineHandler } from "nitro";
import { fetch } from "nitro";

export default defineHandler(() => fetch("/hello"));
```

index 路由从 `nitro` 导入 `fetch`（而非全局 fetch），并调用 `/hello` 路由。该请求会在内部处理，而不会经过网络栈。

## 内部 API 路由

```ts [routes/hello.ts]
import { defineHandler } from "nitro";

export default defineHandler(() => "Hello!");
```

A simple route that returns "Hello!". When the index route calls `fetch("/hello")`, this handler runs and its response is returned directly.
