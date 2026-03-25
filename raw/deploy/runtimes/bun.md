# Bun

> 使用 Bun 运行 Nitro 应用。

**预设：** `bun`

Nitro 的输出与 Bun 运行时兼容。虽然使用默认的 [Node.js](/deploy/runtimes/node) 也可以在 bun 中运行输出，但使用 `bun` 预设具有更好优化的优势。

在使用 `bun` 作为预设进行构建后，你可以在生产环境中使用以下命令运行服务器：

```bash
bun run ./.output/server/index.mjs
```

<read-more to="https://bun.sh">



</read-more>
