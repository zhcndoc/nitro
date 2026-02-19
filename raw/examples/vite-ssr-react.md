# 使用 React 实现 SSR

> 在 Nitro 中使用 Vite 进行 React 的服务端渲染。

<code-tree :expand-all="true" default-value="src/entry-server.tsx" expand-all="">

```json [package.json]
{
  "type": "module",
  "scripts": {
    "build": "vite build",
    "preview": "vite preview",
    "dev": "vite dev"
  },
  "devDependencies": {
    "@types/react": "^19.2.13",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.1.3",
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

使用 React、Vite 和 Nitro 设置服务端渲染（SSR）。此配置支持流式 HTML 响应、自动资源管理以及客户端水合。

## 概览

<steps level="4">

#### 在 Vite 配置中添加 Nitro Vite 插件

#### 配置客户端和服务端入口文件

#### 创建服务端入口文件，将应用渲染为 HTML

#### 创建客户端入口文件，对服务端渲染的 HTML 进行水合

</steps>

## 1. 配置 Vite

在 Vite 配置中添加 Nitro 和 React 插件，定义具有客户端入口的 `client` 环境：

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

`environments.client` 配置告知 Vite 使用哪个文件作为浏览器入口。Nitro 会根据常见目录中名为 `entry-server` 或 `server` 的文件自动检测服务端入口。

## 2. 创建应用组件

创建一个可在服务端和客户端共享运行的 React 组件：

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

服务端入口将 React 应用渲染成流式 HTML 响应，使用适配边缘环境的 `react-dom/server.edge`：

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

使用 `?assets=client` 和 `?assets=ssr` 查询参数导入资源。Nitro 会收集每个入口点的 CSS 和 JS 资源，`merge()` 将它们合并成一个清单。`assets` 对象提供样式表和脚本的属性数组，以及客户端入口 URL。使用 `renderToReadableStream` 以流式方式输出 HTML，配合 React 渲染，提升首字节时间。

## 4. 创建客户端入口

客户端入口对服务端渲染的 HTML 进行水合，绑定 React 事件处理器：

```tsx [src/entry-client.tsx]
import "@vitejs/plugin-react/preamble";
import { hydrateRoot } from "react-dom/client";
import { App } from "./app.tsx";

hydrateRoot(document.querySelector("#app")!, <App />);
```

`@vitejs/plugin-react/preamble` 导入用于开发时的 React 快速刷新（Fast Refresh）。`hydrateRoot` 函数将 React 附加到已存在的服务端渲染 DOM，而非重新渲染。

## 了解更多

- [Renderer](/docs/renderer)
- [Server Entry](/docs/server-entry)
