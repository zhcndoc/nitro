---
category: server side rendering
icon: i-logos-vue
---

# 基于 Vue Router 的 SSR

> 在 Nitro 中使用 Vite 和 Vue Router 进行服务端渲染。

<!-- automd:ui-code-tree src="../../examples/vite-ssr-vue-router" default="app/entry-server.ts" ignore="README.md,GUIDE.md" expandAll -->

::code-tree{defaultValue="app/entry-server.ts" expandAll}

```json [package.json]
{
  "type": "module",
  "scripts": {
    "build": "vite build",
    "dev": "vite dev",
    "preview": "vite preview"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^6.0.5",
    "nitro": "latest",
    "unhead": "^2.1.12",
    "vite": "latest",
    "vite-plugin-devtools-json": "^1.0.0",
    "vue": "^3.5.30",
    "vue-router": "^5.0.4"
  }
}
```

```json [tsconfig.json]
{
  "extends": "nitro/tsconfig"
}
```

```js [vite.config.mjs]
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import devtoolsJson from "vite-plugin-devtools-json";
import { nitro } from "nitro/vite";

export default defineConfig((_env) => ({
  plugins: [patchVueExclude(vue(), /\?assets/), devtoolsJson(), nitro()],
  environments: {
    client: { build: { rollupOptions: { input: "./app/entry-client.ts" } } },
    ssr: { build: { rollupOptions: { input: "./app/entry-server.ts" } } },
  },
}));

// 变通方案 https://github.com/vitejs/vite-plugin-vue/issues/677
function patchVueExclude(plugin, exclude) {
  const original = plugin.transform.handler;
  plugin.transform.handler = function (...args) {
    if (exclude.test(args[1])) return;
    return original.call(this, ...args);
  };
  return plugin;
}
```

```vue [app/app.vue]
<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import "./styles.css";
</script>

<template>
  <nav>
    <ul>
      <li>
        <RouterLink to="/" exact-active-class="active">首页</RouterLink>
      </li>
      <li>
        <RouterLink to="/about" active-class="active">关于</RouterLink>
      </li>
    </ul>
  </nav>
  <RouterView />
</template>

<style scoped>
nav {
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1rem;
}

nav ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  gap: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

nav a {
  color: #666;
  text-decoration: none;
}

nav a:hover {
  color: #333;
}

nav a.active {
  color: #646cff;
}
</style>
```

```ts [app/entry-client.ts]
import { createSSRApp } from "vue";
import { RouterView, createRouter, createWebHistory } from "vue-router";
import { routes } from "./routes.ts";

async function main() {
  const app = createSSRApp(RouterView);
  const router = createRouter({ history: createWebHistory(), routes });
  app.use(router);

  await router.isReady();
  app.mount("#root");
}

// eslint-disable-next-line unicorn/更倾向于顶层-await
main();
```

```ts [app/entry-server.ts]
import { createSSRApp } from "vue";
import { renderToString } from "vue/server-renderer";
import { RouterView, createMemoryHistory, createRouter } from "vue-router";
import { createHead, transformHtmlTemplate } from "unhead/server";

import { routes } from "./routes.ts";

import clientAssets from "./entry-client.ts?assets=client";

async function handler(request: Request): Promise<Response> {
  const app = createSSRApp(RouterView);
  const router = createRouter({ history: createMemoryHistory(), routes });
  app.use(router);

  const url = new URL(request.url);
  const href = url.href.slice(url.origin.length);

  await router.push(href);
  await router.isReady();

  const assets = clientAssets.merge(
    ...(await Promise.all(
      router.currentRoute.value.matched
        .map((to) => to.meta.assets)
        .filter(Boolean)
        .map((fn) => (fn as any)().then((m: any) => m.default))
    ))
  );

  const head = createHead();

  head.push({
    link: [
      ...assets.css.map((attrs: any) => ({ rel: "stylesheet", ...attrs })),
      ...assets.js.map((attrs: any) => ({ rel: "modulepreload", ...attrs })),
    ],
    script: [{ type: "module", src: clientAssets.entry }],
  });

  const renderedApp = await renderToString(app);

  const html = await transformHtmlTemplate(head, htmlTemplate(renderedApp));

  return new Response(html, {
    headers: { "Content-Type": "text/html;charset=utf-8" },
  });
}

function htmlTemplate(body: string): string {
  return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vue Router 自定义框架</title>
</head>
<body>
  <div id="root">${body}</div>
</body>
</html>`;
}

