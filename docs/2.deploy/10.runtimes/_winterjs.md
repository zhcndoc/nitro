---
icon: game-icons:cold-heart
---

# WinterJS

**预设:** `winterjs`

您可以轻松构建基于 Nitro 的应用程序，以便与 [wasmerio/winterjs](https://github.com/wasmerio/winterjs) 运行时一起运行。

[WinterJS](https://github.com/wasmerio/winterjs) 是用 Rust 编写的 JavaScript 服务工作者服务器，使用 SpiderMonkey 运行时执行 JavaScript（与 Firefox 使用的运行时相同） ([公告](https://wasmer.io/posts/announcing-winterjs-service-workers))。


::warning
🌙 WinterJS 目前支持 **夜间发布渠道**。请阅读文档以了解如何使用 [夜间发布渠道](/guide/getting-started#nightly-release-channel)。
::


::warning
🚧 WinterJS 运行时不稳定，正在进行大量开发。请关注 [unjs/nitro#1861](https://github.com/unjs/nitro/issues/1861) 获取状态和信息。
::


为了构建该运行时，请使用 `NITRO_PRESET="winterjs"` 环境变量：

```sh
NITRO_PRESET="winterjs" npm run build
```

确保您在本地安装了 `wasmer` （[安装 wasmer](https://docs.wasmer.io/install)）

本地运行：

```sh
wasmer run wasmer/winterjs --forward-host-env --net --mapdir app:.output app/server/index.mjs
```
