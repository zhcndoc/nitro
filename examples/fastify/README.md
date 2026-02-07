---
category: backend frameworks
icon: i-simple-icons-fastify
---

# Fastify

> 使用服务器入口将 Fastify 与 Nitro 集成。

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
    "fastify": "^5.7.2",
    "nitro": "latest"
  }
}
```

```ts [server.node.ts]
import Fastify from "fastify";

const app = Fastify();

app.get("/", () => "Hello, Fastify with Nitro!");

await app.ready();

export default app.routing;
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
import Fastify from "fastify";

const app = Fastify();

app.get("/", () => "Hello, Fastify with Nitro!");

await app.ready();

export default app.routing;
```

Nitro 会自动检测项目根目录中的 `server.node.ts` 并将其用作服务器入口。

调用 `await app.ready()` 以初始化所有已注册的插件，然后再导出。导出 `app.routing`（而非 `app`）以向 Nitro 提供请求处理函数。

::note
`.node.ts` 后缀表明此入口文件是针对 Node.js 的，不能在 Cloudflare Workers、Deno 等其他运行时中使用。
::

<!-- /automd -->

## 了解更多

- [服务器入口](/docs/server-entry)
- [Fastify 文档](https://fastify.dev/)
