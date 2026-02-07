---
category: vite
icon: i-simple-icons-trpc
---

# Vite + tRPC

> 使用 Vite 在 Nitro 中通过 tRPC 实现端到端类型安全的 API。

<!-- automd:ui-code-tree src="." default="server/trpc.ts" ignore="README.md,GUIDE.md" expandAll -->

::code-tree{defaultValue="server/trpc.ts" expandAll}

```text [.gitignore]
node_modules
dist
```

```html [index.html]
<!doctype html>
<html lang="zh">
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
          // 服务器端渲染
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
    "@trpc/client": "^11.8.1",
    "@trpc/server": "^11.8.1",
    "nitro": "latest",
    "vite": "beta",
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

::

<!-- /automd -->

<!-- automd:file src="GUIDE.md" -->

使用 Vite 和 Nitro 配置 tRPC，实现端到端类型安全的 API，无需代码生成。此示例构建了一个计数器，初始值使用服务器端渲染，后续更新通过客户端完成。

## 概览

1. 配置 Vite，添加 Nitro 插件并路由 tRPC 请求
2. 创建带有 procedure 的 tRPC 路由器
3. 创建带有服务器端渲染和客户端交互的 HTML 页面

## 1. 配置 Vite

添加 Nitro 插件并配置 `/trpc/**` 路由指向你的 tRPC 处理程序：

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

`routes` 选项用于将 URL 模式映射到处理文件，所有指向 `/trpc/*` 的请求都由 tRPC 路由器处理。

## 2. 创建 tRPC 路由器

定义你的 tRPC 路由器及其 procedure，并导出为 fetch 处理程序：

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

使用 `t.procedure.query()` 定义读取操作，使用 `t.procedure.mutation()` 定义写入操作。导出 `AppRouter` 类型，使客户端可以获得完整的类型推断。默认导出使用 tRPC 的 fetch 适配器处理传入请求。

## 3. 创建 HTML 页面

创建带有服务器端渲染和客户端交互的 HTML 页面：

```html [index.html]
<!doctype html>
<html lang="zh">
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
          // 服务器端渲染
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

`<script server>` 块在服务器上运行并在响应发送前执行，通过 `serverFetch` 获取初始计数器值。`<script setup>` 块在浏览器中执行，负责处理增加按钮的点击事件。

<!-- /automd -->

## 了解更多

- [tRPC](https://trpc.io/)
- [路由](/docs/routing)