export default {
  fetch: handler,
};
```

```ts [app/routes.ts]
import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "app",
    component: () => import("./app.vue"),
    meta: {
      assets: () => import("./app.vue?assets"),
    },
    children: [
      {
        path: "/",
        name: "home",
        component: () => import("./pages/index.vue"),
        meta: {
          assets: () => import("./pages/index.vue?assets"),
        },
      },
      {
        path: "/about",
        name: "about",
        component: () => import("./pages/about.vue"),
        meta: {
          assets: () => import("./pages/about.vue?assets"),
        },
      },
      {
        path: "/:catchAll(.*)",
        name: "not-found",
        component: () => import("./pages/not-found.vue"),
        meta: {
          assets: () => import("./pages/not-found.vue?assets"),
        },
      },
    ],
  },
];
```

```ts [app/shims.d.ts]
declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
```

```css [app/styles.css]
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: #f5f5f5;
  color: #333;
}

main {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin: 2rem 0;
}

button {
  background: rgb(83, 91, 242);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}

button:hover {
  background: #535bf2;
}

.subtitle {
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 2rem;
}
```

```vue [app/pages/about.vue]
<template>
  <main>
    <h1>关于</h1>
    <div class="card">
      <p>这是一个使用 Vite Plugin Fullstack 构建的简单 Vue Router 演示应用。</p>
      <p>它展示了基本的路由和服务端渲染。</p>
    </div>
  </main>
</template>
```

```vue [app/pages/index.vue]
<script setup lang="ts">
import { ref } from "vue";

const count = ref(0);

function increment() {
  count.value++;
}
</script>

<template>
  <main>
    <div class="hero">
      <h1>Vue Router 自定义框架</h1>
      <p class="subtitle">使用 Vite 的简单演示应用</p>
    </div>

    <div class="card counter-card">
      <p>计数：{{ count }}</p>
      <button @click="increment">增加</button>
    </div>
  </main>
</template>

<style scoped>
.hero {
  text-align: center;
  margin-bottom: 2rem;
}

.hero h1 {
  color: rgb(100, 108, 255);
}

.counter-card {
  text-align: center;
}

.counter-card h2 {
  color: #646cff;
  margin-bottom: 1rem;
}

.counter-card p {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 1rem 0;
}
</style>
```

```vue [app/pages/not-found.vue]
<template>
  <main>
    <h1>页面未找到 404</h1>
  </main>
</template>
```

::

<!-- /automd -->

<!-- automd:file src="../../examples/vite-ssr-vue-router/README.md" -->

使用 Vue、Vue Router、Vite 和 Nitro 设置服务端渲染（SSR）。该配置支持按路由代码分割、使用 unhead 进行 head 管理以及客户端水合。

## 概述

1. 将 Nitro Vite 插件添加到 Vite 配置中
2. 定义带有懒加载组件的路由
3. 创建支持路由渲染的服务端入口
4. 创建客户端入口，用于水合并接管路由
5. 创建页面组件

## 1. 配置 Vite

将 Nitro 和 Vue 插件添加到 Vite 配置中。定义 `client` 和 `ssr` 两个环境：

```js [vite.config.mjs]
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import devtoolsJson from "vite-plugin-devtools-json";
import { nitro } from "nitro/vite";

export default defineConfig((_env) => ({
  plugins: [patchVueExclude(vue(), /\?assets/), devtoolsJson(), nitro()],
  environments: {
    client: { build: { rollupOptions: { input: "./app/entry-client.ts" } } },
    ssr: { build: { rollupOptions: { input: "./app/entry-server.ts" } } },
  },
}));

