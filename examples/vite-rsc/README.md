此示例演示了使用 Vite 的实验性 RSC 插件和 Nitro 实现的 React Server Components（RSC）。其中包括服务器组件、客户端组件、服务器操作和流式 SSR。

## 概览

1. **SSR 入口**处理传入的请求，并将 React 组件渲染为 HTML
2. **根组件**定义页面结构，作为服务器组件
3. **客户端组件**使用 `"use client"` 指令实现交互部分

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
  // Duplicate one RSC stream into two.
  // - one for SSR (ReactClient.createFromReadableStream below)
  // - another for browser hydration payload by injecting <script>...FLIGHT_DATA...</script>.
  const [rscStream1, rscStream2] = rscStream.tee();

  // Deserialize RSC stream back to React VDOM
  let payload: Promise<RscPayload> | undefined;
  function SsrRoot() {
    // Deserialization needs to be kicked off inside ReactDOMServer context
    // for ReactDOMServer preinit/preloading to work
    payload ??= createFromReadableStream<RscPayload>(rscStream1);
    return React.use(payload).root;
  }

  // Render HTML (traditional SSR)
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
    // fallback to render an empty shell and run pure CSR on browser,
    // which can replay server component error and trigger error boundary.
    status = 500;
    htmlStream = await renderToReadableStream(
      <html>
        <body>
          <noscript>Internal Server Error: SSR failed</noscript>
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
    // Initial RSC stream is injected in HTML stream as <script>...FLIGHT_DATA...</script>
    // using utility made by devongovett https://github.com/devongovett/rsc-html-stream
    responseStream = responseStream.pipeThrough(
      injectRSCPayload(rscStream2, {
        nonce: options?.nonce,
      })
    );
  }

  return { stream: responseStream, status };
}
```

SSR 入口负责处理渲染流程。它会加载 RSC 入口模块，复制 RSC 流（一个用于 SSR，另一个用于 hydration），将流反序列化回 React VDOM，并将其渲染为 HTML。RSC 负载会被注入 HTML，以便客户端进行 hydration。

## 2. 根服务器组件

```tsx [app/root.tsx]
import "./index.css"; // css import is automatically injected in exported server components
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

        <a href="https://nitro.build" target="_blank">
          <img src={nitroLogo} className="logo" alt="Nitro logo" />
        </a>
      </div>
      <h1>Vite + RSC + Nitro</h1>
      <div className="card">
        <ClientCounter />
      </div>
      <div className="card">
        <form action={updateServerCounter.bind(null, 1)}>
          <button>Server Counter: {getServerCounter()}</button>
        </form>
      </div>
      <div className="card">Request URL: {props.url?.href}</div>
      <ul className="read-the-docs">
        <li>
          Edit <code>src/client.tsx</code> to test client HMR.
        </li>
        <li>
          Edit <code>src/root.tsx</code> to test server HMR.
        </li>
        <li>
          Visit{" "}
          <a href="./_.rsc" target="_blank">
            <code>_.rsc</code>
          </a>{" "}
          to view RSC stream payload.
        </li>
        <li>
          Visit{" "}
          <a href="?__nojs" target="_blank">
            <code>?__nojs</code>
          </a>{" "}
          to test server action without js enabled.
        </li>
      </ul>
    </div>
  );
}
```

服务器组件只在服务器上运行。它们可以直接导入 CSS、使用服务器端数据并调用服务器操作。`ClientCounter` 组件虽然被导入，但由于它包含 `"use client"` 指令，因此会在客户端运行。

## 3. 客户端组件

```tsx [app/client.tsx]
"use client";

import React from "react";

export function ClientCounter() {
  const [count, setCount] = React.useState(0);

  return <button onClick={() => setCount((count) => count + 1)}>Client Counter: {count}</button>;
}
```

`"use client"` 指令将此组件标记为客户端组件。它会在浏览器上进行 hydration，并处理交互状态。服务器组件可以导入并渲染客户端组件，但客户端组件不能导入服务器组件。
