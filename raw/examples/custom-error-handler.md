# 自定义错误处理器

> 使用全局错误处理器来自定义错误响应。

<code-tree :expand-all="true" default-value="error.ts">

```ts [error.ts]
import { defineErrorHandler } from "nitro";

export default defineErrorHandler((error, _event) => {
  return new Response(`Custom Error Handler: ${error.message}`, {
    status: 500,
    headers: { "Content-Type": "text/plain" },
  });
});
```

```ts [nitro.config.ts]
import { defineConfig } from "nitro";
// 从 "./error" 导入 errorHandler

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
import { defineHandler, HTTPError } from "nitro";

export default defineHandler(() => {
  throw new HTTPError("Example Error!", { status: 500 });
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

</code-tree>

此示例展示了如何拦截所有错误并返回自定义响应格式。当任何路由抛出错误时，Nitro 会调用你的错误处理器，而不是返回默认的错误页面。

## 错误处理器

在项目根目录创建 `error.ts` 文件来定义全局错误处理器：

```ts [error.ts]
import { defineErrorHandler } from "nitro";

export default defineErrorHandler((error, _event) => {
  return new Response(`Custom Error Handler: ${error.message}`, {
    status: 500,
    headers: { "Content-Type": "text/plain" },
  });
});
```

处理器接收抛出的错误和 H3 事件对象。你可以使用事件来访问请求详情，如请求头、Cookie 或 URL 路径，以便为每个路由自定义响应。

## 触发错误

主处理器抛出一个错误来演示自定义错误处理器：

```ts [server.ts]
import { defineHandler, HTTPError } from "nitro";

export default defineHandler(() => {
  throw new HTTPError("Example Error!", { status: 500 });
});
```

当你访问页面时，你会看到「Custom Error Handler: Example Error!」而不是通用错误页面，因为错误处理器拦截了抛出的错误。

## 了解更多

- [服务器入口](/docs/server-entry)