// 变通方案 https://github.com/vitejs/vite-plugin-vue/issues/677
function patchVueExclude(plugin, exclude) {
  const original = plugin.transform.handler;
  plugin.transform.handler = function (...args) {
    if (exclude.test(args[1])) return;
    return original.call(this, ...args);
  };
  return plugin;
}
```

`patchVueExclude` 辅助函数防止 Vue 插件处理资源导入（带有 `?assets` 查询参数的文件）。

## 2. 定义路由

创建带有懒加载组件和资源元数据的路由定义：

```ts [app/routes.ts]
import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "app",
    component: () => import("./app.vue"),
    meta: {
      assets: () => import("./app.vue?assets"),
    },
    children: [
      {
        path: "/",
        name: "home",
        component: () => import("./pages/index.vue"),
        meta: {
          assets: () => import("./pages/index.vue?assets"),
        },
      },
      {
        path: "/about",
        name: "about",
        component: () => import("./pages/about.vue"),
        meta: {
          assets: () => import("./pages/about.vue?assets"),
        },
      },
      {
        path: "/:catchAll(.*)",
        name: "not-found",
        component: () => import("./pages/not-found.vue"),
        meta: {
          assets: () => import("./pages/not-found.vue?assets"),
        },
      },
    ],
  },
];
```

使用动态导入实现懒加载组件，以启用代码分割。`meta.assets` 函数加载路由特定的 CSS 和 JS 代码块。在根布局组件下定义子路由以实现嵌套路由。

## 3. 创建服务端入口

服务端入口用于渲染 Vue 应用，并支持路由和 head 管理：

```ts [app/entry-server.ts]
import { createSSRApp } from "vue";
import { renderToString } from "vue/server-renderer";
import { RouterView, createMemoryHistory, createRouter } from "vue-router";
import { createHead, transformHtmlTemplate } from "unhead/server";

import { routes } from "./routes.ts";

import clientAssets from "./entry-client.ts?assets=client";

async function handler(request: Request): Promise<Response> {
  const app = createSSRApp(RouterView);
  const router = createRouter({ history: createMemoryHistory(), routes });
  app.use(router);

  const url = new URL(request.url);
  const href = url.href.slice(url.origin.length);

  await router.push(href);
  await router.isReady();

  const assets = clientAssets.merge(
    ...(await Promise.all(
      router.currentRoute.value.matched
        .map((to) => to.meta.assets)
        .filter(Boolean)
        .map((fn) => (fn as any)().then((m: any) => m.default))
    ))
  );

  const head = createHead();

  head.push({
    link: [
      ...assets.css.map((attrs: any) => ({ rel: "stylesheet", ...attrs })),
      ...assets.js.map((attrs: any) => ({ rel: "modulepreload", ...attrs })),
    ],
    script: [{ type: "module", src: clientAssets.entry }],
  });

  const renderedApp = await renderToString(app);

  const html = await transformHtmlTemplate(head, htmlTemplate(renderedApp));

  return new Response(html, {
    headers: { "Content-Type": "text/html;charset=utf-8" },
  });
}

function htmlTemplate(body: string): string {
  return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vue Router 自定义框架</title>
</head>
<body>
  <div id="root">${body}</div>
</body>
</html>`;
}

export default {
  fetch: handler,
};
```

服务端使用 `createMemoryHistory()`，因为没有浏览器地址栏——路由会在渲染前导航到请求的 URL。资源会根据匹配的路由动态加载，确保仅包含当前页面所需的 CSS 和 JS。`unhead` 库负责管理 `<head>` 元素，并通过 `transformHtmlTemplate` 注入样式表和脚本。

## 4. 创建客户端入口

客户端入口用于对服务端渲染的 HTML 进行注水并接管路由：

```ts [app/entry-client.ts]
import { createSSRApp } from "vue";
import { RouterView, createRouter, createWebHistory } from "vue-router";
import { routes } from "./routes.ts";

async function main() {
  const app = createSSRApp(RouterView);
  const router = createRouter({ history: createWebHistory(), routes });
  app.use(router);

  await router.isReady();
  app.mount("#root");
}

// eslint-disable-next-line unicorn/prefer-top-level-await
main();
```

客户端入口使用 `createWebHistory()` 创建 Vue 应用，以实现基于浏览器的路由。路由就绪后，它会挂载到 `#root` 元素并对服务端渲染的 HTML 进行注水。

## 5. 创建根组件

根组件提供导航并渲染子路由：

```vue [app/app.vue]
<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import "./styles.css";
</script>

<template>
  <nav>
    <ul>
      <li>
        <RouterLink to="/" exact-active-class="active">首页</RouterLink>
      </li>
      <li>
        <RouterLink to="/about" active-class="active">关于</RouterLink>
      </li>
    </ul>
  </nav>
  <RouterView />
</template>

<style scoped>
nav {
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1rem;
}

nav ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  gap: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

nav a {
  color: #666;
  text-decoration: none;
}

nav a:hover {
  color: #333;
}

nav a.active {
  color: #646cff;
}
</style>
```

<!-- /automd -->

## 了解更多

- [Vue Router 文档](https://router.vuejs.org/)
- [Unhead 文档](https://unhead.unjs.io/)
- [渲染器](/docs/renderer)
- [服务端入口](/docs/server-entry)
