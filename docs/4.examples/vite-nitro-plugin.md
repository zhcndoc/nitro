---
category: vite
icon: i-logos-vitejs
---

# Vite Nitro 插件

> 将 Nitro 作为 Vite 插件，以实现编程式配置。

<!-- automd:ui-code-tree src="../../examples/vite-nitro-plugin" default="vite.config.mjs" ignore="README.md,GUIDE.md" expandAll -->

::code-tree{defaultValue="vite.config.mjs" expandAll}

```json [package.json]
{
  "type": "module",
  "scripts": {
    "build": "vite build",
    "preview": "vite preview",
    "dev": "vite dev"
  },
  "devDependencies": {
    "nitro": "latest",
    "vite": "latest"
  }
}
```

```json [tsconfig.json]
{
  "extends": "nitro/tsconfig"
}
```

```js [vite.config.mjs]
import { defineConfig } from "vite";
import { nitro } from "nitro/vite";

export default defineConfig({
  plugins: [
    nitro(),
    {
      name: "my-nitro-plugin",
      nitro: {
        setup: (nitro) => {
          nitro.options.routes["/"] = "#virtual-by-plugin";
          nitro.options.virtual["#virtual-by-plugin"] =
            `export default () => new Response("Hello from virtual entry!")`;
        },
      },
    },
  ],
});
```

::

<!-- /automd -->

<!-- automd:file src="../../examples/vite-nitro-plugin/README.md" -->

你可以不使用单独的 `nitro.config.ts`，而是直接在你的 Vite 配置中配置 Nitro。这样你就可以使用 Nitro 的 setup 钩子，编程式地注册路由和虚拟模块。

## Vite 配置

```js [vite.config.mjs]
import { defineConfig } from "vite";
import { nitro } from "nitro/vite";

export default defineConfig({
  plugins: [
    nitro(),
    {
      name: "my-nitro-plugin",
      nitro: {
        setup: (nitro) => {
          nitro.options.routes["/"] = "#virtual-by-plugin";
          nitro.options.virtual["#virtual-by-plugin"] =
            `export default () => new Response("Hello from virtual entry!")`;
        },
      },
    },
  ],
});
```

该配置添加了两个插件：`nitro()` 插件和一个使用 `nitro.setup` 钩子的自定义插件。在 setup 函数内部，你可以访问 Nitro 的 options 对象。这个示例在 `/` 注册了一个虚拟路由，映射到一个虚拟模块 `#virtual-by-plugin`，并且内联定义了该模块。

<!-- /automd -->

## 了解更多

- [配置](/docs/configuration)
