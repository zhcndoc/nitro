使用 Shiki 和 TextMate 语法实现语法高亮。此示例演示如何利用 Nitro 的服务器脚本功能，在发送响应之前，于 HTML 文件内运行 JavaScript 来在服务器端高亮代码。

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

创建一个带有 Vitesse Dark 主题和 TypeScript 语言支持的 Shiki 高亮器。当 API 收到 POST 请求时，它从请求体读取代码，并返回高亮后的 HTML。

## 服务器端渲染

```html [index.html]
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Hello World Snippet</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <div class="card" role="region" aria-label="Code snippet">
      <div class="label">JavaScript</div>
      <script server>
        const hl = (code) =>
          serverFetch("/api/highlight", {
            method: "POST",
            body: code,
          });
      </script>
      <pre><code>{{{ hl(`console.log("💚 Simple is beautiful!");`) }}}</code></pre>
    </div>
  </body>
</html>
```

`<script server>` 标签会在 HTML 发送之前于服务器运行。它定义了一个辅助函数，使用 `serverFetch` 调用高亮 API。三重大括号语法 `{{{ }}}` 会原样输出结果而不进行转义，因此高亮后的 HTML 能正确渲染。