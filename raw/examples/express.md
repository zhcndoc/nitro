# Express

> 使用服务器入口将 Express 集成到 Nitro 中。

<code-tree :expand-all="true" default-value="server.node.ts" expand-all="">

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

</code-tree>

## 服务器入口

```ts [server.node.ts]
import Express from "express";

const app = Express();

app.use("/", (_req, res) => {
  res.send("Hello from Express with Nitro!");
});

export default app;
```

Nitro 会自动检测项目根目录下的 `server.node.ts` 并将其作为服务器入口。Express 应用处理所有传入请求，使你能够完全控制路由和中间件。

<note>

`.node.ts` 后缀表示此入口特定于 Node.js，无法在 Cloudflare Workers 或 Deno 等其他运行环境中运行。

</note>

## 了解更多

- [服务器入口](/docs/server-entry)
- [Express 文档](https://expressjs.com/)
