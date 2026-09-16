使用 Solid、Vite 和 Nitro 设置服务端渲染（SSR）。此设置支持流式 HTML 响应、自动资源管理和客户端水合。

## 概述

1. 将 Nitro Vite 插件添加到 Vite 配置中
2. 创建一个将应用渲染为 HTML 的服务端入口
3. 创建一个对服务端渲染的 HTML 进行水合的客户端入口

## 1. 配置 Vite

将 SolidStart 和 Nitro 插件添加到 Vite 配置中。

```js [vite.config.ts]
import { defineConfig } from "vite";
import { solidStart } from "@solidjs/start/config";
import { nitro } from "nitro/vite";

export default defineConfig({
  plugins: [solidStart(), nitro()],
});
```

## 2. 创建应用组件

创建一个同时在服务端和客户端运行的共享 Solid 组件：

```tsx [src/app.tsx]
import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <Title>SolidStart - Basic</Title>
          <Suspense>{props.children}</Suspense>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
```

## 3. 创建服务端入口

服务端入口会将 Solid 应用渲染为流式 HTML 响应：

```tsx [src/entry-server.tsx]
// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server";

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          {assets}
        </head>
        <body>
          <div id="app">{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
));
```

## 4. 创建客户端入口

客户端入口会对服务端渲染的 HTML 进行水合，并附加 Solid 的事件处理器：

```tsx [src/entry-client.tsx]
// @refresh reload
import { mount, StartClient } from "@solidjs/start/client";

mount(() => <StartClient />, document.getElementById("app")!);
```
