Nitro 支持在 `api/` 或 `routes/` 目录中基于文件的路由。每个文件都会根据其路径成为一个 API 端点。

## 基础路由

在 `api/` 目录下创建文件以定义路由。文件路径即为 URL 路径：

```ts [api/hello.ts]
import { defineHandler } from "nitro";

export default defineHandler(() => "Nitro 很棒！");
```

这将创建一个 `GET /api/hello` 端点。

## 动态路由

使用方括号 `[param]` 表示动态 URL 段。通过 `event.context.params` 访问参数：

```ts [api/hello/[name].ts]
import { defineHandler } from "nitro";

export default defineHandler((event) => `你好 (参数: ${event.context.params!.name})！`);
```

这将创建一个 `GET /api/hello/:name` 端点（例如 `/api/hello/world`）。

## HTTP 方法

在文件名后缀添加 HTTP 方法（`.get.ts`、`.post.ts`、`.put.ts`、`.delete.ts` 等）：

### GET 处理器

```ts [api/test.get.ts]
import { defineHandler } from "nitro";

export default defineHandler(() => "测试 GET 处理器");
```

### POST 处理器

```ts [api/test.post.ts]
import { defineHandler } from "nitro";

export default defineHandler(async (event) => {
  const body = await event.req.json();
  return {
    message: "测试 POST 处理器",
    body,
  };
});
```
