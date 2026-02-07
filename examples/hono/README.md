---
category: 后端框架
icon: i-logos-hono
---

# Hono

> 使用服务器入口将 Hono 集成到 Nitro 中。

<!-- automd:ui-code-tree src="." default="server.ts" ignore="README.md,GUIDE.md" expandAll -->

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
    "hono": "^4.11.7",
    "nitro": "latest"
  }
}
```

```ts [server.ts]
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello, Hono with Nitro!");
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

<!-- automd:file src="GUIDE.md" -->

## 服务器入口

```ts [server.ts]
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello, Hono with Nitro!");
});

export default app;
```

Nitro 会自动检测项目根目录中的 `server.ts` 并将其用作服务器入口。Hono 应用处理所有传入请求，使你可以完全控制路由和中间件。

Hono 兼容多种运行时，因此此服务器入口可用于所有 Nitro 部署目标，包括 Node.js、Deno、Bun 以及 Cloudflare Workers。

<!-- /automd -->

## 了解更多

- [服务器入口](/docs/server-entry)
- [Hono 文档](https://hono.dev/)
