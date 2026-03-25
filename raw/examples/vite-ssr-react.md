# 使用 React 进行 SSR

> 在 Nitro 中使用 Vite 实现 React 服务端渲染。

<code-tree :expand-all="true" default-value="src/entry-server.tsx">

```json [package.json]
{
  "type": "module",
  "scripts": {
    "build": "vite build",
    "preview": "vite preview",
    "dev": "vite dev"
  },
  "devDependencies": {
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.1",
    "nitro": "latest",
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "react-refresh": "^0.18.0",
    "vite": "latest"
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
      <button onClick={() => setCount((c) => c + 1)}>Count is {count}</button>
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

</code-tree>

使用 React、Vite 和 Nitro 配置服务端渲染（SSR）。此配置支持流式 HTML 响应、自动资源管理以及客户端 hydration（注水）。

## 概述

<steps level="4">

#### 将 Nitro Vite 插件添加到你的 Vite 配置中

#### 配置客户端和服务端入口点

#### 创建一个将应用渲染为 HTML 的服务端入口

#### 创建一个为服务端渲染 HTML 执行 hydration（注水）的客户端入口

</steps>

## 1. 配置 Vite

将 Nitro 和 React 插件添加到你的 Vite 配置中。使用你的客户端入口点定义 `client` 环境：

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

`environments.client` 配置告诉 Vite 使用哪个文件作为浏览器入口点。Nitro 会自动从常用目录中名为 `entry-server` 或 `server` 的文件中检测服务端入口。

## 2. 创建 App 组件

创建一个在服务端和客户端都能运行的共享 React 组件：

```tsx [src/app.tsx]
import { useState } from "react";

export function App() {
  const [count, setCount] = useState(0);
  return (
    <>
      <h1 className="hero">Nitro + Vite + React</h1>
      <button onClick={() => setCount((c) => c + 1)}>Count is {count}</button>
    </>
  );
}
```

## 3. 创建服务端入口

服务端入口将你的 React 应用渲染为流式 HTML 响应。它使用 `react-dom/server.edge` 实现边缘兼容的流式传输：

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

使用 `?assets=client` 和 `?assets=ssr` 查询参数导入资源。Nitro 从每个入口点收集 CSS 和 JS 资源，`merge()` 将它们合并为单个清单。`assets` 对象提供样式表和脚本属性的数组，以及客户端入口 URL。使用 `renderToReadableStream` 在 React 渲染时流式传输 HTML，从而缩短首字节时间（time-to-first-byte）。

## 4. 创建客户端入口

客户端入口为服务端渲染的 HTML 执行 hydration（注水），附加 React 的事件处理器：

```tsx [src/entry-client.tsx]
import "@vitejs/plugin-react/preamble";
import { hydrateRoot } from "react-dom/client";
import { App } from "./app.tsx";

hydrateRoot(document.querySelector("#app")!, <App />);
```

`@vitejs/plugin-react/preamble` 导入在开发期间用于 React 快速刷新（Fast Refresh）是必需的。`hydrateRoot` 函数将 React 附加到现有的服务端渲染 DOM，而无需重新渲染它。

## 了解更多

- [Renderer](/docs/renderer)
- [Server Entry](/docs/server-entry)
