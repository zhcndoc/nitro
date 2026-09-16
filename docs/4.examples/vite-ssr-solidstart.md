---
navigation:
  category: server side rendering
icon: i-logos-solidjs-icon
---

# 使用 SolidStart 的 SSR

> 在 Nitro 中使用 Vite 进行 Server-side rendering with SolidStart

<!-- automd:ui-code-tree src="../../examples/vite-ssr-solidstart" default="src/entry-server.tsx" ignore="README.md,GUIDE.md" expandAll -->

::code-tree{defaultValue="src/entry-server.tsx" expandAll}

```json [package.json]
{
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build"
  },
  "dependencies": {
    "@solidjs/meta": "^0.29.4",
    "@solidjs/router": "^0.15.4",
    "@solidjs/start": "^2.0.0-alpha.2",
    "nitro": "latest",
    "solid-js": "^1.9.11",
    "vite": "latest"
  },
  "engines": {
    "node": ">=22"
  }
}
```

```json [tsconfig.json]
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "jsx": "preserve",
    "jsxImportSource": "solid-js",
    "allowJs": true,
    "strict": true,
    "noEmit": true,
    "isolatedModules": true,
    "types": ["@solidjs/start/env"],
    "paths": {
      "~/*": ["./src/*"]
    }
  }
}
```

```ts [vite.config.ts]
import { defineConfig } from "vite";
import { solidStart } from "@solidjs/start/config";
import { nitro } from "nitro/vite";

export default defineConfig({
  plugins: [solidStart(), nitro()],
});
```

```css [src/app.css]
body {
  font-family:
    Gordita, Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
}

a {
  margin-right: 1rem;
}

main {
  text-align: center;
  padding: 1em;
  margin: 0 auto;
}

h1 {
  color: #335d92;
  text-transform: uppercase;
  font-size: 4rem;
  font-weight: 100;
  line-height: 1.1;
  margin: 4rem auto;
  max-width: 14rem;
}

p {
  max-width: 14rem;
  margin: 2rem auto;
  line-height: 1.35;
}

@media (min-width: 480px) {
  h1 {
    max-width: none;
  }

  p {
    max-width: none;
  }
}
```

```tsx [src/app.tsx]
import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./app.css";

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <Title>SolidStart - Basic</Title>
          <Suspense>{props.children}</Suspense>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
```

```tsx [src/entry-client.tsx]
// @refresh reload
import { mount, StartClient } from "@solidjs/start/client";

mount(() => <StartClient />, document.getElementById("app")!);
```

```tsx [src/entry-server.tsx]
// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server";

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          {assets}
        </head>
        <body>
          <div id="app">{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
));
```

```tsx [src/routes/[...404].tsx]
import { Title } from "@solidjs/meta";
import { HttpStatusCode } from "@solidjs/start";

export default function NotFound() {
  return (
    <main>
      <Title>Not Found</Title>
      <HttpStatusCode code={404} />
      <h1>Page Not Found</h1>
      <p>
        Visit{" "}
        <a href="https://start.solidjs.com" target="_blank">
          start.solidjs.com
        </a>{" "}
        to learn how to build SolidStart apps.
      </p>
    </main>
  );
}
```

```tsx [src/routes/index.tsx]
import { Title } from "@solidjs/meta";

export default function Home() {
  return (
    <main>
      <Title>Hello World</Title>
      <h1>Hello world!</h1>
      <p>
        Visit{" "}
        <a href="https://start.solidjs.com" target="_blank">
          start.solidjs.com
        </a>{" "}
        to learn how to build SolidStart apps.
      </p>
    </main>
  );
}
```

::

<!-- /automd -->

<!-- automd:file src="../../examples/vite-ssr-solidstart/README.md" -->

设置 Server-side rendering (SSR) with Solid、Vite 和 Nitro。该设置使能 streaming HTML responses、automatic asset management 和 client hydration。

## 概述

1. 在你的 Vite 配置中添加 Nitro Vite 插件
2. 创建一个将你的 app 渲染为 HTML 的 server entry
3. 创建一个对 server-rendered HTML 进行 hydration 的 client entry

## 1. 配置 Vite

将 SolidStart 和 Nitro 插件添加到你的 Vite 配置中。

```js [vite.config.ts]
import { defineConfig } from "vite";
import { solidStart } from "@solidjs/start/config";
import { nitro } from "nitro/vite";

export default defineConfig({
  plugins: [solidStart(), nitro()],
});
```

## 2. 创建 App 组件

创建一个在 server 和 client 两者上运行的共享 Solid 组件：

```tsx [src/app.tsx]
import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <Title>SolidStart - Basic</Title>
          <Suspense>{props.children}</Suspense>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
```

## 3. 创建 Server Entry

server entry 将你的 Solid app 渲染为 streaming HTML 响应：

```tsx [src/entry-server.tsx]
// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server";

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          {assets}
        </head>
        <body>
          <div id="app">{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
));
```

## 4. 创建 Client Entry

client entry 对 server-rendered HTML 进行 hydration，并附加 Solid 的 event handlers：

```tsx [src/entry-client.tsx]
// @refresh reload
import { mount, StartClient } from "@solidjs/start/client";

mount(() => <StartClient />, document.getElementById("app")!);
```

<!-- /automd -->

## 了解更多

- [SolidJS Documentation](https://docs.solidjs.com/)
- [Renderer](/docs/renderer)
- [Server Entry](/docs/server-entry)
