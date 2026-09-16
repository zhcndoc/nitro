从 Nitro 路由生成动态 [Open Graph](https://ogp.me/) 图片，使用 [Takumi](https://takumi.kane.tw)。`index.html` 页面通过其 `og:image` meta 标签引用生成的图片，并实时预览。

## 服务器路由

使用 Takumi [helpers](https://takumi.kane.tw/docs/helpers) 构建节点树——无需设置 JSX。Nitro 处理程序可以返回一个 `Response`，因此可以直接返回 `ImageResponse`。处理程序会等待 `response.ready`，并添加 `Server-Timing` 标头，以便调用方查看渲染耗时：

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

## 引用图片

`index.html` 将其 Open Graph 标签指向该路由，以便爬虫获取最新渲染的预览：

```html [index.html]
<meta property="og:image" content="/og.png?title=Takumi%20%2B%20Nitro" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
```

## 请求端点

访问 `/og.png?title=Hello&description=From%20Nitro`，即可使用自定义文本渲染图片。响应包含一个报告渲染耗时的 `Server-Timing` 标头；演示页面会在你输入标题或描述字段时重新获取图片，并在预览右下角叠加显示“正在生成……”／“N 毫秒”徽章。标题旁的链接图标始终指向当前预览的原始端点。

`index.html` 的 head 会预加载初始图片，因此浏览器会在解析页面的同时开始获取图片；同时，`<img>` 通过宽度／高度属性和 CSS 预留其 `1200x630` 宽高比，以避免加载过程中发生布局偏移。

Takumi 会根据部署目标选择渲染后端：Node preset 使用原生绑定，edge preset 使用 WebAssembly。无需任何配置。
