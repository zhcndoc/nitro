---
icon: simple-icons:bun
---

# Bun

> 使用 Bun 运行时运行 Nitro 应用。

**预设:** `bun`

Nitro 输出与 Bun 运行时兼容。在使用默认的 [Node.js](/deploy/runtimes/node) 时，您也可以在 Bun 中运行输出，使用 `bun` 预设具有更好的优化优势。

使用 `bun` 作为预设构建后，您可以通过以下命令在生产环境中运行服务器：

```bash
bun run ./.output/server/index.mjs
```

:read-more{to="https://bun.sh"}
