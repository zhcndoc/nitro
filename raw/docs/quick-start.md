# 快速开始

> 从一个全新的 Nitro 项目开始，或在现有的 Vite 项目中采用它。

## 在线试用 Nitro

在我们的游乐场中通过浏览器体验 Nitro。

[在 StackBlitz 中试用 Nitro](https://stackblitz.com/github/nitrojs/starter/tree/v3-vite?file=index.html,server.ts)

## 创建 Nitro 项目

创建 Nitro 应用最快的方式是使用 `create-nitro-app`。

<note>

请确保已安装最新 LTS 版本的 [Node.js](https://nodejs.org/en)、[Bun](https://bun.sh/) 或 [Deno](https://deno.com/)。

</note>

<pm-x command="create-nitro-app">



</pm-x>

<details>
<summary>

预览

</summary>


  <div style="display:flex;justify-content:center;">

![预览](https://github.com/nitrojs/create-nitro-app/blob/main/.images/preview.png?raw=true)

</div>
</details>

按照 CLI 的说明操作，然后你就可以启动开发服务器了。

## 添加到 Vite 项目

你可以将 Nitro 添加到任何现有的 Vite 项目中，以获得 API 路由、服务端渲染等功能。

<steps level="3">

### 安装 `nitro` 和 `vite`

<pm-install name="nitro vite">



</pm-install>

### 向 Vite 添加 Nitro 插件

将 Nitro 插件添加到你的 `vite.config.ts` 中：

```ts [vite.config.ts]
import { defineConfig } from "vite";
import { nitro } from "nitro/vite";

export default defineConfig({
  plugins: [
    nitro()
  ],
});
```

### 配置 Nitro

创建 `nitro.config.ts` 来配置服务器目录：

```ts [nitro.config.ts]
import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  serverDir: "./server",
});
```

`serverDir` 选项告诉 Nitro 在哪里查找你的服务器路由。在这个例子中，所有路由都将位于 `server/` 目录内。

### 创建 API 路由

在 `server/api/test.ts` 创建你的第一个 API 路由：

<code-tree default-value="server/api/test.ts">

```ts [server/api/test.ts]
import { defineHandler } from "nitro";

export default defineHandler(() => {
  return { message: "Hello Nitro!" };
});
```

```ts [nitro.config.ts]
import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  serverDir: "./server",
});
```

```ts [vite.config.ts]
import { defineConfig } from "vite";
import { nitro } from "nitro/vite";

export default defineConfig({
  plugins: [nitro()],
});
```

</code-tree>

文件路径直接映射到路由 URL — `server/api/test.ts` 变为 `/api/test`。

<tip>

作为文件系统路由的替代方案，你可以使用 `routes` 配置选项以编程方式声明路由。查看 [程序化路由处理器](/docs/routing#programmatic-route-handlers) 了解更多详情。

</tip>

<tip>

你可以从处理器中返回字符串、JSON 对象、`Response` 实例或可读流。查看 [路由](/docs/routing) 了解更多关于动态路由、方法和中间件的信息。

</tip>

### 启动开发服务器

<pm-run script="dev -- --open">



</pm-run>

你的 API 路由现在可以通过 `http://localhost:3000/api/test` 访问了 ✨

</steps>
