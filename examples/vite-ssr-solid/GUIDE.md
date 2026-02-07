使用 SolidJS、Vite 和 Nitro 设置服务端渲染（SSR）。该设置使用 `renderToStringAsync` 进行 HTML 生成，并支持客户端水合。

## 概述

1. 在 Vite 配置中添加 Nitro 插件
2. 配置客户端和服务端入口
3. 创建服务端入口，将应用渲染成 HTML
4. 创建客户端入口，对服务端渲染的 HTML 进行水合

## 1. 配置 Vite

在 Vite 配置文件中添加 Nitro 和 SolidJS 插件。SolidJS 需要显式配置 JSX 以及同时配置 `ssr` 和 `client` 环境：

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

通过 `solid({ ssr: true })` 启用 Solid 插件的 SSR 模式。配置 esbuild 保留 JSX 以便 Solid 编译器处理，并使用 Solid 的 JSX 运行时。SolidJS 需要在 Vite 中显式配置 `ssr` 和 `client` 环境。

## 2. 创建 App 组件

使用响应式信号创建一个共享的 SolidJS 组件：

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

SolidJS 使用信号（`createSignal`）来管理状态。与 React 的 `useState` 不同，信号是调用即可读取值的 getter 函数。

## 3. 创建服务端入口

服务端入口使用 `renderToStringAsync` 将 SolidJS 应用渲染成 HTML，并包含用于客户端水合的 `HydrationScript`：

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

SolidJS 需要将应用和框架分开渲染（两阶段渲染）。通过 `innerHTML` 注入应用 HTML 以保留水合标记。包含 `HydrationScript` 组件以注入 Solid 客户端水合所需的脚本。通过 `?assets=client` 和 `?assets=ssr` 查询参数导入资源，收集每个入口点的 CSS 和 JS。

## 4. 创建客户端入口

客户端入口对服务端渲染的 HTML 进行水合，恢复 Solid 的响应式：

```tsx [src/entry-client.tsx]
import { hydrate } from "solid-js/web";
import "./styles.css";
import { App } from "./app.jsx";

hydrate(() => <App />, document.querySelector("#app")!);
```

`hydrate` 函数将 Solid 的响应系统附加到已存在的 `#app` 服务端渲染 DOM 上。组件需用函数 `() => <App />` 包裹，这是 Solid 的 API 要求。