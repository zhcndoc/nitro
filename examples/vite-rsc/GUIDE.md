该示例演示了使用 Vite 的实验性 RSC 插件和 Nitro 的 React 服务器组件（RSC）。它包括服务器组件、客户端组件、服务器动作和流式 SSR。

## 概述

1. **SSR 入口** 处理传入请求并将 React 组件渲染为 HTML
2. **根组件** 作为服务器组件定义页面结构
3. **客户端组件** 使用 `"use client"` 指令实现交互部分

## 1. SSR 入口

```tsx [app/framework/entry.ssr.tsx]
import { createFromReadableStream } from "@vitejs/plugin-rsc/ssr";
import React from "react";
import type { ReactFormState } from "react-dom/client";
import { renderToReadableStream } from "react-dom/server.edge";
import { injectRSCPayload } from "rsc-html-stream/server";
import type { RscPayload } from "./entry.rsc";

export default {
  fetch: async (request: Request) => {
    const rscEntryModule = await import.meta.viteRsc.loadModule<typeof import("./entry.rsc")>(
      "rsc",
      "index"
    );
    return rscEntryModule.default(request);
  },
};

export async function renderHTML(
  rscStream: ReadableStream<Uint8Array>,
  options: {
    formState?: ReactFormState;
    nonce?: string;
    debugNoJS?: boolean;
  }
): Promise<{ stream: ReadableStream<Uint8Array>; status?: number }> {
  // 将一个 RSC 流复制成两个流。
  // - 一个用于 SSR（下方的 ReactClient.createFromReadableStream）
  // - 另一个用于通过注入 <script>...FLIGHT_DATA...</script> 实现浏览器水合
  const [rscStream1, rscStream2] = rscStream.tee();

  // 将 RSC 流反序列化为 React 虚拟 DOM
  let payload: Promise<RscPayload> | undefined;
  function SsrRoot() {
    // 反序列化需要在 ReactDOMServer 上下文中启动，
    // 以便 ReactDOMServer 的预初始化/预加载生效
    payload ??= createFromReadableStream<RscPayload>(rscStream1);
    return React.use(payload).root;
  }

  // 渲染 HTML（传统 SSR）
  const bootstrapScriptContent = await import.meta.viteRsc.loadBootstrapScriptContent("index");

  let htmlStream: ReadableStream<Uint8Array>;
  let status: number | undefined;

  try {
    htmlStream = await renderToReadableStream(<SsrRoot />, {
      bootstrapScriptContent: options?.debugNoJS ? undefined : bootstrapScriptContent,
      nonce: options?.nonce,
      formState: options?.formState,
    });
  } catch {
    // 回退渲染一个空壳，在浏览器纯 CSR 运行，
    // 该过程能重放服务器组件错误并触发错误边界。
    status = 500;
    htmlStream = await renderToReadableStream(
      <html>
        <body>
          <noscript>服务器内部错误：SSR 失败</noscript>
        </body>
      </html>,
      {
        bootstrapScriptContent:
          `self.__NO_HYDRATE=1;` + (options?.debugNoJS ? "" : bootstrapScriptContent),
        nonce: options?.nonce,
      }
    );
  }

  let responseStream: ReadableStream<Uint8Array> = htmlStream;
  if (!options?.debugNoJS) {
    // 初始 RSC 流作为 <script>...FLIGHT_DATA...</script> 注入到 HTML 流中，
    // 使用 devongovett 开发的工具 https://github.com/devongovett/rsc-html-stream
    responseStream = responseStream.pipeThrough(
      injectRSCPayload(rscStream2, {
        nonce: options?.nonce,
      })
    );
  }

  return { stream: responseStream, status };
}
```

SSR 入口处理渲染流程。它加载 RSC 入口模块，复制 RSC 流（一份用于 SSR，一份用于水合），将流反序列化回 React 虚拟 DOM 并渲染为 HTML。RSC 负载通过注入到 HTML 中实现客户端水合。

## 2. 根服务器组件

```tsx [app/root.tsx]
import "./index.css"; // css 导入会自动注入导出的服务器组件中
import viteLogo from "./assets/vite.svg";
import { getServerCounter, updateServerCounter } from "./action.tsx";
import reactLogo from "./assets/react.svg";
import nitroLogo from "./assets/nitro.svg";
import { ClientCounter } from "./client.tsx";

export function Root(props: { url: URL }) {
  return (
    <html lang="en">
      <head>
        {/* eslint-disable-next-line unicorn/text-encoding-identifier-case */}
        <meta charSet="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Nitro + Vite + RSC</title>
      </head>
      <body>
        <App {...props} />
      </body>
    </html>
  );
}

function App(props: { url: URL }) {
  return (
    <div id="root">
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev/reference/rsc/server-components" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>

        <a href="https://v3.nitro.build" target="_blank">
          <img src={nitroLogo} className="logo" alt="Nitro logo" />
        </a>
      </div>
      <h1>Vite + RSC + Nitro</h1>
      <div className="card">
        <ClientCounter />
      </div>
      <div className="card">
        <form action={updateServerCounter.bind(null, 1)}>
          <button>服务器计数器：{getServerCounter()}</button>
        </form>
      </div>
      <div className="card">请求 URL: {props.url?.href}</div>
      <ul className="read-the-docs">
        <li>
          编辑 <code>src/client.tsx</code> 来测试客户端 HMR。
        </li>
        <li>
          编辑 <code>src/root.tsx</code> 来测试服务器端 HMR。
        </li>
        <li>
          访问{" "}
          <a href="./_.rsc" target="_blank">
            <code>_.rsc</code>
          </a>{" "}
          查看 RSC 流负载。
        </li>
        <li>
          访问{" "}
          <a href="?__nojs" target="_blank">
            <code>?__nojs</code>
          </a>{" "}
          测试在不启用 JS 的情况下的服务器动作。
        </li>
      </ul>
    </div>
  );
}
```

服务器组件仅在服务器端运行。它们可以直接导入 CSS，使用服务器端数据并调用服务器动作。`ClientCounter` 组件被导入但运行在客户端，因为它带有 `"use client"` 指令。

## 3. 客户端组件

```tsx [app/client.tsx]
"use client";

import React from "react";

export function ClientCounter() {
  const [count, setCount] = React.useState(0);

  return <button onClick={() => setCount((count) => count + 1)}>客户端计数器：{count}</button>;
}
```

`"use client"` 指令将其标记为客户端组件。它在浏览器中水合并处理交互状态。服务器组件可以导入和渲染客户端组件，但客户端组件不能导入服务器组件。