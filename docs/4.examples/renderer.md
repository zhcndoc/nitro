---
category: 服务端渲染
icon: i-lucide-code
---

# 自定义渲染器

> 使用 Nitro 构建一个带有服务端数据获取的自定义 HTML 渲染器。

<!-- automd:ui-code-tree src="../../examples/renderer" default="renderer.ts" ignore="README.md,GUIDE.md" expandAll -->

::code-tree{defaultValue="renderer.ts" expandAll}

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  serverDir: "./",
  renderer: { handler: "./renderer" },
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

```ts [renderer.ts]
import { fetch } from "nitro";

export default async function renderer({ url }: { req: Request; url: URL }) {
  const apiRes = await fetch("/api/hello").then((res) => res.text());
  return new Response(
    /* html */ `<!DOCTYPE html>
    <html>
    <head>
      <title>自定义渲染器</title>
    </head>
    <body>
      <h1>来自自定义渲染器的问候！</h1>
      <p>当前路径: ${url.pathname}</p>
      <p>API 返回: ${apiRes}</p>
    </body>
    </html>`,
    { headers: { "content-type": "text/html; charset=utf-8" } }
  );
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
import { defineHandler } from "nitro";

export default defineHandler(() => "Nitro 真棒！");
```

::

<!-- /automd -->

<!-- automd:file src="../../examples/renderer/README.md" -->

创建一个自定义渲染器，生成包含来自 API 路由数据的 HTML 响应。使用 Nitro 内部的 `fetch` 调用路由，无需网络开销。

## 渲染器

```ts [renderer.ts]
import { fetch } from "nitro";

export default async function renderer({ url }: { req: Request; url: URL }) {
  const apiRes = await fetch("/api/hello").then((res) => res.text());
  return new Response(
    /* html */ `<!DOCTYPE html>
    <html>
    <head>
      <title>自定义渲染器</title>
    </head>
    <body>
      <h1>来自自定义渲染器的问候！</h1>
      <p>当前路径: ${url.pathname}</p>
      <p>API 返回: ${apiRes}</p>
    </body>
    </html>`,
    { headers: { "content-type": "text/html; charset=utf-8" } }
  );
}
```

Nitro 会自动检测项目根目录下的 `renderer.ts` 并用于所有非 API 路由。渲染函数接收请求 URL 并返回一个 `Response`。

使用来自 `nitro` 的 `fetch` 调用 API 路由，无需网络开销 —— 这些请求在进程内完成。

## API 路由

```ts [api/hello.ts]
import { defineHandler } from "nitro";

export default defineHandler(() => "Nitro 真棒！");
```

在 `api/` 目录中定义 API 路由。当渲染器调用 `fetch("/api/hello")` 时，执行该处理函数并返回响应。

<!-- /automd -->

## 了解更多

- [渲染器](/docs/renderer)
