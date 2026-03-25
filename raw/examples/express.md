# Express

> 使用服务端入口将 Express 与 Nitro 集成。

<code-tree :expand-all="true" default-value="server.node.ts">

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

## 服务端入口

```ts [server.node.ts]
import Express from "express";

const app = Express();

app.use("/", (_req, res) => {
  res.send("Hello from Express with Nitro!");
});

export default app;
```

Nitro 会在你的项目根目录自动检测 `server.node.ts` 并将其用作服务端入口。Express 应用会处理所有传入的请求，让你完全掌控路由和中间件。

<note>

`.node.ts` 后缀表明此入口是 Node.js 专有的，无法在其他运行时（如 Cloudflare Workers 或 Deno）中工作。

</note>

## 了解更多

- [服务端入口](/docs/server-entry)
- [Express 文档](https://expressjs.com/)
