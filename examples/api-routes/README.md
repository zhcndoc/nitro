Nitro 支持在 `api/` 或 `routes/` 目录中进行基于文件的路由。每个文件都会根据其路径成为一个 API 端点。

## 基本路由

在 `api/` 目录中创建一个文件来定义路由。文件路径会成为 URL 路径：

```ts [api/hello.ts]
import { defineHandler } from "nitro";

export default defineHandler(() => "Nitro is amazing!");
```

这会创建一个 `GET /api/hello` 端点。

## 动态路由

使用方括号 `[param]` 表示动态 URL 段。通过 `event.context.params` 访问参数：

```ts [api/hello/[name].ts]
import { defineHandler } from "nitro";

export default defineHandler((event) => `Hello (param: ${event.context.params!.name})!`);
```

这会创建一个 `GET /api/hello/:name` 端点（例如，`/api/hello/world`）。

## HTTP 方法

在文件名后添加 HTTP 方法（`.get.ts`、`.post.ts`、`.put.ts`、`.delete.ts` 等）：

### GET 处理程序

```ts [api/test.get.ts]
import { defineHandler } from "nitro";

export default defineHandler(() => "Test get handler");
```

### POST 处理程序

```ts [api/test.post.ts]
import { defineHandler } from "nitro";

export default defineHandler(async (event) => {
  const body = await event.req.json();
  return {
    message: "Test post handler",
    body,
  };
});
```
