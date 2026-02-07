设置使用 Vue、Vue Router、Vite 和 Nitro 进行服务器端渲染（SSR）。此配置支持按路由拆分代码、使用 unhead 进行 head 管理以及客户端水合（hydration）。

## 概览

1. 在 Vite 配置中添加 Nitro Vite 插件  
2. 定义带有懒加载组件的路由  
3. 创建支持路由的服务器入口渲染应用  
4. 创建客户端入口进行水合并接管路由  
5. 创建页面组件  

## 1. 配置 Vite

在 Vite 配置中添加 Nitro 和 Vue 插件。定义 `client` 和 `ssr` 两个环境：

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

// 解决 https://github.com/vitejs/vite-plugin-vue/issues/677
function patchVueExclude(plugin, exclude) {
  const original = plugin.transform.handler;
  plugin.transform.handler = function (...args) {
    if (exclude.test(args[1])) return;
    return original.call(this, ...args);
  };
  return plugin;
}
```

`patchVueExclude` 辅助函数防止 Vue 插件处理带有 `?assets` 查询参数的资源导入（asset imports）。

## 2. 定义路由

创建路由定义，使用懒加载组件和资源元数据：

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

使用动态导入实现组件懒加载，支持代码拆分。`meta.assets` 函数用于加载与路由相关的 CSS 和 JS 代码块。在根布局组件下定义子路由，实现嵌套路由。

## 3. 创建服务器入口

服务器入口渲染 Vue 应用，支持路由和 head 管理：

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

服务器端使用 `createMemoryHistory()`，因为没有浏览器地址栏——路由器会先导航至请求的 URL 再进行渲染。根据匹配的路由动态加载对应资源，确保只包含当前页面所需的 CSS 和 JS。`unhead` 库管理 `<head>` 元素，通过 `transformHtmlTemplate` 注入样式与脚本。

## 4. 创建客户端入口

客户端入口负责水合服务器渲染后的 HTML 并接管路由：

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

客户端入口使用 `createWebHistory()` 创建 Vue 应用以支持浏览器路由。路由器准备完毕后，挂载到 `#root` 元素，并完成 HTML 水合。

## 5. 创建根组件

根组件提供导航功能并渲染子路由：

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