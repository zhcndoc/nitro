---
category: 后端框架
icon: i-skill-icons-elysia-dark
---

# Elysia

> 使用服务端入口将 Elysia 与 Nitro 集成。

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
    "elysia": "^1.4.22",
    "nitro": "latest"
  }
}
```

```ts [server.ts]
import { Elysia } from "elysia";

const app = new Elysia();

app.get("/", () => "Hello, Elysia with Nitro!");

export default app.compile();
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

## 服务端入口

```ts [server.ts]
import { Elysia } from "elysia";

const app = new Elysia();

app.get("/", () => "Hello, Elysia with Nitro!");

export default app.compile();
```

Nitro 会自动检测项目根目录下的 `server.ts` 并将其作为服务端入口。Elysia 应用负责处理所有传入请求，让你可以完全掌控路由和中间件。

导出之前调用 `app.compile()`，以优化路由器用于生产环境。

<!-- /automd -->

## 了解更多

- [服务端入口](/docs/server-entry)
- [Elysia 文档](https://elysiajs.com/)
