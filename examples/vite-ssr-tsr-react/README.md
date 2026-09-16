使用 React、Vite 和 Nitro 设置 TanStack Router。此设置提供基于文件的路由、类型安全的导航和自动代码拆分

## 概览

1. 将 Nitro Vite 插件添加到 Vite 配置中
2. 创建包含应用入口的 HTML 模板
3. 创建用于初始化路由器的主入口
4. 使用基于文件的路由定义路由

## 1. 配置 Vite

将 Nitro、React 和 TanStack Router 插件添加到 Vite 配置中：

```js [vite.config.mjs]
import { defineConfig } from "vite";
import { nitro } from "nitro/vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

export default defineConfig({
  plugins: [tanstackRouter({ target: "react", autoCodeSplitting: true }), react(), nitro()],
});
```

`tanstackRouter` 插件会根据 `routes/` 目录结构生成路由树。启用 `autoCodeSplitting` 可自动将路由拆分为单独的代码块。将 TanStack Router 插件放在数组中的 React 插件之前

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

创建用于初始化 TanStack Router 的主入口：

```tsx [src/main.tsx]
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";

// Import the generated route tree
import { routeTree } from "./routeTree.gen.ts";

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Render the app
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

`routeTree.gen.ts` 文件会根据 `routes/` 目录结构自动生成。`Register` 接口声明为路由路径和参数提供完整的类型推断。`!rootElement.innerHTML` 检查可防止在热模块替换期间重新渲染

## 4. 创建根路由

根路由（`__root.tsx`）定义应用的布局：

```tsx [src/routes/__root.tsx]
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

const RootLayout = () => (
  <>
    <div className="p-2 flex gap-2">
      <Link to="/" className="[&.active]:font-bold">
        Home
      </Link>
    </div>
    <hr />
    <Outlet />
    <TanStackRouterDevtools />
  </>
);

export const Route = createRootRoute({ component: RootLayout });
```

使用 `Link` 进行类型安全的导航，并设置激活状态样式。`Outlet` 组件用于渲染子路由。包含 `TanStackRouterDevtools` 以使用开发工具（在生产环境中会自动移除）

## 5. 创建页面路由

页面路由使用 `createFileRoute`，并且可以包含加载器：

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

使用 `loader` 函数在渲染前获取数据——数据可通过 `Route.useLoaderData()` 访问。文件路径决定 URL 路径：`routes/index.tsx` 映射到 `/`，`routes/about.tsx` 映射到 `/about`，而 `routes/users/$id.tsx` 映射到 `/users/:id`。
