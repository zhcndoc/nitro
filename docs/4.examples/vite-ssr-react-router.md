---
navigation:
  category: server side rendering
icon: i-logos-react
---

# 使用 React Router 进行 SSR

> 使用 Vite 在 Nitro 中通过 React Router 进行服务端渲染

<!-- automd:ui-code-tree src="../../examples/vite-ssr-react-router" default="server/ssr.ts" ignore="README.md,favicon.ico,logos" expandAll -->

::code-tree{defaultValue="server/ssr.ts" expandAll}

```json [package.json]
{
  "name": "vite-ssr-react-router",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "vite build",
    "dev": "vite dev",
    "start": "node ./build/server/index.mjs",
    "typegen": "react-router typegen"
  },
  "dependencies": {
    "@react-router/node": "^8.1.0",
    "isbot": "^5.1.44",
    "react": "^19.2.7",
    "react-dom": "^19.2.7",
    "react-router": "^8.1.0"
  },
  "devDependencies": {
    "@react-router/dev": "^8.1.0",
    "@tailwindcss/vite": "^4.3.2",
    "@types/node": "^26.0.0",
    "@types/react": "^19.2.17",
    "@types/react-dom": "^19.2.3",
    "nitro": "latest",
    "tailwindcss": "^4.3.2",
    "typescript": "^6.0.3",
    "vite": "latest"
  }
}
```

```ts [react-router.config.ts]
import type { Config } from "@react-router/dev/config";

export default {
  // Config options...
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: true,
  buildDirectory: "build",
} satisfies Config;
```

```json [tsconfig.json]
{
  "extends": "nitro/tsconfig",
  "include": ["**/*", "**/.server/**/*", "**/.client/**/*", ".react-router/types/**/*"],
  "compilerOptions": {
    "types": ["node", "vite/client"],
    "jsx": "react-jsx",
    "rootDirs": [".", "./.react-router/types"],
    "paths": {
      "~/*": ["./app/*"]
    }
  }
}
```

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

```css [app/app.css]
@import "tailwindcss";

@theme {
  --font-sans:
    "Inter", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
    "Segoe UI Symbol", "Noto Color Emoji";
}

html,
body {
  @apply bg-white dark:bg-gray-950;

  @media (prefers-color-scheme: dark) {
    color-scheme: dark;
  }
}
```

```tsx [app/root.tsx]
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
```

```ts [app/routes.ts]
import { type RouteConfig, index } from "@react-router/dev/routes";

export default [index("routes/home.tsx")] satisfies RouteConfig;
```

```ts [server/ssr.ts]
import { createRequestHandler } from "react-router";

export default {
  fetch: createRequestHandler(
    () => import("virtual:react-router/server-build"),
    import.meta.env.MODE
  ),
};
```

