---
category: integrations
icon: i-lucide-image
---

# Takumi

> 使用 Takumi 通过 Nitro 路由生成动态 Open Graph 图片。

<!-- automd:ui-code-tree src="../../examples/takumi" default="routes/og.png.ts" ignore="README.md,GUIDE.md" expandAll -->

::code-tree{defaultValue="routes/og.png.ts" expandAll}

```html [index.html]
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Takumi + Nitro — OG 图片</title>

    <!-- Open Graph / 社交预览，由 /og.png 动态生成 -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="Takumi + Nitro" />
    <meta property="og:description" content="从 Nitro 路由生成 OG 图片。" />
    <meta
      property="og:image"
      content="/og.png?title=Takumi%20%2B%20Nitro&description=%E4%BB%8E%20Nitro%20%E8%B7%AF%E7%94%B1%E7%94%9F%E6%88%90%20OG%20%E5%9B%BE%E7%89%87%E3%80%82"
    />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:image" content="/og.png" />

    <!-- 在解析过程中并行获取初始预览，早于脚本自身的 fetch() -->
    <link
      rel="preload"
      as="image"
      href="/og.png?title=Takumi%20%2B%20Nitro&description=%E4%BB%8E%20Nitro%20%E8%B7%AF%E7%94%B1%E7%94%9F%E6%88%90%20OG%20%E5%9B%BE%E7%89%87%E3%80%82"
    />

    <link rel="stylesheet" href="/src/styles.css" />
  </head>
  <body>
    <main class="card">
      <div class="header-row">
        <div>
          <span class="eyebrow">实时预览</span>
          <h1>Takumi + Nitro</h1>
        </div>
        <a
          id="endpoint-link"
          class="icon-link"
          href="/og.png?title=Takumi%20%2B%20Nitro&description=%E4%BB%8E%20Nitro%20%E8%B7%AF%E7%94%B1%E7%94%9F%E6%88%90%20OG%20%E5%9B%BE%E7%89%87%E3%80%82"
          target="_blank"
          rel="noopener"
          title="打开原始端点"
          aria-label="打开原始端点"
        >
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </div>
      <p class="lead">
        下方图片由 <code>routes/og.png.ts</code> 处理程序在请求时生成。编辑字段即可实时重新渲染。
      </p>

      <div class="preview-wrap">
        <img
          id="preview"
          class="preview"
          alt="生成的 Open Graph 图片"
          width="1200"
          height="630"
          src="/og.png?title=Takumi%20%2B%20Nitro&description=%E4%BB%8E%20Nitro%20%E8%B7%AF%E7%94%B1%E7%94%9F%E6%88%90%20OG%20%E5%9B%BE%E7%89%87%E3%80%82"
        />
        <span id="timing" class="timing-badge" data-pending>正在生成…</span>
      </div>

      <div class="controls">
        <div class="field">
          <label for="title">标题</label>
          <input id="title" placeholder="标题" value="Takumi + Nitro" />
        </div>
        <div class="field">
          <label for="description">描述</label>
          <input
            id="description"
            placeholder="描述"
            value="从 Nitro 路由生成 OG 图片。"
          />
        </div>
      </div>
    </main>

    <script>
      const preview = document.getElementById("preview");
      const titleInput = document.getElementById("title");
      const descInput = document.getElementById("description");
      const timing = document.getElementById("timing");
      const endpointLink = document.getElementById("endpoint-link");

      let requestId = 0;

      function formatServerTiming(header) {
        const match = header?.match(/dur=([\d.]+)/);
        return match ? `${Math.round(Number(match[1]))} ms` : "—";
      }

      async function loadPreview(url) {
        const id = ++requestId;
        timing.textContent = "Generating…";
        timing.toggleAttribute("data-pending", true);
        const res = await fetch(url);
        const blob = await res.blob();
        if (id !== requestId) return; // 较新的按键输入已经取代了此次请求
        if (preview.src.startsWith("blob:")) URL.revokeObjectURL(preview.src);
        preview.src = URL.createObjectURL(blob);
        timing.textContent = formatServerTiming(res.headers.get("Server-Timing"));
        timing.toggleAttribute("data-pending", false);
      }

      function refresh() {
        const params = new URLSearchParams({
          title: titleInput.value,
          description: descInput.value,
        });
        const url = `/og.png?${params.toString()}`;
        endpointLink.href = url;
        loadPreview(url);
      }

      let debounceTimer;
      function refreshDebounced() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(refresh, 300);
      }

      titleInput.addEventListener("input", refreshDebounced);
      descInput.addEventListener("input", refreshDebounced);

      loadPreview(preview.src);
    </script>
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
    "build": "vite build",
    "preview": "node .output/server/index.mjs"
  },
  "devDependencies": {
    "nitro": "latest",
    "takumi-js": "^2.1.1",
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

export default defineConfig({
  plugins: [nitro()],
});
```

