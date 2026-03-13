---
category: 服务器端渲染
icon: i-lucide-brackets
---

# Nano JSX

> 在 Nitro 中使用 nano-jsx 实现服务器端 JSX 渲染。

<!-- automd:ui-code-tree src="../../examples/nano-jsx" default="server.tsx" ignore="README.md,GUIDE.md" expandAll -->

::code-tree{defaultValue="server.tsx" expandAll}

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

::

<!-- /automd -->

<!-- automd:file src="../../examples/nano-jsx/README.md" -->

## 服务器入口

```tsx [server.tsx]
import { defineHandler, html } from "nitro";
import { renderSSR } from "nano-jsx";

export default defineHandler(() => {
  return html(renderSSR(() => <h1>Nitro + nano-jsx works!</h1>));
});
```

Nitro 会自动检测 `server.tsx` 并将其作为服务器入口。使用 nano-jsx 提供的 `renderSSR` 将 JSX 转换为 HTML 字符串。H3 的 `html` 辅助函数会设置正确的内容类型头。

<!-- /automd -->

## 了解更多

- [Renderer](/docs/renderer)
- [nano-jsx](https://nanojsx.io/)
