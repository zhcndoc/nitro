Use Shiki for syntax highlighting with TextMate grammars. This example highlights code on the server using Nitro's server scripts feature, which runs JavaScript inside HTML files before sending the response.

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

创建一个带有 Vitesse Dark 主题和 TypeScript 支持的 Shiki 高亮器。当 API 收到 POST 请求时，从请求体读取代码并返回高亮后的 HTML。

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
    <div class="card" role="region" aria-label="代码片段">
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

The `<script server>` tag runs on the server before the HTML is sent. It defines a helper function that calls the highlight API using `serverFetch`. The triple-brace syntax `{{{ }}}` outputs the result without escaping, so the highlighted HTML renders correctly.
