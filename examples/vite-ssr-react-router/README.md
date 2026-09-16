使用 Vite 和 Nitro 设置 React Router 框架模式。此设置使用 Nitro 在开发和生产环境中运行 React Router 服务端构建。

## 概述

1. 将 React Router 和 Nitro 插件添加到 Vite 配置中
2. 配置 Nitro，使其与 React Router 的客户端构建一起输出服务端构建
3. 使用 React Router 的请求处理程序创建 SSR 处理程序
4. 添加 Nitro 服务端路由
5. 使用 React Router 的路由配置定义路由

## 1. 配置 Vite

将 React Router、Tailwind CSS 和 Nitro 插件添加到 Vite 配置中：

```ts [vite.config.ts]
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { nitro } from "nitro/vite";

import reactRouterConfig from "./react-router.config";

export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
    nitro({
      serverDir: "./server",
      output: {
        dir: reactRouterConfig.buildDirectory,
        serverDir: `${reactRouterConfig.buildDirectory}/server`,
        publicDir: `${reactRouterConfig.buildDirectory}/client`,
      },
    }),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  environments: {
    ssr: { build: { rollupOptions: { input: "./server/ssr.ts" } } },
  },
});
```

React Router 会创建 `ssr` 环境，并将浏览器资源构建到 `build/client` 中。自定义输入指向 `server/ssr.ts` 中兼容 fetch 的处理程序。Nitro 会扫描 `server/` 中的路由，然后将生产服务端输出到 `build/server` 中。

## 2. 配置 React Router

启用 SSR，并使构建目录与 Nitro 输出配置保持同步：

```ts [react-router.config.ts]
import type { Config } from "@react-router/dev/config";

export default {
  ssr: true,
  buildDirectory: "build",
} satisfies Config;
```

React Router 会生成通过 `virtual:react-router/server-build` 暴露的服务端构建，以及水合所需的客户端资源。

## 3. 创建 SSR 处理程序

创建一个将传入请求委托给 React Router 的 SSR 处理程序：

```ts [server/ssr.ts]
import { createRequestHandler } from "react-router";

export default {
  fetch: createRequestHandler(
    () => import("virtual:react-router/server-build"),
    import.meta.env.MODE
  ),
};
```

Nitro 会在开发和生产环境中通过 Vite `ssr` 服务调用导出的 Web `fetch` 处理程序。请求处理程序会加载 React Router 生成的服务端构建，并渲染匹配的路由。

## 4. 添加 Nitro 服务端路由

在 `server/routes/` 下添加 API 和其他服务端路由：

```ts [server/routes/health.get.ts]
import { defineHandler } from "nitro";

export default defineHandler(() => {
  return { status: "OK" };
});
```

此路由可通过 `/health` 访问，并由 Nitro 处理；如果请求未匹配，该请求才会继续传递给 React Router SSR 服务。

## 5. 定义 React Router 路由

在 `app/routes.ts` 中声明应用的路由模块：

```ts [app/routes.ts]
import { type RouteConfig, index } from "@react-router/dev/routes";

export default [index("routes/home.tsx")] satisfies RouteConfig;
```

索引路由会在 `/` 渲染主页。
