你可以不使用单独的 `nitro.config.ts`，而是直接在 Vite 配置中配置 Nitro。这样你就可以使用 Nitro 的 setup hook，以编程方式注册路由和虚拟模块

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

该配置添加了两个插件：`nitro()` 插件，以及一个使用 `nitro.setup` hook 的自定义插件。在 setup 函数中，你可以访问 Nitro 的 options 对象。此示例在 `/` 注册了一个映射到虚拟模块 `#virtual-by-plugin` 的虚拟路由，然后在行内定义该模块。
