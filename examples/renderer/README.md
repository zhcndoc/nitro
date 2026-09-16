创建一个自定义渲染器，使用 API 路由中的数据生成 HTML 响应。使用 Nitro 的内部 `fetch` 调用路由，无需网络开销。

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
      <p>Current path: ${url.pathname}</p>
      <p>API says: ${apiRes}</p>
    </body>
    </html>`,
    { headers: { "content-type": "text/html; charset=utf-8" } }
  );
}
```

在 `nitro.config.ts` 中使用 `renderer: { handler: "./renderer" }` 配置渲染器，Nitro 会将其用于所有非 API 路由。渲染器函数接收请求 URL 并返回一个 `Response`。（或者，如果项目根目录中存在 `index.html`，Nitro 会自动将其检测为渲染器模板。）

使用来自 `nitro` 的 `fetch` 调用 API 路由，无需网络开销——这些请求会在进程内完成。

## API 路由

```ts [api/hello.ts]
import { defineHandler } from "nitro";

export default defineHandler(() => "Nitro is amazing!");
```

在 `api/` 目录中定义 API 路由。当渲染器调用 `fetch("/api/hello")` 时，此处理程序会运行并返回其响应。
