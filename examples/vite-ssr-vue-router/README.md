使用 Vue、Vue Router、Vite 和 Nitro 设置服务器端渲染（SSR）。此设置支持按路由进行代码拆分、使用 unhead 管理 head，以及客户端 hydration。

## 概述

1. 将 Nitro Vite 插件添加到 Vite 配置中
2. 使用延迟加载组件定义路由
3. 创建支持路由器的服务器入口以渲染应用
4. 创建用于 hydration 并接管路由的客户端入口
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

// Workaround https://github.com/vitejs/vite-plugin-vue/issues/677
function patchVueExclude(plugin, exclude) {
  const original = plugin.transform.handler;
  plugin.transform.handler = function (...args) {
    if (exclude.test(args[1])) return;
    return original.call(this, ...args);
  };
  return plugin;
}
```

`patchVueExclude` 辅助函数会阻止 Vue 插件处理资源导入（带有 `?assets` 查询参数的文件）。

## 2. 定义路由

使用延迟加载的组件和资源元数据创建路由定义：

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

使用动态导入来延迟加载组件，从而启用代码拆分。`meta.assets` 函数会加载特定路由的 CSS 和 JS 代码块。在根布局组件下定义子路由，以实现嵌套路由。

## 3. 创建服务器入口

服务器入口会使用路由器支持和 head 管理来渲染 Vue 应用：

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
  <title>Vue Router Custom Framework</title>
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

服务器使用 `createMemoryHistory()`，因为不存在浏览器地址栏——路由器会先导航到请求的 URL，然后再进行渲染。资源会根据匹配的路由动态加载，从而确保仅包含当前页面所需的 CSS 和 JS。`unhead` 库负责管理 `<head>` 元素，并通过 `transformHtmlTemplate` 注入样式表和脚本。

## 4. 创建客户端入口

客户端入口会对服务器渲染的 HTML 进行 hydration，并接管路由：

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

客户端入口使用 `createWebHistory()` 创建支持浏览器路由的 Vue 应用。路由器就绪后，它会挂载到 `#root` 元素，并对服务器渲染的 HTML 进行 hydration。

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
        <RouterLink to="/" exact-active-class="active">Home</RouterLink>
      </li>
      <li>
        <RouterLink to="/about" active-class="active">About</RouterLink>
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