```tsx [app/routes/home.tsx]
import type { Route } from "./+types/home";
import logoDark from "../logos/logo-dark.svg";
import logoLight from "../logos/logo-light.svg";
import nitroLogo from "../logos/nitro.svg";

export function meta({ loaderData }: Route.MetaArgs) {
  return [
    { title: "Nitro + React Router" },
    { name: "description", content: "React Router SSR powered by Nitro." },
  ];
}

export default function Home() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col items-center px-6 py-16 text-center sm:py-24">
      <h1 className="flex items-center gap-5 sm:gap-8">
        <span className="sr-only">Nitro + React Router</span>
        <img className="size-16 sm:size-24" src={nitroLogo} alt="" aria-hidden />
        <span
          className="text-4xl font-light text-gray-300 sm:text-6xl dark:text-gray-600"
          aria-hidden
        >
          +
        </span>
        <picture>
          <source srcSet={logoDark} media="(prefers-color-scheme: dark)" />
          <img className="w-48 sm:w-80" src={logoLight} alt="" aria-hidden />
        </picture>
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-300">
        Full-stack React Router, powered by Nitro.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2">
        <a
          className="text-sm font-medium text-gray-700 underline decoration-gray-300 underline-offset-4 transition-colors hover:text-gray-950 hover:decoration-gray-500 dark:text-gray-300 dark:decoration-gray-700 dark:hover:text-white dark:hover:decoration-gray-500"
          href="https://nitro.build"
          target="_blank"
          rel="noreferrer"
        >
          Nitro Docs ↗
        </a>
        <a
          className="text-sm font-medium text-gray-700 underline decoration-gray-300 underline-offset-4 transition-colors hover:text-gray-950 hover:decoration-gray-500 dark:text-gray-300 dark:decoration-gray-700 dark:hover:text-white dark:hover:decoration-gray-500"
          href="https://reactrouter.com/docs"
          target="_blank"
          rel="noreferrer"
        >
          React Router Docs ↗
        </a>
      </div>

      <section className="mt-16 grid w-full gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
          >
            <h2 className="font-semibold text-gray-950 dark:text-white">{feature.title}</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
              {feature.description}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}

const features = [
  {
    title: "Portable deployments",
    description: "Use presets to build the same app for Node, workers, and serverless runtimes.",
  },
  {
    title: "Backend primitives",
    description: "Use portable caching, storage, databases, route rules, and runtime tasks.",
  },
  {
    title: "One production server",
    description: "Serve SSR, client assets, and API routes from a single production output.",
  },
  {
    title: "One Vite lifecycle",
    description: "Develop and build the React Router frontend and Nitro backend together.",
  },
  {
    title: "In-process requests",
    description: "Call Nitro routes from loaders without an origin or network round trip.",
  },
  {
    title: "Routing without glue",
    description: "Handle server routes first, then fall through to React Router SSR automatically.",
  },
];
```

```ts [server/routes/health.get.ts]
import { defineHandler } from "nitro";

export default defineHandler(() => {
  return { status: "OK" };
});
```

::

<!-- /automd -->

<!-- automd:file src="../../examples/vite-ssr-react-router/README.md" -->

使用 Vite 和 Nitro 设置 React Router 框架模式。此设置使用 Nitro 在开发和生产环境中运行 React Router 服务端构建。

## 概览

1. 将 React Router 和 Nitro 插件添加到 Vite 配置中
2. 配置 Nitro，使其将服务端与 React Router 的客户端构建一起输出
3. 使用 React Router 的请求处理器创建 SSR 处理器
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

React Router 创建 `ssr` 环境，并将浏览器资源构建到 `build/client` 中。自定义输入指向 `server/ssr.ts` 中兼容 fetch 的处理器。Nitro 扫描 `server/` 中的路由，然后将生产服务端输出到 `build/server` 中。

## 2. 配置 React Router

启用 SSR，并使构建目录与 Nitro 输出配置保持同步：

```ts [react-router.config.ts]
import type { Config } from "@react-router/dev/config";

export default {
  ssr: true,
  buildDirectory: "build",
} satisfies Config;
```

React Router 生成由 `virtual:react-router/server-build` 暴露的服务端构建，以及水合所需的客户端资源。

## 3. 创建 SSR 处理器

创建一个将传入请求委托给 React Router 的 SSR 处理器：

```ts [server/ssr.ts]
import { createRequestHandler } from "react-router";

export default {
  fetch: createRequestHandler(
    () => import("virtual:react-router/server-build"),
    import.meta.env.MODE
  ),
};
```

Nitro 在开发和生产环境中通过 Vite 的 `ssr` 服务调用导出的 Web `fetch` 处理器。请求处理器会加载 React Router 生成的服务端构建，并渲染匹配的路由。

## 4. 添加 Nitro 服务端路由

在 `server/routes/` 下添加 API 和其他服务端路由：

```ts [server/routes/health.get.ts]
import { defineHandler } from "nitro";

export default defineHandler(() => {
  return { status: "OK" };
});
```

此路由可通过 `/health` 访问，并由 Nitro 处理；只有在请求未匹配时，才会继续交由 React Router SSR 服务处理。

## 5. 定义 React Router 路由

在 `app/routes.ts` 中声明应用的路由模块：

```ts [app/routes.ts]
import { type RouteConfig, index } from "@react-router/dev/routes";

export default [index("routes/home.tsx")] satisfies RouteConfig;
```

索引路由会在 `/` 渲染主页。

<!-- /automd -->

## 了解更多

- [React Router 文档](https://reactrouter.com/)
- [目录选项](/docs/configuration#directory-options)
