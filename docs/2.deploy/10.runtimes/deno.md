---
icon: simple-icons:deno
---

# Deno

> 使用 [Deno](https://deno.com/) 运行时运行 Nitro 应用。

**预设：** `deno_server`

你可以将 Nitro 应用构建为在 [Deno runtime](https://deno.com/runtime) 中运行的自定义服务器。

```bash
# Build with the Deno preset
NITRO_PRESET=deno_server npm run build

# Start production server
deno run --allow-net --allow-read --allow-env .output/server/index.mjs
```

## Deno Deploy

[Deno Deploy](https://deno.com/deploy) 会运行 `deno_server` 预设的构建输出。

:read-more{title="Deno Deploy" to="https://docs.deno.com/deploy/"}

::warning
Deno 团队加入 Cloudflare 后，Deno Deploy 将于 2027 年关闭（[公告](https://deno.com/blog/cloudflare)）。
::

1. 在 [Deno Deploy](https://console.deno.com) 上创建新应用，并关联 GitHub 仓库。
2. 将**构建命令**设为使用 `deno_server` 预设进行构建（例如 `NITRO_PRESET=deno_server npm run build`）。
3. 选择 **Dynamic** 运行时配置，并将**入口点**设为 `.output/server/index.mjs`。

之后，每次向仓库推送都会触发新的构建和部署。

::note
`deno_deploy` 预设面向 Deno Deploy Classic，该服务已于 2026 年 7 月 20 日关闭，并已在 Nitro v3 中移除。请改用 `deno_server` 预设。
::
