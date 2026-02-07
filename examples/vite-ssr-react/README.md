---
category: 服务端渲染
icon: i-logos-react
---

# 使用 React 实现 SSR

> 在 Nitro 中使用 Vite 进行 React 的服务端渲染。

<!-- automd:ui-code-tree src="." default="src/entry-server.tsx" ignore="README.md,GUIDE.md" expandAll -->

::code-tree{defaultValue="src/entry-server.tsx" expandAll}

```json [package.json]
{
  "type": "module",
  "scripts": {
    "build": "vite build",
    "preview": "vite preview",
    "dev": "vite dev"
  },
  "devDependencies": {
    "@types/react": "^19.2.10",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.1.2",
    "nitro": "latest",
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "react-refresh": "^0.18.0",
    "vite": "beta"
  }
}
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

```js [vite.config.mjs]
import { defineConfig } from "vite";
import { nitro } from "nitro/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [nitro(), react()],
  environments: {
    client: {
      build: { rollupOptions: { input: "./src/entry-client.tsx" } },
    },
  },
});
```

```tsx [src/app.tsx]
import { useState } from "react";

export function App() {
  const [count, setCount] = useState(0);
  return (
    <>
      <h1 className="hero">Nitro + Vite + React</h1>
      <button onClick={() => setCount((c) => c + 1)}>计数为 {count}</button>
    </>
  );
}
```

```tsx [src/entry-client.tsx]
import "@vitejs/plugin-react/preamble";
import { hydrateRoot } from "react-dom/client";
import { App } from "./app.tsx";

hydrateRoot(document.querySelector("#app")!, <App />);
```

```tsx [src/entry-server.tsx]
import "./styles.css";
import { renderToReadableStream } from "react-dom/server.edge";
import { App } from "./app.tsx";

import clientAssets from "./entry-client?assets=client";
import serverAssets from "./entry-server?assets=ssr";

export default {
  async fetch(_req: Request) {
    const assets = clientAssets.merge(serverAssets);
    return new Response(
      await renderToReadableStream(
        <html lang="en">
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            {assets.css.map((attr: any) => (
              <link key={attr.href} rel="stylesheet" {...attr} />
            ))}
            {assets.js.map((attr: any) => (
              <link key={attr.href} type="modulepreload" {...attr} />
            ))}
            <script type="module" src={assets.entry} />
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

```css [src/styles.css]
.hero {
  color: orange;
}

button {
  background-color: lightskyblue;
}
```

::

<!-- /automd -->

<!-- automd:file src="GUIDE.md" -->

设置 React、Vite 和 Nitro 的服务端渲染（SSR）。此配置支持流式 HTML 响应、自动资源管理和客户端水合。

## 概览

1. 在 Vite 配置中添加 Nitro 的 Vite 插件  
2. 配置客户端和服务器入口点  
3. 创建服务端入口，将应用渲染为 HTML  
4. 创建客户端入口，对服务器渲染的 HTML 进行水合  

## 1. 配置 Vite

在 Vite 配置中添加 Nitro 和 React 插件。定义 `client` 环境及其客户端入口文件：

```js [vite.config.mjs]
import { defineConfig } from "vite";
import { nitro } from "nitro/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [nitro(), react()],
  environments: {
    client: {
      build: { rollupOptions: { input: "./src/entry-client.tsx" } },
    },
  },
});
```

`environments.client` 配置告诉 Vite 使用哪个文件作为浏览器入口点。Nitro 会自动根据常见目录中名为 `entry-server` 或 `server` 的文件识别服务端入口。

## 2. 创建应用组件

创建一个在服务端和客户端都运行的共享 React 组件：

```tsx [src/app.tsx]
import { useState } from "react";

export function App() {
  const [count, setCount] = useState(0);
  return (
    <>
      <h1 className="hero">Nitro + Vite + React</h1>
      <button onClick={() => setCount((c) => c + 1)}>计数为 {count}</button>
    </>
  );
}
```

## 3. 创建服务端入口

服务端入口用于将 React 应用渲染成流式 HTML 响应。这里使用了支持边缘运行的 `react-dom/server.edge`：

```tsx [src/entry-server.tsx]
import "./styles.css";
import { renderToReadableStream } from "react-dom/server.edge";
import { App } from "./app.tsx";

import clientAssets from "./entry-client?assets=client";
import serverAssets from "./entry-server?assets=ssr";

export default {
  async fetch(_req: Request) {
    const assets = clientAssets.merge(serverAssets);
    return new Response(
      await renderToReadableStream(
        <html lang="en">
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            {assets.css.map((attr: any) => (
              <link key={attr.href} rel="stylesheet" {...attr} />
            ))}
            {assets.js.map((attr: any) => (
              <link key={attr.href} type="modulepreload" {...attr} />
            ))}
            <script type="module" src={assets.entry} />
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

使用 `?assets=client` 和 `?assets=ssr` 查询参数导入资源。Nitro 会收集每个入口点的 CSS 和 JS 资源，`merge()` 会合并成一个资源清单。`assets` 对象提供了样式表和脚本的属性数组，以及客户端入口的 URL。用 `renderToReadableStream` 可在 React 渲染时流式传输 HTML，提高首字节时间。

## 4. 创建客户端入口

客户端入口用于水合服务器渲染的 HTML，绑定 React 事件处理：

```tsx [src/entry-client.tsx]
import "@vitejs/plugin-react/preamble";
import { hydrateRoot } from "react-dom/client";
import { App } from "./app.tsx";

hydrateRoot(document.querySelector("#app")!, <App />);
```

`@vitejs/plugin-react/preamble` 是在开发时启用 React Fast Refresh 所必需的。`hydrateRoot` 将 React 附加到已有的服务器渲染 DOM，而不重新渲染它。

<!-- /automd -->

## 了解更多

- [Renderer](/docs/renderer)  
- [Server Entry](/docs/server-entry)