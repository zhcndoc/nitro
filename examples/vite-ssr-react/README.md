使用 React、Vite 和 Nitro 设置服务端渲染（SSR）。此设置支持流式 HTML 响应、自动资源管理和客户端水合。

## 概述

1. 将 Nitro Vite 插件添加到 Vite 配置中
2. 配置客户端和服务端入口
3. 创建将应用渲染为 HTML 的服务端入口
4. 创建对服务端渲染 HTML 进行水合的客户端入口

## 1. 配置 Vite

将 Nitro 和 React 插件添加到 Vite 配置中。使用客户端入口点定义 `client` 环境：

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

`environments.client` 配置告知 Vite 将哪个文件用作浏览器入口点。Nitro 会自动从 `app/`、`src/` 或项目根目录中名为 `entry-server` 的文件检测 SSR 入口。

## 2. 创建 App 组件

创建一个同时在服务端和客户端运行的共享 React 组件：

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

服务端入口会将你的 React 应用渲染为流式 HTML 响应。它使用 `react-dom/server.edge` 进行兼容边缘环境的流式渲染：

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
              <link key={attr.href} rel="modulepreload" {...attr} />
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

使用 `?assets=client` 和 `?assets=ssr` 查询参数导入资源。Nitro 会从每个入口点收集 CSS 和 JS 资源，`merge()` 会将它们合并到单个清单中。`assets` 对象提供样式表和脚本属性数组，以及客户端入口 URL。使用 `renderToReadableStream` 在 React 渲染 HTML 时对其进行流式传输，从而缩短首字节时间。

## 4. 创建客户端入口

客户端入口会对服务端渲染的 HTML 进行水合，并附加 React 的事件处理程序：

```tsx [src/entry-client.tsx]
import "@vitejs/plugin-react/preamble";
import { hydrateRoot } from "react-dom/client";
import { App } from "./app.tsx";

hydrateRoot(document.querySelector("#app")!, <App />);
```

在开发期间，必须导入 `@vitejs/plugin-react/preamble` 才能使用 React Fast Refresh。`hydrateRoot` 函数会将 React 附加到现有的服务端渲染 DOM，而无需重新渲染它。
