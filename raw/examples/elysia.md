# Elysia

> 使用 server entry 将 Elysia 与 Nitro 集成。

<code-tree :expand-all="true" default-value="server.ts">

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
    "elysia": "^1.4.28",
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

</code-tree>

## Server Entry（服务器入口）

```ts [server.ts]
import { Elysia } from "elysia";

const app = new Elysia();

app.get("/", () => "Hello, Elysia with Nitro!");

export default app.compile();
```

Nitro 会自动检测项目根目录中的 `server.ts`，并将其用作服务器入口。Elysia 应用处理所有传入请求，让你完全掌控路由和中间件。

在导出前调用 `app.compile()`，以针对生产环境优化路由。

## 了解更多

- [Server Entry（服务器入口）](/docs/server-entry)
- [Elysia 文档](https://elysiajs.com/)
