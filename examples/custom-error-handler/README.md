---
category: features
icon: i-lucide-alert-circle
---

# 自定义错误处理器

> 使用全局错误处理器自定义错误响应。

<!-- automd:ui-code-tree src="." default="error.ts" ignore="README.md,GUIDE.md" expandAll -->

::code-tree{defaultValue="error.ts" expandAll}

```ts [error.ts]
import { defineErrorHandler } from "nitro";

export default defineErrorHandler((error, _event) => {
  return new Response(`自定义错误处理器: ${error.message}`, {
    status: 500,
    headers: { "Content-Type": "text/plain" },
  });
});
```

```ts [nitro.config.ts]
import { defineConfig } from "nitro";
// import errorHandler from "./error";

export default defineConfig({
  errorHandler: "./error.ts",
  // devErrorHandler: errorHandler,
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
import { defineHandler, HTTPError } from "nitro/h3";

export default defineHandler(() => {
  throw new HTTPError("示例错误！", { status: 500 });
});
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

此示例展示了如何拦截所有错误并返回自定义响应格式。当任何路由抛出错误时，Nitro 会调用你的错误处理器，而不是返回默认错误页面。

## 错误处理器

在项目根目录创建一个 `error.ts` 文件，定义全局错误处理器：

```ts [error.ts]
import { defineErrorHandler } from "nitro";

export default defineErrorHandler((error, _event) => {
  return new Response(`自定义错误处理器: ${error.message}`, {
    status: 500,
    headers: { "Content-Type": "text/plain" },
  });
});
```

该处理器接收抛出的错误和 H3 事件对象。你可以使用事件对象访问请求的详细信息，如头信息、cookie 或 URL 路径，以便针对不同路由定制响应。

## 触发错误

主处理器抛出一个错误，用以演示自定义错误处理器的作用：

```ts [server.ts]
import { defineHandler, HTTPError } from "nitro/h3";

export default defineHandler(() => {
  throw new HTTPError("示例错误！", { status: 500 });
});
```

当你访问页面时，不会看到默认的通用错误页面，而是会看到 “自定义错误处理器: 示例错误！”——这是因为错误处理器拦截了抛出的错误。

<!-- /automd -->

## 了解更多

- [服务器入口](/docs/server-entry)