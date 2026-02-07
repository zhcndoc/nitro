创建一个自定义渲染器，用于生成包含 API 路由数据的 HTML 响应。使用 Nitro 内部的 `fetch` 调用路由，无需网络开销。

## 渲染器

```ts [renderer.ts]
import { fetch } from "nitro";

export default async function renderer({ url }: { req: Request; url: URL }) {
  const apiRes = await fetch("/api/hello").then((res) => res.text());
  return new Response(
    /* html */ `<!DOCTYPE html>
    <html>
    <head>
      <title>Custom Renderer</title>
    </head>
    <body>
      <h1>Hello from custom renderer!</h1>
      <p>当前路径: ${url.pathname}</p>
      <p>API 响应: ${apiRes}</p>
    </body>
    </html>`,
    { headers: { "content-type": "text/html; charset=utf-8" } }
  );
}
```

Nitro 会自动检测项目根目录中的 `renderer.ts` 并将其用于所有非 API 路由。渲染器函数接收请求 URL 并返回一个 `Response`。

使用来自 `nitro` 的 `fetch` 调用 API 路由，无需网络开销——这些请求在进程内完成。

## API 路由

```ts [api/hello.ts]
import { defineHandler } from "nitro/h3";

export default defineHandler(() => "Nitro 非常棒！");
```

在 `api/` 目录中定义 API 路由。当渲染器调用 `fetch("/api/hello")` 时，该处理器执行并返回响应。