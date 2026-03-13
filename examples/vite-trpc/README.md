Set up tRPC with Vite and Nitro for end-to-end typesafe APIs without code generation. This example builds a counter with server-side rendering for the initial value and client-side updates.

## Overview

1. Configure Vite with the Nitro plugin and route tRPC requests
2. Create a tRPC router with procedures
3. Create an HTML page with server-side rendering and client interactivity

## 1. Configure Vite

Add the Nitro plugin and configure the `/trpc/**` route to point to your tRPC handler:

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

The `<script server>` block runs on the server before sending the response, fetching the initial counter value via `serverFetch`. The `<script setup>` block runs in the browser and handles the increment button click.
