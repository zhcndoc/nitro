---
category: integrations
icon: i-lucide-highlighter
---

# Shiki

> 在 Nitro 中使用 Shiki 实现服务器端语法高亮。

<!-- automd:ui-code-tree src="../../examples/shiki" default="api/highlight.ts" ignore="README.md,GUIDE.md" expandAll -->

::code-tree{defaultValue="api/highlight.ts" expandAll}

```html [index.html]
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Hello World 代码片段</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <div class="card" role="region" aria-label="代码片段">
      <div class="label">JavaScript</div>
      <script server>
        const hl = (code) =>
          serverFetch("/api/highlight", {
            method: "POST",
            body: code,
          });
      </script>
      <pre><code>{{{ hl(`console.log("💚 简单即美丽！");`) }}}</code></pre>
    </div>
  </body>
</html>
```

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  serverDir: "./",
});
```

```json [package.json]
{
  "type": "module",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build"
  },
  "devDependencies": {
    "nitro": "latest",
    "shiki": "latest"
  }
}
```

```css [styles.css]
html,
body {
  height: 100%;
  margin: 0;
}
body {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f6f8fa;
  font-family:
    system-ui,
    -apple-system,
    "Segoe UI",
    Roboto,
    "Helvetica Neue",
    Arial,
    "Noto Sans",
    "Liberation Sans",
    sans-serif;
}
.card {
  text-align: left;
  background: #0b1220;
  color: #e6edf3;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(2, 6, 23, 0.2);
  max-width: 90%;
  width: 520px;
}
.label {
  font-size: 12px;
  color: #9aa7b2;
  margin-bottom: 8px;
}
pre {
  margin: 0;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Courier New", monospace;
  font-size: 14px;
  background: transparent;
  white-space: pre;
  overflow: auto;
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

export default defineConfig({
  plugins: [nitro()],
});
```

```ts [api/highlight.ts]
import { createHighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";

const highlighter = await createHighlighterCore({
  engine: createOnigurumaEngine(import("shiki/wasm")),
  themes: [await import("shiki/themes/vitesse-dark.mjs")],
  langs: [await import("shiki/langs/ts.mjs")],
});

export default async ({ req }: { req: Request }) => {
  const code = await req.text();
  const html = await highlighter.codeToHtml(code, {
    lang: "ts",
    theme: "vitesse-dark",
  });
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
};
```

::

<!-- /automd -->

<!-- automd:file src="../../examples/shiki/README.md" -->

使用 Shiki 结合 TextMate 语法文件进行语法高亮。此示例通过 Nitro 的服务器脚本功能在服务器端高亮代码，该功能允许在发送响应前在 HTML 文件中运行 JavaScript。

## API 路由

```ts [api/highlight.ts]
import { createHighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";

const highlighter = await createHighlighterCore({
  engine: createOnigurumaEngine(import("shiki/wasm")),
  themes: [await import("shiki/themes/vitesse-dark.mjs")],
  langs: [await import("shiki/langs/ts.mjs")],
});

export default async ({ req }: { req: Request }) => {
  const code = await req.text();
  const html = await highlighter.codeToHtml(code, {
    lang: "ts",
    theme: "vitesse-dark",
  });
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
};
```

创建一个带有 Vitesse Dark 主题和 TypeScript 语言支持的 Shiki 高亮器。当 API 接收到 POST 请求时，会从请求体读取代码并返回高亮过的 HTML。

## 服务器端渲染

```html [index.html]
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Hello World 代码片段</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <div class="card" role="region" aria-label="代码片段">
      <div class="label">JavaScript</div>
      <script server>
        const hl = (code) =>
          serverFetch("/api/highlight", {
            method: "POST",
            body: code,
          });
      </script>
      <pre><code>{{{ hl(`console.log("💚 简单即美丽！");`) }}}</code></pre>
    </div>
  </body>
</html>
```

`<script server>` 标签在 HTML 发送前于服务器端执行。它定义了一个辅助函数，使用 `serverFetch` 调用高亮 API。三重大括号语法 `{{{ }}}` 用来输出未转义的结果，因此高亮的 HTML 能正确渲染。

<!-- /automd -->

## 了解更多

- [Shiki](https://shiki.style/)
