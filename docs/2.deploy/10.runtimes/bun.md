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

## 环境变量

你可以使用以下环境变量自定义服务器行为：

- `NITRO_PORT` 或 `PORT`（默认为 `3000`）
- `NITRO_HOST` 或 `HOST`
- `NITRO_UNIX_SOCKET`：设为套接字文件路径时，服务器会监听该路径而不是 TCP 端口，并忽略 `NITRO_PORT`/`PORT` 和 `NITRO_HOST`/`HOST`。
- `NITRO_SSL_CERT` 和 `NITRO_SSL_KEY`：两者都设置时，服务器会以 HTTPS 模式启动。此模式仅用于测试；生产环境中请在终止 SSL 的反向代理后运行 Nitro 服务器。

```bash
NITRO_UNIX_SOCKET=./app.sock bun run ./.output/server/index.mjs
```

你也可以在[服务器入口](/docs/server-entry)中设置 Bun 专属的监听器选项，例如监听 UNIX 套接字：

```ts [server.ts]
export default {
  bun: { unix: "./app.sock" },
  fetch() {},
};
```

:read-more{to="https://bun.sh"}
