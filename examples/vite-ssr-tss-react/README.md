使用 Nitro 设置 TanStack Start，获得具备服务器端渲染、基于文件的路由和集成 API 路由的全栈 React 框架体验

## 概述

1. 将 Nitro Vite 插件添加到 Vite 配置中
2. 使用 TanStack Start 的服务器处理程序创建服务器入口
3. 使用默认组件配置路由器
4. 使用基于文件的路由定义路由和 API 端点

## 1. 配置 Vite

将 Nitro、React、TanStack Start 和 Tailwind 插件添加到 Vite 配置中：

```js [vite.config.mjs]
import { defineConfig } from "vite";
import { nitro } from "nitro/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tanstackStart(), viteReact(), tailwindcss(), nitro()],
  resolve: { tsconfigPaths: true },
  environments: {
    ssr: { build: { rollupOptions: { input: "./server.ts" } } },
  },
});
```

`tanstackStart()` 插件提供完整的 SSR 集成，并自动处理客户端入口。`environments.ssr` 选项指向服务器入口文件。

## 2. 创建服务器入口

创建一个使用 TanStack Start 处理程序的服务器入口：

```ts [server.ts]
import handler, { createServerEntry } from "@tanstack/react-start/server-entry";

export default createServerEntry({
  fetch(request) {
    return handler.fetch(request);
  },
});
```

TanStack Start 会自动处理 SSR。`createServerEntry` 包装器与 Nitro 的服务器入口格式集成，而 `handler.fetch` 则处理所有传入的请求。

## 3. 配置路由器

创建一个带有默认错误组件和未找到组件的路由器工厂函数：

```tsx [src/router.tsx]
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen.ts";

export function getRouter() {
  const router = createRouter({
    routeTree,
    defaultPreload: "intent",
    defaultErrorComponent: () => <div>Internal Server Error</div>,
    defaultNotFoundComponent: () => <div>Not Found</div>,
    scrollRestoration: true,
  });
  return router;
}
```

路由器工厂配置预加载行为、滚动恢复以及默认错误和未找到组件。

## 4. 创建根路由

根路由使用头部管理和脚本定义 HTML 外壳：

```tsx [src/routes/__root.tsx]
/// <reference types="vite/client" />
import { HeadContent, Link, Scripts, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import * as React from "react";
import appCss from "~/styles/app.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
    scripts: [{ src: "/customScript.js", type: "text/javascript" }],
  }),
  errorComponent: () => <h1>500: Internal Server Error</h1>,
  notFoundComponent: () => <h1>404: Page Not Found</h1>,
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="p-2 flex gap-2 text-lg">
          <Link to="/" activeProps={{ className: "font-bold" }} activeOptions={{ exact: true }}>
            Home
          </Link>{" "}
          <Link
            // @ts-ignore
            to="/this-route-does-not-exist"
            activeProps={{ className: "font-bold" }}
          >
            404
          </Link>
        </div>
        <hr />
        {children}
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  );
}
```

在 `head()` 函数中定义元标签、样式表和脚本。`shellComponent` 提供包裹所有页面的 HTML 文档外壳。使用 `HeadContent` 渲染头部配置，并使用 `Scripts` 注入用于水合的客户端 JavaScript。

## 5. 创建页面路由

页面路由定义应用程序页面：

```tsx [src/routes/index.tsx]
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <div className="p-2">
      <h3>Welcome Home!</h3>
      <a href="/api/test">/api/test</a>
    </div>
  );
}
```

## API 路由

TanStack Start 支持与页面路由并存的 API 路由。在 `src/routes/api/` 中创建文件，以定义 Nitro 自动提供服务的服务器端点。
