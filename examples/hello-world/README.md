---
category: features
icon: i-lucide-sparkles
---

# 你好，世界

> 使用 Web 标准 fetch 处理程序的最简 Nitro 服务器。

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
    "dev": "nitro dev",
    "preview": "node .output/server/index.mjs"
  },
  "devDependencies": {
    "nitro": "latest"
  }
}
```

```ts [server.ts]
export default {
  fetch(req: Request) {
    return new Response("Nitro Works!");
  },
};
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

最简单的 Nitro 服务器。导出一个带有 `fetch` 方法的对象，该方法接收一个标准的 `Request` 并返回一个 `Response`。没有框架，没有抽象，只有 Web 平台。

## 服务器入口

```ts [server.ts]
export default {
  fetch(req: Request) {
    return new Response("Nitro Works!");
  },
};
```

`fetch` 方法遵循与 Service Workers 和 Cloudflare Workers 相同的签名。此模式适用于所有部署目标，因为它使用了 Web 标准。

将 Nitro 插件添加到 Vite 中，插件会处理其余部分：开发服务器、热重载和生产构建。

<!-- /automd -->

## 了解更多

- [服务器入口](/docs/server-entry)
- [配置](/docs/configuration)