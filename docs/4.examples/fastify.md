---
category: backend frameworks
icon: i-simple-icons-fastify
---

# Fastify

> 使用服务端入口将 Fastify 与 Nitro 集成。

<!-- automd:ui-code-tree src="../../examples/fastify" default="server.node.ts" ignore="README.md,GUIDE.md" expandAll -->

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
    "fastify": "^5.8.2",
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

<!-- automd:file src="../../examples/fastify/README.md" -->

## 服务端入口

```ts [server.node.ts]
import Fastify from "fastify";

const app = Fastify();

app.get("/", () => "Hello, Fastify with Nitro!");

await app.ready();

export default app.routing;
```

Nitro 会自动检测项目根目录下的 `server.node.ts` 并将其用作服务端入口。

在导出前调用 `await app.ready()` 以初始化所有已注册的插件。导出 `app.routing`（而非 `app`）以向 Nitro 提供请求处理器函数。

::note
`.node.ts` 后缀表明此入口是 Node.js 专用的，无法在其他运行时（如 Cloudflare Workers 或 Deno）中运行。
::

<!-- /automd -->

## 了解更多

- [Server Entry](/docs/server-entry)
- [Fastify Documentation](https://fastify.dev/)
