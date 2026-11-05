---
navigation:
  category: 服务端渲染
icon: i-logos-react
---

# 使用 Rsbuild 和 React 的 SSR

> 在 Nitro 中使用 Rsbuild 和 React 进行服务端渲染。

<!-- automd:ui-code-tree src="../../examples/rsbuild-ssr-react" default="src/entry-server.tsx" ignore="README.md,GUIDE.md" expandAll -->

::code-tree{defaultValue="src/entry-server.tsx" expandAll}

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
    "@rsbuild/plugin-react": "^2.1.1",
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0",
    "nitro": "latest",
    "react": "^19.3.1",
    "react-dom": "^19.3.1"
  }
}
```

```ts [rsbuild.config.ts]
import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { nitro } from "nitro/rsbuild";

export default defineConfig({
  source: {
    entry: { index: "./src/entry-client.tsx" },
  },
  // Pages are rendered by the server entry
  tools: { htmlPlugin: false },
  plugins: [pluginReact(), nitro({ serverDir: "./" })],
});
```

```json [tsconfig.json]
{
  "extends": "nitro/tsconfig",
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react"
  }
}
```

```tsx [src/app.tsx]
import { useState } from "react";

export function App() {
  const [count, setCount] = useState(0);
  return (
    <>
      <h1 className="hero">Nitro + Rsbuild + React</h1>
      <button onClick={() => setCount((c) => c + 1)}>Count is {count}</button>
    </>
  );
}
```

```tsx [src/entry-client.tsx]
import "./styles.css";
import { hydrateRoot } from "react-dom/client";
import { App } from "./app.tsx";

hydrateRoot(document.querySelector("#app")!, <App />);
```

```tsx [src/entry-server.tsx]
import { renderToReadableStream } from "react-dom/server.edge";
import { App } from "./app.tsx";

import clientAssets from "./entry-client.tsx?assets=client";

export default {
  async fetch(_req: Request) {
    return new Response(
      await renderToReadableStream(
        <html lang="en">
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            {clientAssets.css.map((attr) => (
              <link key={attr.href} rel="stylesheet" {...attr} />
            ))}
            {clientAssets.js.map((attr) => (
              <script key={attr.href} defer src={attr.href} />
            ))}
          </head>
          <body id="app">
            <App />
          </body>
        </html>
      ),
      { headers: { "Content-Type": "text/html;charset=utf-8" } }
    );
  },
};
```

```ts [src/env.d.ts]
/// <reference types="@rsbuild/core/types" />
/// <reference types="nitro/rsbuild/types" />
```

```css [src/styles.css]
.hero {
  color: orange;
}

button {
  background-color: lightskyblue;
}
```

```ts [routes/api/hello.ts]
import { defineHandler } from "nitro";

export default defineHandler(() => ({ message: "Hello from Nitro!" }));
```

::

<!-- /automd -->

<!-- automd:file src="../../examples/rsbuild-ssr-react/README.md" -->

使用 React、[Rsbuild](https://rsbuild.rs) 和实验性的 `nitro/rsbuild` 插件设置服务端渲染（SSR）。此配置支持流式 HTML 响应、通过 `?assets` 导入注入客户端资源，以及客户端水合。

## 概述

1. 在 Rsbuild 配置中添加 Nitro 和 React 插件。
2. 配置客户端入口。
3. 创建将应用渲染为 HTML 的服务器入口。
4. 创建对服务器渲染 HTML 进行水合的客户端入口。
5. 添加 API 路由以提供服务器端数据。

## 1. 配置 Rsbuild

在 Rsbuild 配置中添加 Nitro 和 React 插件，并设置客户端入口：

```ts [rsbuild.config.ts]
import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { nitro } from "nitro/rsbuild";

export default defineConfig({
  source: {
    entry: { index: "./src/entry-client.tsx" },
  },
  // Pages are rendered by the server entry
  tools: { htmlPlugin: false },
  plugins: [pluginReact(), nitro({ serverDir: "./" })],
});
```

Nitro 会自动检测 `app/`、`src/` 或项目根目录中名为 `entry-server` 的文件，并为其添加 `ssr` 环境。服务器入口会渲染整个文档，因此通过 `tools.htmlPlugin: false` 禁用 Rsbuild HTML 生成。

## 2. 创建应用组件

创建一个供服务器和客户端共同运行的 React 组件：

```tsx [src/app.tsx]
import { useState } from "react";

export function App() {
  const [count, setCount] = useState(0);
  return (
    <>
      <h1 className="hero">Nitro + Rsbuild + React</h1>
      <button onClick={() => setCount((c) => c + 1)}>Count is {count}</button>
    </>
  );
}
```

## 3. 创建服务器入口

服务器入口使用 `react-dom/server.edge` 将 React 应用渲染为流式 HTML 响应：

```tsx [src/entry-server.tsx]
import { renderToReadableStream } from "react-dom/server.edge";
import { App } from "./app.tsx";

import clientAssets from "./entry-client.tsx?assets=client";

export default {
  async fetch(_req: Request) {
    return new Response(
      await renderToReadableStream(
        <html lang="en">
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            {clientAssets.css.map((attr) => (
              <link key={attr.href} rel="stylesheet" {...attr} />
            ))}
            {clientAssets.js.map((attr) => (
              <script key={attr.href} defer src={attr.href} />
            ))}
          </head>
          <body id="app">
            <App />
          </body>
        </html>
      ),
      { headers: { "Content-Type": "text/html;charset=utf-8" } }
    );
  },
};
```

`?assets=client` 导入会提供客户端入口（`src/entry-client.tsx`）的脚本和样式表，在开发和生产环境中均可使用。脚本为经典脚本（最后一项是 `entry`），并通过 `defer` 加载。使用 `renderToReadableStream` 可在 React 渲染时流式传输 HTML，从而缩短首字节时间。

## 4. 创建客户端入口

客户端入口会导入样式，并对服务器渲染的 HTML 进行水合，以附加 React 事件处理器：

```tsx [src/entry-client.tsx]
import "./styles.css";
import { hydrateRoot } from "react-dom/client";
import { App } from "./app.tsx";

hydrateRoot(document.querySelector("#app")!, <App />);
```

`hydrateRoot` 函数会将 React 附加到现有的服务器渲染 DOM，而不会重新渲染。在开发模式下，`@rsbuild/plugin-react` 会为客户端代码启用 React Fast Refresh。

## 5. 添加 API 路由

服务器路由（例如 `routes/api/hello.ts`）与页面一起由 Nitro 提供：

```ts [routes/api/hello.ts]
import { defineHandler } from "nitro";

export default defineHandler(() => ({ message: "Hello from Nitro!" }));
```

<!-- /automd -->

## 了解更多

- [Rsbuild 集成](/docs/rsbuild)
- [服务器入口](/docs/server-entry)
