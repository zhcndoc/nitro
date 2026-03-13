Virtual routes let you define handlers as strings in your config instead of creating separate files. This is useful when generating routes dynamically, building plugins, or keeping simple routes inline.

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

`routes` 选项将 URL 路径映射到虚拟模块标识符（以 `#` 为前缀）。`virtual` 选项定义模块内容，可以是字符串或返回字符串的函数。在构建时，Nitro 会将这些虚拟模块解析为实际的处理程序。

There are no route files in this project. The entire handler is defined inline in the config, and Nitro generates the route at build time.
