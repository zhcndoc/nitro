Set up TanStack Router with React, Vite, and Nitro. This setup provides file-based routing with type-safe navigation and automatic code splitting.

## 概览

1. 在 Vite 配置中添加 Nitro 插件
2. 创建包含应用入口的 HTML 模板
3. 创建初始化路由器的主入口文件
4. 使用基于文件的路由定义路由

## 1. 配置 Vite

向 Vite 配置中添加 Nitro、React 及 TanStack Router 插件：

```js [vite.config.mjs]
import { defineConfig } from "vite";
import { nitro } from "nitro/vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

export default defineConfig({
  plugins: [tanstackRouter({ target: "react", autoCodeSplitting: true }), react(), nitro()],
});
```

`tanstackRouter` 插件会根据你的 `routes/` 目录结构生成路由树。启用 `autoCodeSplitting` 可自动拆分路由到不同代码块。请确保将 TanStack Router 插件放在 React 插件之前。

## 2. 创建 HTML 模板

创建 HTML 文件作为应用壳：

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

创建初始化 TanStack Router 的主入口：

```tsx [src/main.tsx]
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";

// 导入自动生成的路由树
import { routeTree } from "./routeTree.gen.ts";

// 创建新的路由实例
const router = createRouter({ routeTree });

// 为类型安全注册路由实例
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

`routeTree.gen.ts` 文件是根据你的 `routes/` 目录结构自动生成的。`Register` 接口声明为路由路径和参数提供了完整的类型推断。通过检查 `!rootElement.innerHTML` 避免在热模块替换时重复渲染。

## 4. 创建根路由

根路由 (`__root.tsx`) 定义了应用的布局：

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

使用 `Link` 实现类型安全的导航及活跃状态样式。`Outlet` 组件用于渲染子路由。开发时引入 `TanStackRouterDevtools` 调试工具（生产环境会自动移除）。

## 5. 创建页面路由

页面路由使用 `createFileRoute`，且支持加载器：

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

Fetch data before rendering with the `loader` function—data is available via `Route.useLoaderData()`. File paths determine URL paths: `routes/index.tsx` maps to `/`, `routes/about.tsx` to `/about`, and `routes/users/$id.tsx` to `/users/:id`.
