---
category: server side rendering
icon: i-simple-icons-tanstack
---

# 使用 TanStack Router 实现 SSR

> 在 Nitro 中使用 Vite 进行客户端路由，搭配 TanStack Router。

<!-- automd:ui-code-tree src="../../examples/vite-ssr-tsr-react" default="src/main.tsx" ignore="README.md,GUIDE.md" expandAll -->

::code-tree{defaultValue="src/main.tsx" expandAll}

```html [index.html]
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Nitro + TanStack Router + React</title>
  </head>

  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

```json [package.json]
{
  "type": "module",
  "scripts": {
    "build": "vite build",
    "dev": "vite dev",
    "preview": "vite preview"
  },
  "devDependencies": {
    "@tanstack/react-router": "^1.168.1",
    "@tanstack/react-router-devtools": "^1.166.10",
    "@tanstack/router-plugin": "^1.167.1",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.1",
    "nitro": "latest",
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "vite": "latest"
  }
}
```

```json [tsconfig.json]
{
  "extends": "nitro/tsconfig",
  "compilerOptions": {
    "baseUrl": ".",
    "jsx": "react-jsx",
    "paths": {
      "@/*": ["sec/*"]
    }
  }
}
```

```js [vite.config.mjs]
import { defineConfig } from "vite";
import { nitro } from "nitro/vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

export default defineConfig({
  plugins: [tanstackRouter({ target: "react", autoCodeSplitting: true }), react(), nitro()],
});
```

```tsx [src/main.tsx]
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";

// 导入自动生成的路由树
import { routeTree } from "./routeTree.gen.ts";

// 创建新的路由实例
const router = createRouter({ routeTree });

// 注册路由实例以实现类型安全
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// 渲染应用
const rootElement = document.querySelector("#root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  );
}
```

```ts [src/routeTree.gen.ts]
/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// 此文件由 TanStack Router 自动生成。
// 请勿手动修改此文件，因为每次代码变更时都会重新生成。
// 请将此文件添加到你的 linter 和 formatter 配置的忽略列表中。

import { Route as rootRouteImport } from './routes/__root'
import { Route as IndexRouteImport } from './routes/index'

const IndexRoute = IndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRouteImport,
} as any)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
}
export interface FileRoutesByTo {
  '/': typeof IndexRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/': typeof IndexRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/'
  fileRoutesByTo: FileRoutesByTo
  to: '/'
  id: '__root__' | '/'
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
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
  }
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
}
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()
```

```css [src/assets/main.css]
:root {
  font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a {
  font-weight: 500;
  color: #ff2056;
  text-decoration: inherit;
}
a:hover {
  color: #ff637e;
}

body {
  margin: 0;
  display: flex;
  flex-direction: column;
  place-items: center;
  justify-content: center;
  min-width: 320px;
  min-height: 100vh;
}

h1 {
  font-size: 3.2em;
  line-height: 1.1;
}

#app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
  transition: transform 300ms;
}
.logo:hover {
  transform: scale(1.1);
}

.card {
  padding: 2em;
}

.read-the-docs {
  color: #888;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  cursor: pointer;
  transition: border-color 0.25s;
}
button:hover {
  border-color: #646cff;
}
button:focus,
button:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}

@media (prefers-color-scheme: light) {
  :root {
    color: #213547;
    background-color: #ffffff;
  }
  a:hover {
    color: #747bff;
  }
  button {
    background-color: #f9f9f9;
  }
}
```

```tsx [src/routes/__root.tsx]
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

const RootLayout = () => (
  <>
    <div className="p-2 flex gap-2">
      <Link to="/" className="[&.active]:font-bold">
        首页
      </Link>
    </div>
    <hr />
    <Outlet />
    <TanStackRouterDevtools />
  </>
);

export const Route = createRootRoute({ component: RootLayout });
```

```tsx [src/routes/index.tsx]
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  loader: async () => {
    const r = await fetch("/api/hello");
    return r.json();
  },
  component: Index,
});

function Index() {
  const r = Route.useLoaderData();

  return (
    <div className="p-2">
      <h3>{JSON.stringify(r)}</h3>
    </div>
  );
}
```

::

<!-- /automd -->

<!-- automd:file src="../../examples/vite-ssr-tsr-react/README.md" -->

使用 React、Vite 和 Nitro 搭建 TanStack Router。该配置提供基于文件的路由、类型安全的导航及自动代码拆分。

## 概览

1. 在 Vite 配置中添加 Nitro 插件
2. 创建包含应用入口的 HTML 模板
3. 创建初始化路由的主入口文件
4. 使用基于文件的路由定义路由规则

## 1. 配置 Vite

在 Vite 配置中添加 Nitro、React 和 TanStack Router 插件：

```js [vite.config.mjs]
import { defineConfig } from "vite";
import { nitro } from "nitro/vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

export default defineConfig({
  plugins: [tanstackRouter({ target: "react", autoCodeSplitting: true }), react(), nitro()],
});
```

`tanstackRouter` 插件会根据 `routes/` 目录结构生成路由树。启用 `autoCodeSplitting` 可以自动将路由拆分为不同代码块。确保 TanStack Router 插件放在 React 插件之前。

## 2. 创建 HTML 模板

创建一个作为应用外壳的 HTML 文件：

```html [index.html]
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Nitro + TanStack Router + React</title>
  </head>

  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

## 3. 创建应用入口

创建主入口，初始化 TanStack Router：

```tsx [src/main.tsx]
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";

// 导入自动生成的路由树
import { routeTree } from "./routeTree.gen.ts";

// 创建新的路由实例
const router = createRouter({ routeTree });

// 注册路由实例以实现类型安全
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// 渲染应用
const rootElement = document.querySelector("#root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  );
}
```

`routeTree.gen.ts` 文件由 `routes/` 目录自动生成。`Register` 接口声明提供了完整的路由路径及参数类型推断。`!rootElement.innerHTML` 检查可避免热更新时重复渲染。

## 4. 创建根路由

根路由（`__root.tsx`）定义应用的布局：

```tsx [src/routes/__root.tsx]
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

const RootLayout = () => (
  <>
    <div className="p-2 flex gap-2">
      <Link to="/" className="[&.active]:font-bold">
        首页
      </Link>
    </div>
    <hr />
    <Outlet />
    <TanStackRouterDevtools />
  </>
);

export const Route = createRootRoute({ component: RootLayout });
```

使用 `Link` 实现类型安全的导航及激活状态样式。`Outlet` 组件用于渲染子路由。包含 `TanStackRouterDevtools` 以便开发时调试（生产环境会自动剔除）。

## 5. 创建页面路由

页面路由使用 `createFileRoute`，并且可包含加载数据的 loader：

```tsx [src/routes/index.tsx]
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  loader: async () => {
    const r = await fetch("/api/hello");
    return r.json();
  },
  component: Index,
});

function Index() {
  const r = Route.useLoaderData();

  return (
    <div className="p-2">
      <h3>{JSON.stringify(r)}</h3>
    </div>
  );
}
```

通过 `loader` 函数在渲染前加载数据，数据可通过 `Route.useLoaderData()` 访问。文件路径即对应 URL 路径，例如：`routes/index.tsx` 对应 `/`，`routes/about.tsx` 对应 `/about`，`routes/users/$id.tsx` 对应 `/users/:id`。

<!-- /automd -->

## 更多学习

- [TanStack Router 文档](https://tanstack.com/router)
- [Renderer](/docs/renderer)
