使用 Preact、Vite 和 Nitro 设置服务端渲染（SSR）。此设置支持流式 HTML 响应、自动资源管理和客户端水合。

## 概览

1. 在 Vite 配置中添加 Nitro Vite 插件
2. 配置客户端与服务器入口文件
3. 创建服务器入口，将应用渲染为 HTML
4. 创建客户端入口，为服务器渲染的 HTML 执行水合

## 1. 配置 Vite

在 Vite 配置中添加 Nitro 和 Preact 插件。定义 `client` 环境并指定客户端入口文件：

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

`environments.client` 配置指示 Vite 使用哪个文件作为浏览器入口。Nitro 会自动检测常见目录中以 `entry-server` 或 `server` 命名的文件作为服务器入口。

## 2. 创建 App 组件

创建一个可同时运行于服务器和客户端的共享 Preact 组件：

```tsx [src/app.tsx]
import { useState } from "preact/hooks";

export function App() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount((c) => c + 1)}>Count is {count}</button>;
}
```

## 3. 创建服务器入口

服务器入口使用 `preact-render-to-string/stream` 将 Preact 应用渲染成流式 HTML 响应：

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

通过 `?assets=client` 和 `?assets=ssr` 查询参数导入资源。Nitro 会收集每个入口的 CSS 和 JS 资源，`merge()` 方法将它们合并为单一清单。`assets` 对象提供样式表和脚本的属性数组，以及客户端入口的 URL。使用 `renderToReadableStream` 实现流式 HTML 渲染，提升首字节时间。

## 4. 创建客户端入口

客户端入口对服务器渲染的 HTML 进行水合，挂载 Preact 的事件处理器：

```tsx [src/entry-client.tsx]
import { hydrate } from "preact";
import { App } from "./app.tsx";

function main() {
  hydrate(<App />, document.querySelector("#app")!);
}

main();
```

The `hydrate` function attaches Preact to the existing server-rendered DOM inside `#app` without re-rendering it.
