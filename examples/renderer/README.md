Create a custom renderer that generates HTML responses with data from API routes. Use Nitro's internal `fetch` to call routes without network overhead.

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
      <p>API 返回: ${apiRes}</p>
    </body>
    </html>`,
    { headers: { "content-type": "text/html; charset=utf-8" } }
  );
}
```

Nitro 会自动检测项目根目录中的 `renderer.ts` 并将其用于所有非 API 路由。渲染器函数接收请求的 URL 并返回一个 `Response`。

使用 Nitro 中的 `fetch` 调用 API 路由时不会产生网络开销——请求仍在进程内执行。

## API 路由

```ts [api/hello.ts]
import { defineHandler } from "nitro";

export default defineHandler(() => "Nitro 太棒了！");
```

Define API routes in the `api/` directory. When the renderer calls `fetch("/api/hello")`, this handler runs and returns its response.
