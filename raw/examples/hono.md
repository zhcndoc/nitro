# Hono

> 使用服务器入口将 Hono 集成到 Nitro 中。

<code-tree :expand-all="true" default-value="server.ts" expand-all="">

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
    "hono": "^4.11.8",
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

</code-tree>

## 服务器入口

```ts [server.ts]
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello, Hono with Nitro!");
});

export default app;
```

Nitro 会自动检测项目根目录中的 `server.ts` 并将其作为服务器入口。Hono 应用处理所有传入请求，让你对路由和中间件拥有完全的控制权。

Hono 跨运行时兼容，因此该服务器入口支持所有 Nitro 部署目标，包括 Node.js、Deno、Bun 和 Cloudflare Workers。

## 了解更多

- [服务器入口](/docs/server-entry)
- [Hono 文档](https://hono.dev/)
