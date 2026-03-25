# Mono JSX

> 在 Nitro 中使用 mono-jsx 进行服务端 JSX 渲染。

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
    "mono-jsx": "latest",
    "nitro": "latest"
  }
}
```

```tsx [server.tsx]
export default () => (
  <html>
    <h1>Nitro + mono-jsx 正常工作！</h1>
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

</code-tree>

## 服务端入口

```tsx [server.tsx]
export default () => (
  <html>
    <h1>Nitro + mono-jsx 正常工作！</h1>
  </html>
);
```

Nitro 自动检测 `server.tsx` 并使用 mono-jsx 将 JSX 转换为 HTML。导出一个返回 JSX 的函数，Nitro 会将渲染后的 HTML 作为响应发送。

## 了解更多

- [渲染器](/docs/renderer)
- [mono-jsx](https://github.com/aspect-dev/mono-jsx)
