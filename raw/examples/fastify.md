# Fastify

> 使用服务器入口将 Fastify 与 Nitro 集成。

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
    "fastify": "^5.7.4",
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

</code-tree>

## 服务器入口

```ts [server.node.ts]
import Fastify from "fastify";

const app = Fastify();

app.get("/", () => "Hello, Fastify with Nitro!");

await app.ready();

export default app.routing;
```

Nitro 会自动检测项目根目录下的 `server.node.ts` 并将其用作服务器入口。

调用 `await app.ready()` 以初始化所有已注册的插件，然后导出。在导出时请导出 `app.routing`（而非 `app`），以便 Nitro 获取请求处理函数。

<note>

`.node.ts` 后缀表示此入口特定于 Node.js，无法在 Cloudflare Workers 或 Deno 等其他运行时使用。

</note>

## 了解更多

- [服务器入口](/docs/server-entry)
- [Fastify 文档](https://fastify.dev/)
