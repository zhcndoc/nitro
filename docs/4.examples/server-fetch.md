---
category: features
icon: i-lucide-arrow-right-left
---

# 服务器获取

> 内部服务器到服务器的请求，无网络开销。

<!-- automd:ui-code-tree src="../../examples/server-fetch" default="routes/index.ts" ignore="README.md,GUIDE.md" expandAll -->

::code-tree{defaultValue="routes/index.ts" expandAll}

```ts [nitro.config.ts]
import { defineConfig, serverFetch } from "nitro";

export default defineConfig({
  serverDir: "./",
  hooks: {
    "dev:start": async () => {
      const res = await serverFetch("/hello");
      const text = await res.text();
      console.log("在 nitro 模块中获取 /hello:", res.status, text);
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

::

<!-- /automd -->

<!-- automd:file src="../../examples/server-fetch/README.md" -->

当你需要一个路由调用另一个路由时，使用 Nitro 的 `fetch` 函数，而不是全局的 fetch。它进行的是保持在进程内的内部请求，避免网络往返。请求不会离开服务器。

## 主路由

```ts [routes/index.ts]
import { defineHandler } from "nitro";
import { fetch } from "nitro";

export default defineHandler(() => fetch("/hello"));
```

索引路由从 `nitro` 导入 `fetch`（而非全局 fetch），并调用 `/hello` 路由。此请求内部处理，不经过网络栈。

## 内部 API 路由

```ts [routes/hello.ts]
import { defineHandler } from "nitro";

export default defineHandler(() => "Hello!");
```

一个简单路由，返回 "Hello!"。当索引路由调用 `fetch("/hello")` 时，这个处理函数运行，响应被直接返回。

<!-- /automd -->

## 了解更多

- [路由](/docs/routing)
