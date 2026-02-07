---
category: features
icon: i-lucide-layers
---

# 中间件

> 用于身份验证、日志记录和请求修改的请求中间件。

<!-- automd:ui-code-tree src="." default="server/middleware/auth.ts" ignore="README.md,GUIDE.md" expandAll -->

::code-tree{defaultValue="server/middleware/auth.ts" expandAll}

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  serverDir: true,
});
```

```json [package.json]
{
  "type": "module",
  "scripts": {
    "dev": "nitro dev",
    "build": "nitro build"
  },
  "devDependencies": {
    "nitro": "latest"
  }
}
```

```ts [server.ts]
import { defineHandler } from "nitro/h3";

export default defineHandler((event) => ({
  auth: event.context.auth,
}));
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

```ts [server/middleware/auth.ts]
import { defineMiddleware } from "nitro/h3";

export default defineMiddleware((event) => {
  event.context.auth = { name: "User " + Math.round(Math.random() * 100) };
});
```

::

<!-- /automd -->

<!-- automd:file src="GUIDE.md" -->

中间件函数在每次请求时都会在路由处理器之前运行。它们可以修改请求、添加上下文，或提前返回响应。

## 定义中间件

在 `server/middleware/` 目录下创建文件。它们将按字母顺序执行：

```ts [server/middleware/auth.ts]
import { defineMiddleware } from "nitro/h3";

export default defineMiddleware((event) => {
  event.context.auth = { name: "User " + Math.round(Math.random() * 100) };
});
```

中间件可以：
- 向 `event.context` 添加数据，以便处理器使用
- 提前返回响应以短路请求
- 修改请求头或其他属性

## 在处理器中访问上下文

中间件中添加到 `event.context` 的数据，在所有后续处理器中可用：

```ts [server.ts]
import { defineHandler } from "nitro/h3";

export default defineHandler((event) => ({
  auth: event.context.auth,
}));
```

<!-- /automd -->

## 了解更多

- [路由](/docs/routing)