---
navigation:
  category: 服务端渲染
icon: i-material-symbols-html
---

# Rsbuild HTML SSR

> 使用原生 HTML、Rsbuild 和 Nitro 进行服务端渲染。

<!-- automd:ui-code-tree src="../../examples/rsbuild-ssr-html" default="app/entry-server.ts" ignore="README.md,GUIDE.md" expandAll -->

::code-tree{defaultValue="app/entry-server.ts" expandAll}

```html [index.html]
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Rsbuild + Nitro</title>
  </head>
  <body>
    <main id="app">
      <!--ssr-outlet-->
    </main>
  </body>
</html>
```

```json [package.json]
{
  "type": "module",
  "scripts": {
    "build": "rsbuild build",
    "dev": "rsbuild dev",
    "preview": "rsbuild preview"
  },
  "devDependencies": {
    "@rsbuild/core": "^2.3.0",
    "nitro": "latest"
  }
}
```

```ts [rsbuild.config.ts]
import { defineConfig } from "@rsbuild/core";
import { nitro } from "nitro/rsbuild";

export default defineConfig({
  source: {
    entry: { index: "./app/entry-client.ts" },
  },
  html: {
    template: "./index.html",
  },
  plugins: [nitro({ serverDir: "./" })],
});
```

```json [tsconfig.json]
{
  "extends": "nitro/tsconfig"
}
```

```ts [app/entry-client.ts]
const button = document.querySelector<HTMLButtonElement>("#counter")!;

let count = 0;
button.disabled = false;
button.addEventListener("click", () => {
  button.textContent = `Count: ${++count}`;
});
```

```ts [app/entry-server.ts]
import { fetch } from "nitro";

export default {
  async fetch(req: Request) {
    const { message } = (await fetch("/api/hello").then((res) => res.json())) as {
      message: string;
    };
    return /* html */ `
      <h1>${message}</h1>
      <p>Rendered on the server for <code>${new URL(req.url).pathname}</code>.</p>
      <button id="counter" disabled>Count: 0</button>
    `;
  },
};
```

```ts [routes/api/hello.ts]
import { defineHandler } from "nitro";

export default defineHandler(() => ({ message: "Hello from Nitro and Rsbuild!" }));
```

::

<!-- /automd -->

<!-- automd:file src="../../examples/rsbuild-ssr-html/README.md" -->

此示例不依赖框架，使用 [Rsbuild](https://rsbuild.rs) 和实验性的 `nitro/rsbuild` 插件在服务器上渲染 HTML 模板。

## 概述

1. 在 Rsbuild 配置中**添加 Nitro Rsbuild 插件**。
2. **创建 HTML 模板**，并在服务器内容插入的位置添加 `<!--ssr-outlet-->` 注释。
3. **创建服务器入口**（`app/entry-server.ts`）以渲染页面内容。
4. **创建客户端入口**（`app/entry-client.ts`）以实现页面交互。
5. **添加 API 路由**以提供服务器端数据。

## 工作原理

Nitro 会检测 `app/entry-server.ts`，并为 Rsbuild 应用添加 `ssr` 环境。服务器入口会导出一个包含 `fetch` 方法的对象，该方法通过 Nitro 内部 fetch 调用 `/api/hello` 路由，并返回页面 HTML。

`index.html` 是客户端的 Rsbuild HTML 模板：Rsbuild 会注入客户端脚本，Nitro 则在每次页面请求时使用服务器入口渲染 `<!--ssr-outlet-->` 注释。

运行 `rsbuild dev` 启动开发服务器，运行 `rsbuild build` 将客户端和服务器构建到 `.output/`。

<!-- /automd -->

## 了解更多

- [Rsbuild 集成](/docs/rsbuild)
- [渲染器](/docs/renderer)