```ts [routes/og.png.ts]
import { defineHandler } from "nitro";
import { container, text } from "takumi-js/helpers";
import ImageResponse from "takumi-js/response";

export default defineHandler(async ({ url }) => {
  const title = url.searchParams.get("title") ?? "Takumi + Nitro";
  const description = url.searchParams.get("description") ?? "Render OG images from a Nitro route.";

  const start = performance.now();

  const response = new ImageResponse(
    container({
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "64px",
        backgroundImage: "linear-gradient(to bottom right, #fff1f2, #fecdd3)",
      },
      children: [
        text(title, { fontSize: 72, fontWeight: 700, color: "#111827" }),
        text(description, { fontSize: 42, fontWeight: 500, color: "#4b5563" }),
      ],
    }),
    { width: 1200, height: 630 }
  );

  await response.ready;
  response.headers.set("Server-Timing", `render;dur=${(performance.now() - start).toFixed(1)}`);

  return response;
});
```

```css [src/styles.css]
:root {
  color-scheme: light dark;

  --bg-from: #fff1f2;
  --bg-to: #ffe4e6;
  --card-bg: rgba(255, 255, 255, 0.72);
  --card-border: rgba(255, 255, 255, 0.7);
  --card-shadow: 0 24px 60px -20px rgba(190, 24, 93, 0.35);
  --fg: #111827;
  --fg-muted: #6b7280;
  --field-bg: rgba(255, 255, 255, 0.65);
  --field-border: rgba(17, 24, 39, 0.12);
  --field-border-focus: #be185d;
  --surface: rgba(17, 24, 39, 0.05);
  --surface-hover: rgba(17, 24, 39, 0.1);
  --accent: #be185d;
  --accent-hover: #9d174d;
  --ring: rgba(190, 24, 93, 0.25);
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-from: #1c1117;
    --bg-to: #0b0a0f;
    --card-bg: rgba(30, 27, 34, 0.6);
    --card-border: rgba(255, 255, 255, 0.08);
    --card-shadow: 0 24px 60px -20px rgba(0, 0, 0, 0.7);
    --fg: #f4f4f5;
    --fg-muted: #a1a1aa;
    --field-bg: rgba(255, 255, 255, 0.04);
    --field-border: rgba(255, 255, 255, 0.12);
    --field-border-focus: #f472b6;
    --surface: rgba(255, 255, 255, 0.06);
    --surface-hover: rgba(255, 255, 255, 0.12);
    --accent: #ec4899;
    --accent-hover: #f472b6;
    --ring: rgba(236, 72, 153, 0.35);
  }
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  font-family:
    ui-sans-serif,
    system-ui,
    -apple-system,
    "Segoe UI",
    Roboto,
    sans-serif;
  color: var(--fg);
  background:
    radial-gradient(1200px 600px at 100% -10%, var(--bg-from), transparent 60%),
    linear-gradient(to bottom right, var(--bg-from), var(--bg-to));
  background-attachment: fixed;
}

.card {
  width: 100%;
  max-width: 680px;
  background: var(--card-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--card-border);
  border-radius: 24px;
  padding: 32px;
  box-shadow: var(--card-shadow);
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 12px;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--surface);
  color: var(--fg-muted);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.eyebrow::before {
  content: "";
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--accent);
  box-shadow: 0 0 0 3px var(--ring);
}

h1 {
  margin: 0;
  font-size: 30px;
  line-height: 1.15;
  letter-spacing: -0.02em;
}

p.lead {
  margin: 8px 0 24px;
  color: var(--fg-muted);
  line-height: 1.55;
}

.icon-link {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: var(--surface);
  color: var(--fg-muted);
  transition:
    background 0.15s ease,
    color 0.15s ease,
    transform 0.15s ease;
}

.icon-link:hover {
  background: var(--surface-hover);
  color: var(--fg);
  transform: translateY(-1px);
}

.preview-wrap {
  position: relative;
}

img.preview {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 1200 / 630;
  background: var(--surface);
  border-radius: 14px;
  border: 1px solid var(--field-border);
}

.timing-badge {
  position: absolute;
  right: 12px;
  bottom: 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 999px;
  background: rgba(17, 24, 39, 0.78);
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  line-height: 1.4;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  transition: opacity 0.2s ease;
}

.timing-badge::before {
  content: "";
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #4ade80;
}

.timing-badge[data-pending] {
  opacity: 0.85;
}

.timing-badge[data-pending]::before {
  background: #fbbf24;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  50% {
    opacity: 0.3;
  }
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 24px 0 4px;
}

.field {
  flex: 1 1 220px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 12px;
  font-weight: 600;
  color: var(--fg-muted);
}

.field input {
  width: 100%;
  padding: 11px 13px;
  border-radius: 12px;
  border: 1px solid var(--field-border);
  background: var(--field-bg);
  color: var(--fg);
  font-size: 14px;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.field input:focus {
  outline: none;
  border-color: var(--field-border-focus);
  box-shadow: 0 0 0 3px var(--ring);
}

.field input::placeholder {
  color: var(--fg-muted);
  opacity: 0.6;
}

code {
  font-family: ui-monospace, "SFMono-Regular", Menlo, monospace;
  font-size: 0.9em;
  background: var(--surface);
  padding: 2px 6px;
  border-radius: 6px;
}
```

