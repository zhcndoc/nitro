# Vite Nitro 插件

> 将 Nitro 用作 Vite 插件，以编程方式配置。

<code-tree :expand-all="true" default-value="vite.config.mjs" expand-all="">

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
    "vite": "beta"
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

</code-tree>

不使用单独的 `nitro.config.ts`，您可以直接在 Vite 配置中配置 Nitro。这使您可以访问 Nitro 的 setup 钩子，从而以编程方式注册路由和虚拟模块。

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

该配置添加了两个插件：`nitro()` 插件和一个使用了 `nitro.setup` 钩子的自定义插件。在 setup 函数中，您可以访问 Nitro 的 options 对象。此示例在 `/` 路由注册了一个虚拟路由，映射到虚拟模块 `#virtual-by-plugin`，并且在内联方式定义了该模块。

## 了解更多

- [配置](/docs/configuration)
