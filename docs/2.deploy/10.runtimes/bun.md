---
icon: simple-icons:bun
---

# Bun

> 使用 Bun 运行时运行 Nitro 应用程序。

**预设:** `bun`

Nitro 输出与 Bun 运行时兼容。在使用默认的 [Node.js](/deploy/runtimes/node) 的同时，您也可以在 bun 中运行输出，使用 `bun` 预设的优势在于更好的优化。

使用 bun 预设构建后，您可以使用以下命令在生产中运行服务器：

```bash
bun run ./.output/server/index.mjs
```

:read-more{to="https://bun.zhcndoc.com"}
