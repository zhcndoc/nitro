# API 路由

> 基于文件的 API 路由，支持 HTTP 方法和动态参数。

<code-tree :expand-all="true" default-value="api/hello.ts" expand-all="">

```html [index.html]
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>API Routes</title>
  </head>
  <body>
    <h2>API Routes:</h2>
    <ul>
      <li><a href="/api/hello">/api/hello</a></li>
      <li><a href="/api/hello/world">/api/hello/world</a></li>
      <li><a href="/api/test">/api/test</a></li>
    </ul>
  </body>
</html>
```

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  serverDir: "./",
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

```ts [api/hello.ts]
import { defineHandler } from "nitro/h3";

export default defineHandler(() => "Nitro is amazing!");
```

```ts [api/test.get.ts]
import { defineHandler } from "nitro/h3";

export default defineHandler(() => "Test get handler");
```

```ts [api/test.post.ts]
import { defineHandler } from "h3";

export default defineHandler(async (event) => {
  const body = await event.req.json();
  return {
    message: "Test post handler",
    body,
  };
});
```

```ts [api/hello/[name].ts]
import { defineHandler } from "nitro/h3";

export default defineHandler((event) => `Hello (param: ${event.context.params!.name})!`);
```

</code-tree>

Nitro 支持在 `api/` 或 `routes/` 目录中的基于文件的路由。每个文件根据其路径变成一个 API 端点。

## 基本路由

在 `api/` 目录中创建一个文件来定义路由。文件路径即为 URL 路径：

```ts [api/hello.ts]
import { defineHandler } from "nitro/h3";

export default defineHandler(() => "Nitro is amazing!");
```

这将创建一个 `GET /api/hello` 端点。

## 动态路由

使用方括号 `[param]` 表示动态 URL 段。通过 `event.context.params` 访问参数：

```ts [api/hello/[name].ts]
import { defineHandler } from "nitro/h3";

export default defineHandler((event) => `Hello (param: ${event.context.params!.name})!`);
```

这将创建一个 `GET /api/hello/:name` 端点（例如 `/api/hello/world`）。

## HTTP 方法

通过文件后缀指定 HTTP 方法（`.get.ts`、`.post.ts`、`.put.ts`、`.delete.ts` 等）：

### GET 处理器

```ts [api/test.get.ts]
import { defineHandler } from "nitro/h3";

export default defineHandler(() => "Test get handler");
```

### POST 处理器

```ts [api/test.post.ts]
import { defineHandler } from "h3";

export default defineHandler(async (event) => {
  const body = await event.req.json();
  return {
    message: "Test post handler",
    body,
  };
});
```

## 了解更多

- [路由](/docs/routing)
