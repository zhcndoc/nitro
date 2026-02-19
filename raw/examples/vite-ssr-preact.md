# 使用 Preact 进行 SSR

> 在 Nitro 中使用 Vite 和 Preact 实现服务器端渲染。

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
    "@preact/preset-vite": "^2.10.3",
    "@tailwindcss/vite": "^4.1.18",
    "nitro": "latest",
    "preact": "^10.28.3",
    "preact-render-to-string": "^6.6.5",
    "tailwindcss": "^4.1.18",
    "vite": "beta"
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

使用 Preact、Vite 和 Nitro 设置服务器端渲染（SSR）。此配置支持流式 HTML 响应、自动资产管理和客户端水合。

## 概述

<steps level="4">

#### 在 Vite 配置中添加 Nitro Vite 插件

#### 配置客户端和服务器入口文件

#### 创建渲染应用为 HTML 的服务器入口

#### 创建将服务器渲染的 HTML 水合的客户端入口

</steps>

## 1. 配置 Vite

在 Vite 配置中添加 Nitro 和 Preact 插件。定义 `client` 环境，指定客户端入口点：

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

`environments.client` 配置告诉 Vite 使用哪个文件作为浏览器入口。Nitro 会自动从常见目录中，名为 `entry-server` 或 `server` 的文件中检测服务器入口。

## 2. 创建 App 组件

创建一个在服务器和客户端共用的 Preact 组件：

```tsx [src/app.tsx]
import { useState } from "preact/hooks";

export function App() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount((c) => c + 1)}>Count is {count}</button>;
}
```

## 3. 创建服务器入口

服务器入口使用 `preact-render-to-string/stream` 将你的 Preact 应用渲染为流式 HTML 响应：

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

通过添加 `?assets=client` 和 `?assets=ssr` 查询参数导入资源。Nitro 会收集各个入口的 CSS 和 JS 资源，`merge()` 方法会将它们合并为一个清单。`assets` 对象提供样式表和脚本属性数组，以及客户端入口 URL。使用 `renderToReadableStream` 让 Preact 渲染过程中以流形式发送 HTML，从而提升首字节时间。

## 4. 创建客户端入口

客户端入口用于水合服务器渲染的 HTML，绑定 Preact 的事件处理程序：

```tsx [src/entry-client.tsx]
import { hydrate } from "preact";
import { App } from "./app.tsx";

function main() {
  hydrate(<App />, document.querySelector("#app")!);
}

main();
```

`hydrate` 函数会把 Preact 附加到现有的、服务端渲染的 `#app` DOM 内，而不会重新渲染。

## 了解更多

- [Renderer](/docs/renderer)
- [Server Entry](/docs/server-entry)
