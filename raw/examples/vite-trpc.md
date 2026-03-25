# Vite + tRPC

> 在 Nitro 中使用 Vite 和 tRPC 实现端到端类型安全的 API。

<code-tree :expand-all="true" default-value="server/trpc.ts">

```html [index.html]
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>tRPC 计数器</title>
    <style>
      body {
        font-family: system-ui, sans-serif;
        background: #0f1115;
        color: #e5e7eb;
        display: grid;
        place-items: center;
        height: 100vh;
        margin: 0;
      }

      .box {
        background: #181b22;
        padding: 24px 32px;
        border-radius: 10px;
        text-align: center;
        min-width: 200px;
      }

      button {
        background: #2563eb;
        border: none;
        color: white;
        padding: 8px 14px;
        border-radius: 6px;
        cursor: pointer;
        margin-top: 12px;
        font-size: 14px;
      }

      button:hover {
        background: #1d4ed8;
      }

      .value {
        font-size: 36px;
        margin: 12px 0;
      }
    </style>
  </head>
  <body>
    <div class="box">
      <div>计数器</div>
      <div class="value" id="value">
        <script server>
          // 服务端渲染
          const { result } = await serverFetch("/trpc/get").then(r => r.json())
          echo(result?.data?.value)
        </script>
      </div>
      <button id="inc">增加</button>
    </div>

    <script setup>
      const valueEl = document.getElementById("value");
      const incBtn = document.getElementById("inc");

      async function call(path, body) {
        const res = await fetch(`/trpc/${path}`, {
          method: body ? "POST" : "GET",
          headers: { "content-type": "application/json" },
          body: body ? JSON.stringify(body) : undefined,
        });

        const json = await res.json();
        return json.result.data;
      }

      async function refresh() {
        const data = await call("get");
        valueEl.textContent = data.value;
      }

      incBtn.onclick = async () => {
        const data = await call("inc", {});
        valueEl.textContent = data.value;
      };

      refresh();
    </script>
  </body>
</html>
```

```json [package.json]
{
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "@trpc/client": "^11.13.4",
    "@trpc/server": "^11.13.4",
    "nitro": "latest",
    "vite": "latest",
    "zod": "^4.3.6"
  }
}
```

```json [tsconfig.json]
{
  "extends": "nitro/tsconfig",
  "compilerOptions": {}
}
```

```ts [vite.config.ts]
import { defineConfig } from "vite";
import { nitro } from "nitro/vite";

export default defineConfig({
  plugins: [
    nitro({
      routes: {
        "/trpc/**": "./server/trpc.ts",
      },
    }),
  ],
});
```

```ts [server/trpc.ts]
import { initTRPC } from "@trpc/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

let counter = 0;

const t = initTRPC.create();

export const appRouter = t.router({
  get: t.procedure.query(() => {
    return { value: counter };
  }),

  inc: t.procedure.mutation(() => {
    counter++;
    return { value: counter };
  }),
});

export type AppRouter = typeof appRouter;

export default {
  async fetch(request: Request): Promise<Response> {
    return fetchRequestHandler({
      endpoint: "/trpc",
      req: request,
      router: appRouter,
    });
  },
};
```

</code-tree>

使用 Vite 和 Nitro 设置 tRPC，实现无需代码生成的端到端类型安全 API。本示例构建了一个计数器，使用服务端渲染获取初始值，并支持客户端更新。

## 概述

<steps level="4">

#### 使用 Nitro 插件配置 Vite 并路由 tRPC 请求

#### 创建带有过程的 tRPC 路由

#### 创建具有服务端渲染和客户端交互功能的 HTML 页面

</steps>

## 1. 配置 Vite

添加 Nitro 插件并配置 `/trpc/**` 路由指向你的 tRPC 处理器：

```ts [vite.config.ts]
import { defineConfig } from "vite";
import { nitro } from "nitro/vite";

export default defineConfig({
  plugins: [
    nitro({
      routes: {
        "/trpc/**": "./server/trpc.ts",
      },
    }),
  ],
});
```

`routes` 选项将 URL 模式映射到处理器文件。所有发往 `/trpc/*` 的请求都由 tRPC 路由器处理。

## 2. 创建 tRPC 路由器

使用过程定义你的 tRPC 路由器，并将其导出为 fetch 处理器：

```ts [server/trpc.ts]
import { initTRPC } from "@trpc/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

let counter = 0;

const t = initTRPC.create();

export const appRouter = t.router({
  get: t.procedure.query(() => {
    return { value: counter };
  }),

  inc: t.procedure.mutation(() => {
    counter++;
    return { value: counter };
  }),
});

export type AppRouter = typeof appRouter;

export default {
  async fetch(request: Request): Promise<Response> {
    return fetchRequestHandler({
      endpoint: "/trpc",
      req: request,
      router: appRouter,
    });
  },
};
```

使用 `t.procedure.query()` 定义读取操作的过程，使用 `t.procedure.mutation()` 定义写入操作的过程。导出 `AppRouter` 类型，以便客户端获得完整的类型推断。默认导出使用 tRPC 的 fetch 适配器来处理传入请求。

## 3. 创建 HTML 页面

创建具有服务端渲染和客户端交互功能的 HTML 页面：

```html [index.html]
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>tRPC 计数器</title>
    <style>
      body {
        font-family: system-ui, sans-serif;
        background: #0f1115;
        color: #e5e7eb;
        display: grid;
        place-items: center;
        height: 100vh;
        margin: 0;
      }

      .box {
        background: #181b22;
        padding: 24px 32px;
        border-radius: 10px;
        text-align: center;
        min-width: 200px;
      }

      button {
        background: #2563eb;
        border: none;
        color: white;
        padding: 8px 14px;
        border-radius: 6px;
        cursor: pointer;
        margin-top: 12px;
        font-size: 14px;
      }

      button:hover {
        background: #1d4ed8;
      }

      .value {
        font-size: 36px;
        margin: 12px 0;
      }
    </style>
  </head>
  <body>
    <div class="box">
      <div>计数器</div>
      <div class="value" id="value">
        <script server>
          // 服务端渲染
          const { result } = await serverFetch("/trpc/get").then(r => r.json())
          echo(result?.data?.value)
        </script>
      </div>
      <button id="inc">增加</button>
    </div>

    <script setup>
      const valueEl = document.getElementById("value");
      const incBtn = document.getElementById("inc");

      async function call(path, body) {
        const res = await fetch(`/trpc/${path}`, {
          method: body ? "POST" : "GET",
          headers: { "content-type": "application/json" },
          body: body ? JSON.stringify(body) : undefined,
        });

        const json = await res.json();
        return json.result.data;
      }

      async function refresh() {
        const data = await call("get");
        valueEl.textContent = data.value;
      }

      incBtn.onclick = async () => {
        const data = await call("inc", {});
        valueEl.textContent = data.value;
      };

      refresh();
    </script>
  </body>
</html>
```

`<script server>` 代码块在发送响应前在服务器上运行，通过 `serverFetch` 获取初始计数器值。`<script setup>` 代码块在浏览器中运行，处理增加按钮的点击事件。

## 了解更多

- [tRPC](https://trpc.io/)
- [Routing](/docs/routing)
