---
category: 服务端渲染
icon: i-logos-solidjs-icon
---

# 使用 SolidJS 进行 SSR

> 在 Nitro 中使用 Vite 进行 SolidJS 服务端渲染。

<!-- automd:ui-code-tree src="." default="src/entry-server.tsx" ignore="README.md,GUIDE.md" expandAll -->

::code-tree{defaultValue="src/entry-server.tsx" expandAll}

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
    "vite": "beta",
    "vite-plugin-solid": "^2.11.10"
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
      <h1>Hello, Solid!</h1>
      <button onClick={() => setCount((count) => count + 1)}>Count: {count()}</button>
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

::

<!-- /automd -->

<!-- automd:file src="GUIDE.md" -->

设置使用 SolidJS、Vite 和 Nitro 的服务端渲染 (SSR)。此配置使用 `renderToStringAsync` 进行 HTML 生成，并支持客户端的水合。

## 概览

1. 在 Vite 配置中添加 Nitro Vite 插件  
2. 配置客户端和服务端入口文件  
3. 创建服务端入口，用于将应用渲染成 HTML  
4. 创建客户端入口，用于水合服务端渲染的 HTML  

## 1. 配置 Vite

在 Vite 配置中添加 Nitro 和 SolidJS 插件。SolidJS 需要明确配置 JSX，以及设置 `ssr` 和 `client` 环境：

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

通过 `solid({ ssr: true })` 启用 Solid 插件的 SSR 模式。配置 esbuild 保持 JSX，用于 Solid 的编译，使用 Solid 的 JSX 运行时。SolidJS 需要在 Vite 中明确设置 `ssr` 和 `client` 两个环境。

## 2. 创建 App 组件

创建一个使用响应式信号的共享 SolidJS 组件：

```tsx [src/app.tsx]
import { createSignal } from "solid-js";

export function App() {
  const [count, setCount] = createSignal(0);

  return (
    <div>
      <h1>Hello, Solid!</h1>
      <button onClick={() => setCount((count) => count + 1)}>Count: {count()}</button>
    </div>
  );
}
```

SolidJS 使用信号 (`createSignal`) 进行状态管理。与 React 的 `useState` 不同，信号是需要调用才能读取值的 getter 函数。

## 3. 创建服务端入口

服务端入口使用 `renderToStringAsync` 将 SolidJS 应用渲染为 HTML，并引入 `HydrationScript` 以支持客户端水合：

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

SolidJS 需要将应用和外壳层单独渲染（二阶段渲染）。通过 `innerHTML` 注入应用 HTML 来保留水合的标记。引入 `HydrationScript` 组件注入 Solid 用于客户端水合的脚本。使用带有 `?assets=client` 和 `?assets=ssr` 查询参数的导入收集各入口的 CSS 和 JS 资源。

## 4. 创建客户端入口

客户端入口执行水合，将 Solid 的响应式系统挂载到服务端渲染的 HTML 上：

```tsx [src/entry-client.tsx]
import { hydrate } from "solid-js/web";
import "./styles.css";
import { App } from "./app.jsx";

hydrate(() => <App />, document.querySelector("#app")!);
```

`hydrate` 方法会将 Solid 的响应式系统绑定到已有的 `#app` DOM 上。组件需要包裹在函数 `() => <App />` 中，这是 Solid API 的要求。

<!-- /automd -->

## 了解更多

- [SolidJS 文档](https://docs.solidjs.com/)
- [渲染器](/docs/renderer)
- [服务端入口](/docs/server-entry)