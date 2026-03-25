# 使用 Preact 进行 SSR

> 在 Nitro 中使用 Vite 和 Preact 进行服务端渲染。

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
    "@preact/preset-vite": "^2.10.4",
    "@tailwindcss/vite": "^4.2.2",
    "nitro": "latest",
    "preact": "^10.29.0",
    "preact-render-to-string": "^6.6.6",
    "tailwindcss": "^4.2.2",
    "vite": "latest"
  }
}
```

```json [tsconfig.json]
{
  "extends": "nitro/tsconfig",
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "preact"
  }
}
```

```js [vite.config.mjs]
import { defineConfig } from "vite";
import { nitro } from "nitro/vite";
import preact from "@preact/preset-vite";

export default defineConfig({
  plugins: [nitro(), preact()],
  environments: {
    client: {
      build: {
        rollupOptions: {
          input: "./src/entry-client.tsx",
        },
      },
    },
  },
});
```

```tsx [src/app.tsx]
import { useState } from "preact/hooks";

export function App() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount((c) => c + 1)}>Count is {count}</button>;
}
```

```tsx [src/entry-client.tsx]
import { hydrate } from "preact";
import { App } from "./app.tsx";

function main() {
  hydrate(<App />, document.querySelector("#app")!);
}

main();
```

```tsx [src/entry-server.tsx]
import "./styles.css";
import { renderToReadableStream } from "preact-render-to-string/stream";
import { App } from "./app.jsx";

import clientAssets from "./entry-client?assets=client";
import serverAssets from "./entry-server?assets=ssr";

export default {
  async fetch(request: Request) {
    const url = new URL(request.url);
    const htmlStream = renderToReadableStream(<Root url={url} />);
    return new Response(htmlStream, {
      headers: { "Content-Type": "text/html;charset=utf-8" },
    });
  },
};

function Root(props: { url: URL }) {
  const assets = clientAssets.merge(serverAssets);
  return (
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
      <body>
        <h1 className="hero">Nitro + Vite + Preact</h1>
        <p>URL: {props.url.href}</p>
        <div id="app">
          <App />
        </div>
      </body>
    </html>
  );
}
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

使用 Preact、Vite 和 Nitro 设置服务端渲染（SSR）。此配置支持流式 HTML 响应、自动资源管理和客户端注水。

## 概述

<steps level="4">

#### 将 Nitro Vite 插件添加到 Vite 配置中

#### 配置客户端和服务端入口点

#### 创建将应用渲染为 HTML 的服务端入口

#### 创建为服务端渲染 HTML 注水的客户端入口

</steps>

## 1. 配置 Vite

将 Nitro 和 Preact 插件添加到 Vite 配置中。使用客户端入口点定义 `client` 环境：

```js [vite.config.mjs]
import { defineConfig } from "vite";
import { nitro } from "nitro/vite";
import preact from "@preact/preset-vite";

export default defineConfig({
  plugins: [nitro(), preact()],
  environments: {
    client: {
      build: {
        rollupOptions: {
          input: "./src/entry-client.tsx",
        },
      },
    },
  },
});
```

`environments.client` 配置告诉 Vite 使用哪个文件作为浏览器入口点。Nitro 会自动从常见目录中名为 `entry-server` 或 `server` 的文件中检测服务端入口。

## 2. 创建应用组件

创建一个在服务端和客户端都能运行的共享 Preact 组件：

```tsx [src/app.tsx]
import { useState } from "preact/hooks";

export function App() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount((c) => c + 1)}>Count is {count}</button>;
}
```

## 3. 创建服务端入口

服务端入口使用 `preact-render-to-string/stream` 将 Preact 应用渲染为流式 HTML 响应：

```tsx [src/entry-server.tsx]
import "./styles.css";
import { renderToReadableStream } from "preact-render-to-string/stream";
import { App } from "./app.jsx";

import clientAssets from "./entry-client?assets=client";
import serverAssets from "./entry-server?assets=ssr";

export default {
  async fetch(request: Request) {
    const url = new URL(request.url);
    const htmlStream = renderToReadableStream(<Root url={url} />);
    return new Response(htmlStream, {
      headers: { "Content-Type": "text/html;charset=utf-8" },
    });
  },
};

function Root(props: { url: URL }) {
  const assets = clientAssets.merge(serverAssets);
  return (
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
      <body>
        <h1 className="hero">Nitro + Vite + Preact</h1>
        <p>URL: {props.url.href}</p>
        <div id="app">
          <App />
        </div>
      </body>
    </html>
  );
}
```

使用 `?assets=client` 和 `?assets=ssr` 查询参数导入资源。Nitro 从每个入口点收集 CSS 和 JS 资源，`merge()` 将它们合并为单个清单。`assets` 对象提供样式表和脚本属性数组，以及客户端入口 URL。使用 `renderToReadableStream` 在 Preact 渲染时流式传输 HTML，缩短首字节时间（TTFB）。

## 4. 创建客户端入口

客户端入口为服务端渲染的 HTML 进行注水，附加 Preact 的事件处理器：

```tsx [src/entry-client.tsx]
import { hydrate } from "preact";
import { App } from "./app.tsx";

function main() {
  hydrate(<App />, document.querySelector("#app")!);
}

main();
```

`hydrate` 函数将 Preact 附加到 `#app` 内现有的服务端渲染 DOM 上，无需重新渲染。

## 了解更多

- [Renderer](/docs/renderer)
- [Server Entry](/docs/server-entry)
