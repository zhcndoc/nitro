# SolidJS 服务端渲染

> 在 Nitro 中使用 Vite 进行 SolidJS 服务端渲染。

<code-tree :expand-all="true" default-value="src/entry-server.tsx">

```json [package.json]
{
  "type": "module",
  "scripts": {
    "build": "vite build",
    "dev": "vite dev"
  },
  "devDependencies": {
    "nitro": "latest",
    "solid-js": "^1.9.11",
    "vite": "latest",
    "vite-plugin-solid": "^2.11.11"
  }
}
```

```json [tsconfig.json]
{
  "extends": "nitro/tsconfig",
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "solid-js"
  }
}
```

```js [vite.config.mjs]
import solid from "vite-plugin-solid";
import { defineConfig } from "vite";
import { nitro } from "nitro/vite";

export default defineConfig({
  plugins: [solid({ ssr: true }), nitro()],
  esbuild: { jsx: "preserve", jsxImportSource: "solid-js" },
  environments: {
    ssr: {
      build: { rollupOptions: { input: "./src/entry-server.tsx" } },
    },
    client: {
      build: { rollupOptions: { input: "./src/entry-client.tsx" } },
    },
  },
});
```

```tsx [src/app.tsx]
import { createSignal } from "solid-js";

export function App() {
  const [count, setCount] = createSignal(0);

  return (
    <div>
      <h1>你好，Solid！</h1>
      <button onClick={() => setCount((count) => count + 1)}>计数：{count()}</button>
    </div>
  );
}
```

```tsx [src/entry-client.tsx]
import { hydrate } from "solid-js/web";
import "./styles.css";
import { App } from "./app.jsx";

hydrate(() => <App />, document.querySelector("#app")!);
```

```tsx [src/entry-server.tsx]
import { renderToStringAsync, HydrationScript } from "solid-js/web";
import { App } from "./app.jsx";

import clientAssets from "./entry-client?assets=client";
import serverAssets from "./entry-server?assets=ssr";

export default {
  async fetch(req: Request): Promise<Response> {
    const appHTML = await renderToStringAsync(() => <App />);
    const rootHTML = await renderToStringAsync(() => <Root appHTML={appHTML} />);
    return new Response(rootHTML, {
      headers: { "Content-Type": "text/html" },
    });
  },
};

function Root(props: { appHTML?: string }) {
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
      </head>
      <body>
        <div id="app" innerHTML={props.appHTML || ""} />
        <HydrationScript />
        <script type="module" src={assets.entry} />
      </body>
    </html>
  );
}
```

```css [src/styles.css]
div {
  font-family: system-ui, Arial, sans-serif;
  font-size: 20px;
  margin-bottom: 10px;
}

button {
  background-color: rgb(147 197 253);
  color: rgb(15 23 42);
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 5px;
}

button:hover {
  background-color: rgb(191 219 254);
}
```

</code-tree>

使用 SolidJS、Vite 和 Nitro 配置服务端渲染（SSR）。此配置使用 `renderToStringAsync` 生成 HTML 并支持客户端注水（hydration）。

## 概览

<steps level="4">

#### 将 Nitro Vite 插件添加到你的 Vite 配置中

#### 配置客户端和服务端入口点

#### 创建一个服务端入口，将你的应用渲染为 HTML

#### 创建一个客户端入口，为服务端渲染的 HTML 进行注水

</steps>

## 1. 配置 Vite

将 Nitro 和 SolidJS 插件添加到你的 Vite 配置中。SolidJS 需要显式配置 JSX 以及同时配置 `ssr` 和 `client` 环境：

```js [vite.config.mjs]
import solid from "vite-plugin-solid";
import { defineConfig } from "vite";
import { nitro } from "nitro/vite";

export default defineConfig({
  plugins: [solid({ ssr: true }), nitro()],
  esbuild: { jsx: "preserve", jsxImportSource: "solid-js" },
  environments: {
    ssr: {
      build: { rollupOptions: { input: "./src/entry-server.tsx" } },
    },
    client: {
      build: { rollupOptions: { input: "./src/entry-client.tsx" } },
    },
  },
});
```

在 Solid 插件中通过 `solid({ ssr: true })` 启用 SSR 模式。配置 esbuild 以保留 JSX 供 Solid 的编译器使用，并采用 Solid 的 JSX 运行时。SolidJS 需要在 Vite 中显式配置 `ssr` 和 `client` 环境。

## 2. 创建应用组件

使用响应式信号（reactive signals）创建一个共享的 SolidJS 组件：

```tsx [src/app.tsx]
import { createSignal } from "solid-js";

export function App() {
  const [count, setCount] = createSignal(0);

  return (
    <div>
      <h1>你好，Solid！</h1>
      <button onClick={() => setCount((count) => count + 1)}>计数：{count()}</button>
    </div>
  );
}
```

SolidJS 使用信号（`createSignal`）进行状态管理。与 React 的 `useState` 不同，信号是你调用来读取值的 getter 函数。

## 3. 创建服务端入口

服务端入口使用 `renderToStringAsync` 将你的 SolidJS 应用渲染为 HTML，并包含用于客户端注水的 `HydrationScript`：

```tsx [src/entry-server.tsx]
import { renderToStringAsync, HydrationScript } from "solid-js/web";
import { App } from "./app.jsx";

import clientAssets from "./entry-client?assets=client";
import serverAssets from "./entry-server?assets=ssr";

export default {
  async fetch(req: Request): Promise<Response> {
    const appHTML = await renderToStringAsync(() => <App />);
    const rootHTML = await renderToStringAsync(() => <Root appHTML={appHTML} />);
    return new Response(rootHTML, {
      headers: { "Content-Type": "text/html" },
    });
  },
};

function Root(props: { appHTML?: string }) {
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
      </head>
      <body>
        <div id="app" innerHTML={props.appHTML || ""} />
        <HydrationScript />
        <script type="module" src={assets.entry} />
      </body>
    </html>
  );
}
```

SolidJS 需要将应用与外壳（shell）分开渲染（两阶段渲染）。应用 HTML 通过 `innerHTML` 注入以保留注水标记。包含 `HydrationScript` 组件以注入 Solid 在客户端重新注水所需的脚本。使用 `?assets=client` 和 `?assets=ssr` 查询参数导入资源，以收集每个入口点的 CSS 和 JS。

## 4. 创建客户端入口

客户端入口为服务端渲染的 HTML 进行注水，恢复 Solid 的响应性：

```tsx [src/entry-client.tsx]
import { hydrate } from "solid-js/web";
import "./styles.css";
import { App } from "./app.jsx";

hydrate(() => <App />, document.querySelector("#app")!);
```

`hydrate` 函数将 Solid 的响应式系统附加到 `#app` 中现有的服务端渲染 DOM。组件按照 Solid API 的要求被包装在函数 `() => <App />` 中。

## 了解更多

- [SolidJS 文档](https://docs.solidjs.com/)
- [渲染器](/docs/renderer)
- [服务端入口](/docs/server-entry)
