---
category: features
icon: i-lucide-arrow-right-left
---

# 服务器请求

> 内部服务器到服务器的请求，无网络开销。

<!-- automd:ui-code-tree src="." default="routes/index.ts" ignore="README.md,GUIDE.md" expandAll -->

::code-tree{defaultValue="routes/index.ts" expandAll}

```ts [nitro.config.ts]
import { defineConfig, serverFetch } from "nitro";

export default defineConfig({
  serverDir: "./",
  hooks: {
    "dev:start": async () => {
      const res = await serverFetch("/hello");
      const text = await res.text();
      console.log("在 nitro 模块中请求 /hello:", res.status, text);
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

::

<!-- /automd -->

<!-- automd:file src="GUIDE.md" -->

当你需要一个路由调用另一个路由时，使用 Nitro 的 `fetch` 函数，而不是全局的 fetch。它发起的内部请求保持在进程内，避免了网络往返。请求永远不会离开服务器。

## 主路由

```ts [routes/index.ts]
import { defineHandler } from "nitro/h3";
import { fetch } from "nitro";

export default defineHandler(() => fetch("/hello"));
```

index 路由从 `nitro` 导入 `fetch`（而非全局 fetch），并调用 `/hello` 路由。该请求会在内部处理，而不会经过网络栈。

## 内部 API 路由

```ts [routes/hello.ts]
import { defineHandler } from "nitro/h3";

export default defineHandler(() => "Hello!");
```

一个简单路由，返回字符串 "Hello!"。当 index 路由调用 `fetch("/hello")` 时，此处理函数会运行，且响应会被直接返回。

<!-- /automd -->

## 了解更多

- [路由](/docs/routing)