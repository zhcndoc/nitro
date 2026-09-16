---
icon: simple-icons:bun
---

# Bun

> 使用 Bun 运行 Nitro 应用。

**预设：** `bun`

Nitro 输出与 Bun 运行时兼容。虽然默认的 [Node.js](/deploy/runtimes/node) 输出也可以在 Bun 中运行，但使用 `bun` 预设进行构建可以启用 Bun 特定的优化。

使用 `bun` 预设构建后，使用以下命令启动生产服务器：

```bash
bun run ./.output/server/index.mjs
```

:read-more{to="https://bun.sh"}
