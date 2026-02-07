设置 TanStack Router 与 React、Vite 和 Nitro。该设置提供基于文件的路由，具有类型安全的导航和自动代码拆分。

## 概览

1. 在 Vite 配置中添加 Nitro Vite 插件
2. 创建包含应用入口的 HTML 模板
3. 创建初始化路由的主入口文件
4. 使用基于文件的路由定义路由

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

`tanstackRouter` 插件根据你的 `routes/` 目录结构生成路由树。启用 `autoCodeSplitting` 以自动将路由拆分成独立代码块。请将 TanStack Router 插件放在 React 插件之前。

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

创建初始化 TanStack Router 的主入口文件：

```tsx [src/main.tsx]
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";

// 导入自动生成的路由树
import { routeTree } from "./routeTree.gen.ts";

// 创建新的路由实例
const router = createRouter({ routeTree });

// 注册路由实例以支持类型安全
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

`routeTree.gen.ts` 文件根据 `routes/` 目录结构自动生成。`Register` 接口声明提供了关于路由路径和参数的完整类型推断。`!rootElement.innerHTML` 检查防止热模块替换时的重复渲染。

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

使用 `Link` 实现类型安全的导航，并带有激活状态样式。`Outlet` 组件渲染子路由。包含 `TanStackRouterDevtools` 用于开发调试（生产环境会自动移除）。

## 5. 创建页面路由

页面路由使用 `createFileRoute`，可以包含加载器：

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

使用 `loader` 函数在渲染前获取数据——数据通过 `Route.useLoaderData()` 可用。文件路径对应 URL 路径：`routes/index.tsx` 映射为 `/`，`routes/about.tsx` 映射为 `/about`，`routes/users/$id.tsx` 映射为 `/users/:id`。