::

<!-- /automd -->

<!-- automd:file src="../../examples/takumi/README.md" -->

使用 [Takumi](https://takumi.kane.tw) 通过 Nitro 路由生成动态 [Open Graph](https://ogp.me/) 图片。`index.html` 页面通过其 `og:image` meta 标签引用生成的图片，并实时预览该图片。

## 服务端路由

使用 Takumi [辅助函数](https://takumi.kane.tw/docs/helpers)构建节点树——无需设置 JSX。Nitro 处理程序可以返回一个 `Response`，因此可以直接返回 `ImageResponse`。该处理程序会等待 `response.ready`，并添加 `Server-Timing` 标头，以便调用方了解渲染耗时：

```ts [routes/og.png.ts]
import { defineHandler } from "nitro";
import { container, text } from "takumi-js/helpers";
import ImageResponse from "takumi-js/response";

export default defineHandler(async ({ url }) => {
  const title = url.searchParams.get("title") ?? "Takumi + Nitro";
  const description =
    url.searchParams.get("description") ?? "Render OG images from a Nitro route.";

  const start = performance.now();

  const response = new ImageResponse(
    container({
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "64px",
        backgroundImage: "linear-gradient(to bottom right, #fff1f2, #fecdd3)",
      },
      children: [
        text(title, { fontSize: 72, fontWeight: 700, color: "#111827" }),
        text(description, { fontSize: 42, fontWeight: 500, color: "#4b5563" }),
      ],
    }),
    { width: 1200, height: 630 },
  );

  await response.ready;
  response.headers.set("Server-Timing", `render;dur=${(performance.now() - start).toFixed(1)}`);

  return response;
});
```

## 引用图像

`index.html` 将其 Open Graph 标签指向该路由，以便爬虫获取最新渲染的预览：

```html [index.html]
<meta property="og:image" content="/og.png?title=Takumi%20%2B%20Nitro" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
```

## 请求端点

访问 `/og.png?title=Hello&description=From%20Nitro`，即可使用自定义文本渲染图像。响应包含一个报告渲染耗时的 `Server-Timing` 标头；演示页面会在你输入标题/描述字段时重新获取图像，并在预览右下角叠加显示“正在生成…”/“N ms”徽章。标题旁的链接图标始终指向当前预览所使用的原始端点。

`index.html` 的 head 会预加载初始图像，使浏览器能够在解析页面的同时开始获取图像；`<img>` 则通过宽度/高度属性和 CSS 保留其 `1200x630` 的宽高比，从而避免图像加载期间发生布局偏移。

Takumi 会根据部署目标选择渲染后端：Node 预设使用原生绑定，边缘预设使用 WebAssembly。无需进行任何配置。

<!-- /automd -->

## 了解更多

- [Takumi](https://takumi.kane.tw)
