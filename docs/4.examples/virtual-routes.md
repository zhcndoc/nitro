---
category: features
icon: i-lucide-box
---

# 虚拟路由

> 使用 Nitro 的虚拟模块系统以编程方式定义路由。

<!-- automd:ui-code-tree src="../../examples/virtual-routes" default="nitro.config.ts" ignore="README.md,GUIDE.md" expandAll -->

::code-tree{defaultValue="nitro.config.ts" expandAll}

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  routes: {
    "/": "#virtual-route",
  },
  virtual: {
    "#virtual-route": () =>
      /* js */ `export default () => new Response("Hello from virtual entry!")`,
  },
});
```

```json [package.json]
{
  "type": "module",
  "scripts": {
    "build": "nitro build",
    "dev": "nitro dev",
    "preview": "node .output/server/index.mjs"
  },
  "devDependencies": {
    "nitro": "latest"
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

export default defineConfig({ plugins: [nitro()] });
```

::

<!-- /automd -->

<!-- automd:file src="../../examples/virtual-routes/README.md" -->

虚拟路由让你可以在配置中将处理器定义为字符串，而无需创建单独的文件。这在动态生成路由、构建插件或保持简单路由内联时非常有用。

## 配置

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  routes: {
    "/": "#virtual-route",
  },
  virtual: {
    "#virtual-route": () =>
      /* js */ `export default () => new Response("Hello from virtual entry!")`,
  },
});
```

`routes` 选项将 URL 路径映射到虚拟模块标识符（以 `#` 为前缀）。`virtual` 选项将模块内容定义为字符串或返回字符串的函数。在构建时，Nitro 会将这些虚拟模块解析为实际的处理器。

此项目中没有路由文件。整个处理器都在配置中内联定义，Nitro 在构建时生成路由。

<!-- /automd -->

## 了解更多

- [路由](/docs/routing)
- [配置](/docs/configuration)
