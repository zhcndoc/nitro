# Nano JSX

> 在 Nitro 中使用 nano-jsx 进行服务端 JSX 渲染。

<code-tree :expand-all="true" default-value="server.tsx">

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({});
```

```json [package.json]
{
  "type": "module",
  "scripts": {
    "dev": "nitro dev",
    "build": "nitro build"
  },
  "devDependencies": {
    "nano-jsx": "^0.2.1",
    "nitro": "latest"
  }
}
```

```tsx [server.tsx]
import { defineHandler, html } from "nitro";
import { renderSSR } from "nano-jsx";

export default defineHandler(() => {
  return html(renderSSR(() => <h1>Nitro + nano-jsx works!</h1>));
});
```

```json [tsconfig.json]
{
  "extends": "nitro/tsconfig",
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "nano-jsx/esm"
  }
}
```

```ts [vite.config.ts]
import { defineConfig } from "vite";
import { nitro } from "nitro/vite";

export default defineConfig({ plugins: [nitro()] });
```

</code-tree>

## 服务端入口

```tsx [server.tsx]
import { defineHandler, html } from "nitro";
import { renderSSR } from "nano-jsx";

export default defineHandler(() => {
  return html(renderSSR(() => <h1>Nitro + nano-jsx works!</h1>));
});
```

Nitro 自动检测 `server.tsx` 并将其用作服务端入口。使用 nano-jsx 的 `renderSSR` 将 JSX 转换为 HTML 字符串。来自 H3 的 `html` 辅助函数设置正确的内容类型响应头。

## 了解更多

- [渲染器](/docs/renderer)
- [nano-jsx](https://nanojsx.io/)
