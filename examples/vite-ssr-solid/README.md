使用 SolidJS、Vite 和 Nitro 设置服务器端渲染（SSR）。此设置使用 `renderToStringAsync` 生成 HTML，并支持客户端 hydration

## 概述

1. 将 Nitro Vite 插件添加到 Vite 配置中
2. 配置客户端和服务器入口点
3. 创建将应用渲染为 HTML 的服务器入口
4. 创建对服务器渲染的 HTML 执行 hydration 的客户端入口

## 1. 配置 Vite

将 Nitro 和 SolidJS 插件添加到 Vite 配置中。SolidJS 要求显式配置 JSX，以及 `ssr` 和 `client` 环境：

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

通过 `solid({ ssr: true })` 在 Solid 插件中启用 SSR 模式。配置 esbuild 以保留 JSX，供 Solid 的编译器使用，并使用 Solid 的 JSX runtime。SolidJS 要求在 Vite 中显式配置 `ssr` 和 `client` 环境

## 2. 创建 App 组件

使用响应式 signals 创建共享的 SolidJS 组件：

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

SolidJS 使用 signals（`createSignal`）进行状态管理。与 React 的 `useState` 不同，signals 是 getter 函数，你需要调用它们来读取值

## 3. 创建服务器入口

服务器入口使用 `renderToStringAsync` 将 SolidJS 应用渲染为 HTML，并包含用于客户端 hydration 的 `HydrationScript`：

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
          <link key={attr.href} rel="modulepreload" {...attr} />
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

SolidJS 要求将应用与外壳分开渲染（两阶段渲染）。应用 HTML 通过 `innerHTML` 注入，以保留 hydration 标记。包含 `HydrationScript` 组件，以注入 Solid 在客户端执行 rehydrate 所需的脚本。使用 `?assets=client` 和 `?assets=ssr` 查询参数导入资源，以收集每个入口点中的 CSS 和 JS

## 4. 创建客户端入口

客户端入口对服务器渲染的 HTML 执行 hydration，恢复 Solid 的响应性：

```tsx [src/entry-client.tsx]
import { hydrate } from "solid-js/web";
import "./styles.css";
import { App } from "./app.jsx";

hydrate(() => <App />, document.querySelector("#app")!);
```

`hydrate` 函数将 Solid 的响应式系统附加到 `#app` 内现有的服务器渲染 DOM 上。按照 Solid API 的要求，组件被包装在函数 `() => <App />` 中
