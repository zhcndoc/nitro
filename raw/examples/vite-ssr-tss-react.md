# 使用 TanStack Start 进行 SSR

> 在 Nitro 中使用 Vite 配合 TanStack Start 实现全栈 React。

<code-tree :expand-all="true" default-value="server.ts">

```json [package.json]
{
  "type": "module",
  "scripts": {
    "build": "vite build",
    "dev": "vite dev",
    "start": "node .output/server/index.mjs"
  },
  "dependencies": {
    "@tanstack/react-router": "^1.168.1",
    "@tanstack/react-router-devtools": "^1.166.10",
    "@tanstack/react-start": "^1.167.1",
    "nitro": "latest",
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "tailwind-merge": "^3.5.0",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.2.2",
    "@types/node": "latest",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.1",
    "tailwindcss": "^4.2.2",
    "typescript": "^5.9.3",
    "vite": "latest",
    "vite-tsconfig-paths": "^6.1.1"
  }
}
```

```ts [server.ts]
import handler, { createServerEntry } from "@tanstack/react-start/server-entry";

export default createServerEntry({
  fetch(request) {
    return handler.fetch(request);
  },
});
```

```json [tsconfig.json]
{
  "extends": "nitro/tsconfig",
  "compilerOptions": {
    "baseUrl": ".",
    "jsx": "react-jsx",
    "paths": {
      "~/*": ["./src/*"]
    }
  }
}
```

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

```ts [src/routeTree.gen.ts]
/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// 此文件由 TanStack Router 自动生成。
// 你不应该对这个文件进行任何更改，因为它将被覆盖。
// 此外，你还应该将此文件从你的 linter 和/或 formatter 中排除，以防止被检查或修改。

import { Route as rootRouteImport } from './routes/__root'
import { Route as IndexRouteImport } from './routes/index'
import { Route as ApiTestRouteImport } from './routes/api/test'

const IndexRoute = IndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRouteImport,
} as any)
const ApiTestRoute = ApiTestRouteImport.update({
  id: '/api/test',
  path: '/api/test',
  getParentRoute: () => rootRouteImport,
} as any)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/api/test': typeof ApiTestRoute
}
export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/api/test': typeof ApiTestRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/': typeof IndexRoute
  '/api/test': typeof ApiTestRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/api/test'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/api/test'
  id: '__root__' | '/' | '/api/test'
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  ApiTestRoute: typeof ApiTestRoute
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/api/test': {
      id: '/api/test'
      path: '/api/test'
      fullPath: '/api/test'
      preLoaderRoute: typeof ApiTestRouteImport
      parentRoute: typeof rootRouteImport
    }
  }
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  ApiTestRoute: ApiTestRoute,
}
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

import type { getRouter } from './router.tsx'
import type { createStart } from '@tanstack/react-start'
declare module '@tanstack/react-start' {
  interface Register {
    ssr: true
    router: Awaited<ReturnType<typeof getRouter>>
  }
}
```

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

```css [src/styles/app.css]
@import "tailwindcss";

@layer base {
  *,
  ::after,
  ::before,
  ::backdrop,
  ::file-selector-button {
    border-color: var(--color-gray-200, currentcolor);
  }
}

@layer base {
  html {
    color-scheme: light dark;
  }

  * {
    @apply border-gray-200 dark:border-gray-800;
  }

  html,
  body {
    @apply text-gray-900 bg-gray-50 dark:bg-gray-950 dark:text-gray-200;
  }

  .using-mouse * {
    outline: none !important;
  }
}
```

</code-tree>

使用 Nitro 设置 TanStack Start，获得包含服务端渲染、基于文件的路由和集成 API 路由的全栈 React 框架体验。

## 概述

<steps level="4">

#### 将 Nitro Vite 插件添加到你的 Vite 配置中

#### 使用 TanStack Start 的服务端处理程序创建服务端入口

#### 使用默认组件配置路由

#### 使用基于文件的路由定义路由和 API 端点

</steps>

## 1. 配置 Vite

将 Nitro、React、TanStack Start 和 Tailwind 插件添加到你的 Vite 配置中：

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

`tanstackStart()` 插件提供了完整的 SSR 集成，并自动处理客户端入口。使用 `viteTsConfigPaths()` 来启用 tsconfig 中的路径别名，如 `~/`。`environments.ssr` 选项指向服务端入口文件。

## 2. 创建服务端入口

创建一个使用 TanStack Start 处理程序的服务端入口：

```ts [server.ts]
import handler, { createServerEntry } from "@tanstack/react-start/server-entry";

export default createServerEntry({
  fetch(request) {
    return handler.fetch(request);
  },
});
```

TanStack Start 自动处理 SSR。`createServerEntry` 包装器与 Nitro 的服务端入口格式集成，`handler.fetch` 处理所有传入的请求。

## 3. 配置路由

创建一个包含默认错误和未找到组件的路由工厂函数：

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

路由工厂配置了预加载行为、滚动恢复以及默认的错误/未找到组件。

## 4. 创建根路由

根路由定义了你的 HTML 外壳，包含 head 管理和脚本：

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

在 `head()` 函数中定义 meta 标签、样式表和脚本。`shellComponent` 提供了包裹所有页面的 HTML 文档外壳。使用 `HeadContent` 渲染 head 配置，使用 `Scripts` 注入用于水合的客户端 JavaScript。

## 5. 创建页面路由

页面路由定义了你的应用页面：

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

TanStack Start 支持 API 路由与页面路由并存。在 `src/routes/api/` 中创建文件以定义 Nitro 自动提供服务的端点。

## 了解更多

- [TanStack Start 文档](https://tanstack.com/start)
- [服务器入口](/docs/server-entry)
