# 服务器请求

> 内部服务器到服务器的请求，无网络开销。

<code-tree :expand-all="true" default-value="routes/index.ts" expand-all="">

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
import { defineHandler } from "nitro/h3";

export default defineHandler(() => "Hello!");
```

```ts [routes/index.ts]
import { defineHandler } from "nitro/h3";
import { fetch } from "nitro";

export default defineHandler(() => fetch("/hello"));
```

</code-tree>

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

## 了解更多

- [路由](/docs/routing)
