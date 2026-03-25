# 服务端 Fetch

> 内部服务器到服务器的请求，无网络开销。

<code-tree :expand-all="true" default-value="routes/index.ts">

```ts [nitro.config.ts]
import { defineConfig, serverFetch } from "nitro";

export default defineConfig({
  serverDir: "./",
  hooks: {
    "dev:start": async () => {
      const res = await serverFetch("/hello");
      const text = await res.text();
      console.log("Fetched /hello in nitro module:", res.status, text);
    },
  },
});
```

```json [package.json]
{
  "type": "module",
  "scripts": {
    "dev": "nitro dev",
    "build": "nitro build"
  },
  "devDependencies": {
    "nitro": "latest"
  }
}
```

```json [tsconfig.json]
{
  "extends": "nitro/tsconfig"
}
```

```ts [vite.config.ts]
import { defineConfig } from "vite";
import { nitro } from "nitro/vite";

export default defineConfig({ plugins: [nitro()] });
```

```ts [routes/hello.ts]
import { defineHandler } from "nitro";

export default defineHandler(() => "Hello!");
```

```ts [routes/index.ts]
import { defineHandler } from "nitro";
import { fetch } from "nitro";

export default defineHandler(() => fetch("/hello"));
```

</code-tree>

当你需要一个路由调用另一个路由时，请使用 Nitro 的 `fetch` 函数，而非全局 fetch。它发起进程内的内部请求，避免网络往返。请求永远不会离开服务器。

## 主路由

```ts [routes/index.ts]
import { defineHandler } from "nitro";
import { fetch } from "nitro";

export default defineHandler(() => fetch("/hello"));
```

索引路由从 `nitro` 导入 `fetch`（而非全局 fetch）并调用 `/hello` 路由。此请求在内部处理，无需经过网络协议栈。

## 内部 API 路由

```ts [routes/hello.ts]
import { defineHandler } from "nitro";

export default defineHandler(() => "Hello!");
```

一个返回 "Hello!" 的简单路由。当索引路由调用 `fetch("/hello")` 时，此处理函数运行并直接返回其响应。

## 了解更多

- [路由](/docs/routing)
