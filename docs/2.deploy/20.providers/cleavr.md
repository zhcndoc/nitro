# Cleavr

> 将 Nitro 应用部署到 Cleavr。

**预设：** `cleavr`

:read-more{title="cleavr.io" to="https://cleavr.io"}

::note
与此提供商集成时无需进行[零配置](/deploy#zero-config-providers)
::

## 设置你的 Web 应用

在你的项目中，将 Nitro 预设设置为 `cleavr`。

::code-group
```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  preset: "cleavr",
});
```
```ts [nuxt.config.ts]
export default defineNuxtConfig({
  nitro: {
    preset: "cleavr",
  },
});
```
::

将更改推送到你的代码仓库。

**在你的 Cleavr 面板中：**

1. 置备一台新服务器
2. 添加一个网站，选择 **Nuxt 3** 作为应用类型
3. 在 Web 应用 > 设置 > 代码仓库中，指向你项目的代码仓库

一切就绪，现在可以部署你的项目了！
