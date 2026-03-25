---
category: server side rendering
icon: i-logos-html-5
---

# Vite SSR HTML

> 使用原生 HTML、Vite 和 Nitro 进行服务端渲染。


<!-- automd:ui-code-tree src="../../examples/vite-ssr-html" default="app/entry-server.ts" ignore="README.md,GUIDE.md" expandAll -->

::code-tree{defaultValue="app/entry-server.ts" expandAll}

```html [index.html]
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Nitro 名言</title>
    <style>
      @import "tailwindcss";
    </style>
  </head>
  <body
    class="min-h-screen flex items-center justify-center p-5 bg-gradient-to-br from-indigo-500 to-purple-600 font-sans"
  >
    <div class="max-w-xl w-full text-center text-white">
      <div class="bg-white/10 backdrop-blur-md rounded-2xl p-10 shadow-xl border border-white/20">
        <div
          id="quote"
          class="text-[clamp(1.2rem,4vw,1.8rem)] leading-relaxed mb-5 font-light opacity-70 transition-opacity duration-500"
        >
          <!--ssr-outlet-->
        </div>
        <div
          id="author"
          class="text-[clamp(1rem,3vw,1.2rem)] opacity-0 font-normal transition-opacity duration-500"
        ></div>
        <button
          id="refresh-btn"
          class="mt-5 bg-white/20 border border-white/30 text-white px-6 py-3 rounded-full cursor-pointer text-sm transition hover:bg-white/30 hover:-translate-y-0.5"
          onclick="fetchQuote()"
        >
          新名言
        </button>
      </div>
      <div class="mt-8 text-sm opacity-60">
        由
        <a
          class="text-white no-underline border-b border-white/30 hover:border-white transition-colors"
          href="https://vitejs.dev/"
          >Vite</a
        >
        和
        <a
          class="text-white no-underline border-b border-white/30 hover:border-white transition-colors"
          href="https://github.com/nitrojs/nitro"
          >Nitro v3</a
        >
        提供支持。
      </div>
    </div>

    <script>
      const quoteElement = document.getElementById("quote");
      const authorElement = document.getElementById("author");
      const refreshBtn = document.getElementById("refresh-btn");

      const baseQuoteClasses =
        "text-[clamp(1.2rem,4vw,1.8rem)] leading-relaxed mb-5 font-light transition-opacity duration-500";
      const loadingQuoteClasses = baseQuoteClasses + " opacity-70";
      const normalQuoteClasses = baseQuoteClasses + " opacity-100";
      const errorQuoteClasses = baseQuoteClasses + " text-red-400 opacity-100 text-sm";

      const baseAuthorClasses =
        "text-[clamp(1rem,3vw,1.2rem)] font-normal transition-opacity duration-500";
      const hiddenAuthorClasses = baseAuthorClasses + " opacity-0";
      const visibleAuthorClasses = baseAuthorClasses + " opacity-80";

      async function fetchQuote() {
        try {
          quoteElement.textContent = "加载中...";
          quoteElement.className = loadingQuoteClasses;
          authorElement.textContent = "";
          authorElement.className = hiddenAuthorClasses;
          refreshBtn.style.display = "none";
          const response = await fetch("/quote");
          if (!response.ok) {
            throw new Error(`HTTP 错误！状态码：${response.status}`);
          }
          const { text, author } = await response.json();
          quoteElement.textContent = `"${text}"`;
          quoteElement.className = normalQuoteClasses;
          authorElement.textContent = `— ${author}`;
          authorElement.className = visibleAuthorClasses;
        } catch (error) {
          console.error("获取名言时出错：", error);
          quoteElement.textContent = "加载名言失败，请重试。";
          quoteElement.className = errorQuoteClasses;
          authorElement.textContent = "";
          authorElement.className = hiddenAuthorClasses;
        } finally {
          refreshBtn.style.display = "inline-block";
        }
      }
    </script>
  </body>
</html>
```

```json [package.json]
{
  "type": "module",
  "scripts": {
    "build": "vite build",
    "dev": "vite dev",
    "preview": "vite preview"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.2.2",
    "nitro": "latest",
    "tailwindcss": "^4.2.2",
    "vite": "latest"
  }
}
```

```json [tsconfig.json]
{
  "extends": "nitro/tsconfig"
}
```

```ts [vite.config.ts]
import { defineConfig } from "vite";
import { nitro } from "nitro/vite";

import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    nitro({
      serverDir: "./",
    }),
    tailwindcss(),
  ],
});
```

```ts [app/entry-server.ts]
import { fetch } from "nitro";

export default {
  async fetch() {
    const quote = (await fetch("/quote").then((res) => res.json())) as {
      text: string;
    };
    return tokenizedStream(quote.text, 50);
  },
};

function tokenizedStream(text: string, delay: number): ReadableStream<Uint8Array> {
  const tokens = text.split(" ");
  return new ReadableStream({
    start(controller) {
      let index = 0;
      function push() {
        if (index < tokens.length) {
          const word = tokens[index++] + (index < tokens.length ? " " : "");
          controller.enqueue(new TextEncoder().encode(word));
          setTimeout(push, delay);
        } else {
          controller.close();
        }
      }
      push();
    },
  });
}
```

```ts [routes/quote.ts]
const QUOTES_URL =
  "https://github.com/JamesFT/Database-Quotes-JSON/raw/refs/heads/master/quotes.json";

let _quotes: Promise<unknown> | undefined;

function getQuotes() {
  return (_quotes ??= fetch(QUOTES_URL).then((res) => res.json())) as Promise<
    { quoteText: string; quoteAuthor: string }[]
  >;
}

export default async function quotesHandler() {
  const quotes = await getQuotes();
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  return Response.json({
    text: randomQuote.quoteText,
    author: randomQuote.quoteAuthor,
  });
}
```

::

<!-- /automd -->

<!-- automd:file src="../../examples/vite-ssr-html/README.md" -->

此示例使用服务器端数据渲染 HTML 模板，并逐词流式传输响应。它演示了如何在不使用框架的情况下使用 Nitro 的 Vite SSR 集成。

## 概述

1. **添加 Nitro Vite 插件**以启用 SSR
2. **创建 HTML 模板**，包含 `<!--ssr-outlet-->` 注释，用于标记服务器内容的插入位置
3. **创建服务器入口**，获取数据并返回流
4. **添加 API 路由**，用于服务器端数据

## 工作原理

`index.html` 文件包含 `<!--ssr-outlet-->` 注释，用于标记服务器渲染内容的插入位置。Nitro 会使用服务器入口的输出来替换此注释。

服务器入口导出一个包含 `fetch` 方法的对象。它使用 Nitro 的内部 fetch 调用 `/quote` API 路由，然后返回一个 `ReadableStream`，以逐词发送名言文本，每个词之间延迟 50 毫秒。

名言路由从 GitHub 获取包含名言的 JSON 文件，缓存结果，并返回随机名言。服务器入口调用此路由来获取页面内容。

<!-- /automd -->

## 了解更多

- [Renderer](/docs/renderer)
- [Server Entry](/docs/server-entry)
