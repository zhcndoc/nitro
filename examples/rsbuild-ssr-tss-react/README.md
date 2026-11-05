使用实验性的 `nitro/rsbuild` 插件，在 [Rsbuild](https://rsbuild.rs) 上通过 Nitro 配置 [TanStack Start](https://tanstack.com/start)，实现服务端渲染、基于文件的路由、服务器函数和 API 路由。

## 概述

1. 在 Rsbuild 配置中添加 React、TanStack Start 和 Nitro 插件。
2. 使用 TanStack Start 服务器处理器创建服务器入口。
3. 为路由器配置默认组件。
4. 使用基于文件的路由定义路由、服务器函数和 API 端点。

## 1. 配置 Rsbuild

```ts [rsbuild.config.ts]
import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/rsbuild";
import { nitro } from "nitro/rsbuild";

export default defineConfig({
  plugins: [
    pluginReact(),
    // Nitro serves the `ssr` environment (pages, server functions and server routes)
    tanstackStart({ rsbuild: { installDevServerMiddleware: false } }),
    nitro(),
  ],
});
```

`tanstackStart()` 插件会添加 `client` 和 `ssr` Rsbuild 环境。开发和生产模式下，Nitro 都会提供客户端资源，并使用 `ssr` 环境作为渲染器。

请设置 `rsbuild.installDevServerMiddleware: false`：在开发模式下，Nitro 会处理发往 `ssr` 环境的所有请求（包括服务器函数调用 `/_serverFn/*`），而不是交给 TanStack Start 的开发中间件处理。

## 2. 创建服务器入口

```ts [src/server.ts]
import handler, { createServerEntry } from "@tanstack/react-start/server-entry";

export default createServerEntry({
  fetch(request) {
    return handler.fetch(request);
  },
});
```

TanStack Start 使用 `src/server.ts` 作为 `ssr` 环境的入口。其 `fetch` 处理器负责渲染页面，并处理服务器函数和 API 路由。

## 3. 配置路由器

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

## 4. 路由和服务器函数

根路由（`src/routes/__root.tsx`）定义 HTML 外壳，并通过 `HeadContent` 和 `Scripts` 添加 head 标签和客户端脚本。页面路由可以调用通过 `createServerFn` 创建的服务器函数：

```tsx [src/routes/index.tsx]
const getServerTime = createServerFn({ method: "GET" }).handler(() => {
  return new Date().toISOString();
});

export const Route = createFileRoute("/")({
  loader: () => getServerTime(),
  component: Home,
});
```

API 路由通过 `server.handlers` 在 `src/routes/api/` 中定义。

## 命令

- `rsbuild dev`：启动开发服务器；服务器变更时重新加载，客户端使用 HMR。
- `rsbuild build`：将客户端和服务器构建到 `.output/`，并使用任意 Nitro 部署预设。
- `rsbuild preview`：通过 Nitro 提供生产构建。

TanStack Start 的预渲染和 SPA 模式会从其输出目录加载服务器构建，但该目录已由 Nitro 接管；请改用 Nitro 的[预渲染选项](/config/routing#prerender)。
