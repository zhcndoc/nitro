此示例不依赖框架，使用 [Rsbuild](https://rsbuild.rs) 和实验性的 `nitro/rsbuild` 插件在服务器上渲染 HTML 模板。

## 概述

1. 在 Rsbuild 配置中**添加 Nitro Rsbuild 插件**。
2. **创建 HTML 模板**，并在服务器内容插入的位置添加 `<!--ssr-outlet-->` 注释。
3. **创建服务器入口**（`app/entry-server.ts`）以渲染页面内容。
4. **创建客户端入口**（`app/entry-client.ts`）以实现页面交互。
5. **添加 API 路由**以提供服务器端数据。

## 工作原理

Nitro 会检测 `app/entry-server.ts`，并为 Rsbuild 应用添加 `ssr` 环境。服务器入口会导出一个包含 `fetch` 方法的对象，该方法通过 Nitro 内部 fetch 调用 `/api/hello` 路由，并返回页面 HTML。

`index.html` 是客户端的 Rsbuild HTML 模板：Rsbuild 会注入客户端脚本，Nitro 则在每次页面请求时使用服务器入口渲染 `<!--ssr-outlet-->` 注释。

运行 `rsbuild dev` 启动开发服务器，运行 `rsbuild build` 将客户端和服务器构建到 `.output/`。
