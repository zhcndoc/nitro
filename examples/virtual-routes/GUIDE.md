虚拟路由允许您在配置中将处理程序定义为字符串，而无需创建单独的文件。当动态生成路由、构建插件或将简单路由保持为内联时，这非常有用。

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

`routes` 选项将 URL 路径映射到虚拟模块标识符（以 `#` 为前缀）。`virtual` 选项定义模块内容为字符串或返回字符串的函数。在构建时，Nitro 会将这些虚拟模块解析为实际的处理程序。

该项目中没有路由文件。整个处理程序都内联定义在配置中，Nitro 会在构建时生成路由。