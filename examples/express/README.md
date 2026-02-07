---
category: backend frameworks
icon: i-simple-icons-express
---

# Express

> 使用服务器入口将 Express 集成到 Nitro 中。

<!-- automd:ui-code-tree src="." default="server.node.ts" ignore="README.md,GUIDE.md" expandAll -->

::code-tree{defaultValue="server.node.ts" expandAll}

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
    "@types/express": "^5.0.6",
    "express": "^5.2.1",
    "nitro": "latest"
  }
}
```

```ts [server.node.ts]
import Express from "express";

const app = Express();

app.use("/", (_req, res) => {
  res.send("Hello from Express with Nitro!");
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

```ts [server.node.ts]
import Express from "express";

const app = Express();

app.use("/", (_req, res) => {
  res.send("Hello from Express with Nitro!");
});

export default app;
```

Nitro 会自动检测项目根目录下的 `server.node.ts` 并将其作为服务器入口。Express 应用处理所有传入请求，让你完全控制路由和中间件。

::note
`.node.ts` 后缀表示该入口仅限于 Node.js 使用，无法在 Cloudflare Workers 或 Deno 等其他运行时环境中运行。
::

<!-- /automd -->

## 了解更多

- [服务器入口](/docs/server-entry)
- [Express 文档](https://expressjs.com/)
