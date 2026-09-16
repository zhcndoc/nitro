使用 Shiki 和 TextMate 语法进行语法高亮。此示例使用 Nitro 的 server scripts 功能在服务器上对代码进行高亮，该功能会在发送响应之前运行 HTML 文件中的 JavaScript

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

创建一个使用 Vitesse Dark 主题并支持 TypeScript 语言的 Shiki 高亮器。当 API 收到 POST 请求时，它会从请求正文中读取代码，并返回高亮后的 HTML

## 服务端渲染

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

`<script server>` 标签会在发送 HTML 之前在服务器上运行。它定义了一个使用 `serverFetch` 调用高亮 API 的辅助函数。三重花括号语法 `{{{ }}}` 会在不进行转义的情况下输出结果，因此高亮后的 HTML 可以正确渲染。
