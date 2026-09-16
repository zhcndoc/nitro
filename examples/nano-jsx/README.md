## 服务器入口

```tsx [server.tsx]
import { defineHandler, html } from "nitro";
import { renderSSR } from "nano-jsx";

export default defineHandler(() => {
  return html(renderSSR(() => <h1>Nitro + nano-jsx works!</h1>));
});
```

Nitro 会自动检测 `server.tsx` 并将其用作服务器入口。使用 nano-jsx 中的 `renderSSR` 将 JSX 转换为 HTML 字符串。H3 中的 `html` 辅助函数会设置正确的内容类型标头。
