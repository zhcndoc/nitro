---
icon: game-icons:cold-heart
---

# WinterJS

**预设:** `winterjs`

您可以轻松构建基于 Nitro 的应用程序，以在 [wasmerio/winterjs](https://github.com/wasmerio/winterjs) 运行时中运行。

[WinterJS](https://github.com/wasmerio/winterjs) 是一个用 Rust 编写的 JavaScript Service Workers 服务器，它使用 SpiderMonkey 运行时来执行 JavaScript（与 Firefox 使用的运行时相同）([公告](https://wasmer.io/posts/announcing-winterjs-service-workers))。

::warning
🚧 WinterJS 运行时不稳定且正在开发中。请关注 [nitrojs/nitro#1861](https://github.com/nitrojs/nitro/issues/1861) 获取状态和信息。
::

为了为此运行时构建，请使用 `NITRO_PRESET="winterjs"` 环境变量：

```sh
NITRO_PRESET="winterjs" npm run build
```

确保您在本地已安装 `wasmer`（[安装 wasmer](https://docs.wasmer.io/install)）

本地运行：

```sh
wasmer run wasmer/winterjs --forward-host-env --net --mapdir app:.output app/server/index.mjs
```