---
category: 后端框架
icon: i-logos-hono
---

# Hono

> 使用服务端入口将 Hono 与 Nitro 集成。

<!-- automd:ui-code-tree src="../../examples/hono" default="server.ts" ignore="README.md,GUIDE.md" expandAll -->

::code-tree{defaultValue="server.ts" expandAll}

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({});
```

```json [package.json]
{
  "type": "module",
  "scripts": {
    "build": "nitro build",
    "dev": "nitro dev"
  },
  "devDependencies": {
    "hono": "^4.12.9",
    "nitro": "latest"
  }
}
```

```ts [server.ts]
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
  return c.text("你好，Hono 与 Nitro！");
});

export default app;
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

::

<!-- /automd -->

<!-- automd:file src="../../examples/hono/README.md" -->

## 服务端入口

```ts [server.ts]
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
  return c.text("你好，Hono 与 Nitro！");
});

export default app;
```

Nitro 会自动检测项目根目录中的 `server.ts` 并将其用作服务端入口。Hono 应用处理所有传入请求，让你完全掌控路由和中间件。

Hono 具有跨运行时兼容性，因此该服务端入口可在所有 Nitro 部署目标上运行，包括 Node.js、Deno、Bun 和 Cloudflare Workers。

<!-- /automd -->

## 了解更多

- [服务端入口](/docs/server-entry)
- [Hono 文档](https://hono.dev/)
