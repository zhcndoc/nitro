---
category: 服务器端渲染
icon: i-lucide-brackets
---

# Mono JSX

> 在 Nitro 中使用 mono-jsx 进行服务器端 JSX 渲染。

<!-- automd:ui-code-tree src="." default="server.tsx" ignore="README.md,GUIDE.md" expandAll -->

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
    "mono-jsx": "latest",
    "nitro": "latest"
  }
}
```

```tsx [server.tsx]
export default () => (
  <html>
    <h1>Nitro + mongo-jsx 工作正常！</h1>
  </html>
);
```

```json [tsconfig.json]
{
  "extends": "nitro/tsconfig",
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "mono-jsx"
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

<!-- automd:file src="GUIDE.md" -->

## 服务器入口

```tsx [server.tsx]
export default () => (
  <html>
    <h1>Nitro + mongo-jsx 工作正常！</h1>
  </html>
);
```

Nitro 会自动检测 `server.tsx` 并使用 mono-jsx 将 JSX 转换为 HTML。导出一个返回 JSX 的函数，Nitro 会将渲染后的 HTML 作为响应发送。

<!-- /automd -->

## 了解更多

- [渲染器](/docs/renderer)
- [mono-jsx](https://github.com/aspect-dev/mono-jsx)