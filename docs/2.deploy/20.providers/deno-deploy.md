# Deno Deploy

> 将 Nitro 应用部署到 [Deno Deploy](https://deno.com/deploy)。

**预设：** `deno_server`

:read-more{title="Deno Deploy" to="https://docs.deno.com/deploy/"}

::warning
Deno 团队加入 Cloudflare 后，Deno Deploy 将于 2027 年关闭（[公告](https://deno.com/blog/cloudflare)）。建议改为部署到 [Cloudflare](/deploy/providers/cloudflare)。
::

## 通过关联的 GitHub 仓库部署

Deno Deploy 会运行 [Deno](/deploy/runtimes/deno) 运行时预设生成的输出。

1. 在 [Deno Deploy](https://console.deno.com) 上创建新应用并关联 GitHub 仓库。
2. 将**构建命令**设置为使用 `deno_server` 预设进行构建（例如 `NITRO_PRESET=deno_server npm run build`）。
3. 选择 **Dynamic** 运行时配置，并将**入口文件**设为 `.output/server/index.mjs`。

之后，每次推送到该仓库都会触发新的构建和部署。

::note
`deno_deploy` 预设原本面向 Deno Deploy Classic，该服务已于 2026 年 7 月 20 日关闭。在 Nitro v3 中，`deno_deploy` 是 `deno_server` 的别名。
::
