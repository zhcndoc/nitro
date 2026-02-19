# 快速开始

> 从一个全新的 Nitro 项目开始，或者将它集成到现有的 Vite 项目中。

<warning>

Nitro v3 Alpha 文档仍在开发中 — 请预计会有更新、尚未打磨的部分以及偶尔的不准确之处。

</warning>

## 在线体验 Nitro

在浏览器中使用我们的 playground 体验 Nitro。

<card-group>
<card icon="i-logos-stackblitz-icon" target="_blank" title="Nitro+Vite 入门" to="https://stackblitz.com/github/nitrojs/starter/tree/v3-vite?file=index.html,server.ts">

在浏览器中使用一个极简的 Vite 项目玩转 Nitro。

</card>
</card-group>

## 创建 Nitro 项目

创建 Nitro 应用最快捷的方式是使用 `create-nitro-app`。

> <span>
> 
> !注意
> 
> </span>
> 
> 
> 请确保已安装最新的 Node.js、Bun 或 Deno 的长期支持版本（LTS）。
> [Node.js](https://node.zhcndoc.com/zh-cn)、[Bun](https://bun.zhcndoc.com/)、[Deno](https://deno.zhcndoc.com/)

<pm-x command="create-nitro-app">



</pm-x>

<div style="display:flex;justify-content:center;">

![预览](https://github.com/nitrojs/create-nitro-app/blob/main/.images/preview.png?raw=true)

</div>

按照命令行界面的指引操作，即可开始启动开发服务器。

## 添加到 Vite 项目

若要将 Nitro 添加到现有 Vite 项目，请按照以下步骤：

<steps level="3">

### 安装 `nitro` 包

<pm-install name="nitro">



</pm-install>

### 添加 Nitro 插件

```js [vite.config.mjs]
import { defineConfig } from "vite";
import { nitro } from "nitro/vite";

export default defineConfig({
  plugins: [
    nitro()
  ],
  nitro: {
    serverDir: './'
  }
});
```

</steps>

就是这么简单，现在你可以向你的 Vite 项目添加服务器和 API 路由了！
