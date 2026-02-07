通过 TanStack Start 配合 Nitro 搭建一个全栈 React 框架体验，支持服务端渲染、基于文件的路由以及集成的 API 路由。

## 概览

1. 在 Vite 配置中添加 Nitro 插件
2. 使用 TanStack Start 的服务 handler 创建服务器入口
3. 配置默认组件的路由器
4. 使用基于文件的路由定义页面和 API 路由

## 1. 配置 Vite

在你的 Vite 配置中添加 Nitro、React、TanStack Start 和 Tailwind 插件：

```js [vite.config.mjs]
import { defineConfig } from "vite";
import { nitro } from "nitro/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    viteTsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart(),
    viteReact(),
    tailwindcss(),
    nitro(),
  ],
  environments: {
    ssr: { build: { rollupOptions: { input: "./server.ts" } } },
  },
});
```

`tanstackStart()` 插件提供完整的 SSR 集成和自动的客户端入口处理。使用 `viteTsConfigPaths()` 可以启用 tsconfig 中的路径别名如 `~/`。`environments.ssr` 指定了服务器入口文件。

## 2. 创建服务器入口

创建一个使用 TanStack Start handler 的服务器入口：

```ts [server.ts]
import handler, { createServerEntry } from "@tanstack/react-start/server-entry";

export default createServerEntry({
  fetch(request) {
    return handler.fetch(request);
  },
});
```

TanStack Start 会自动处理 SSR。`createServerEntry` 用于适配 Nitro 的服务器入口格式，`handler.fetch` 处理所有传入请求。

## 3. 配置路由器

创建一个带有默认错误和未找到组件的路由器工厂函数：

```tsx [src/router.tsx]
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen.ts";

export function getRouter() {
  const router = createRouter({
    routeTree,
    defaultPreload: "intent",
    defaultErrorComponent: () => <div>内部服务器错误</div>,
    defaultNotFoundComponent: () => <div>未找到页面</div>,
    scrollRestoration: true,
  });
  return router;
}
```

路由器工厂函数配置了预加载行为、滚动恢复及默认错误/未找到组件。

## 4. 创建根路由

根路由定义 HTML 外壳，包含 head 管理和脚本：

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
  errorComponent: () => <h1>500：内部服务器错误</h1>,
  notFoundComponent: () => <h1>404：未找到页面</h1>,
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
            首页
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

在 `head()` 函数中定义 meta 标签、样式表和脚本。`shellComponent` 是包裹所有页面的 HTML 文档外壳。使用 `HeadContent` 渲染 head 配置，`Scripts` 注入客户端 JavaScript 以进行 hydration。

## 5. 创建页面路由

页面路由定义应用页面：

```tsx [src/routes/index.tsx]
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <div className="p-2">
      <h3>欢迎回家！</h3>
      <a href="/api/test">/api/test</a>
    </div>
  );
}
```

## API 路由

TanStack Start 支持与页面路由并行的 API 路由。在 `src/routes/api/` 下创建文件来定义服务端接口，Nitro 会自动处理这些接口。