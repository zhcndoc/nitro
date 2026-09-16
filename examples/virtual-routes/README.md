Virtual routes 允许你在配置中将处理程序定义为字符串，而无需创建单独的文件。这在动态生成路由、构建插件或将简单路由内联时非常有用

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

`routes` 选项将 URL 路径映射到虚拟模块标识符（以 `#` 为前缀）。`virtual` 选项将模块内容定义为字符串，或返回字符串的函数。在构建时，Nitro 会将这些虚拟模块解析为实际的处理程序。

此项目中没有路由文件。整个处理程序都以内联方式定义在配置中，Nitro 会在构建时生成该路由。
