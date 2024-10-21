---
icon: simple-icons:deno
---

# Deno

> 使用 [Deno](https://deno.com/) 运行 Nitro 应用。

**预设:** `deno_server`

您可以使用 Node.js 构建 Nitro 服务器，以在自定义服务器中运行于 [Deno 运行时](https://deno.com/runtime)。

```bash
# 使用 deno NITRO 预设进行构建
NITRO_PRESET=deno_server npm run build

# 启动生产服务器
deno run --unstable --allow-net --allow-read --allow-env .output/server/index.ts
```

## Deno 部署

:read-more{to="/deploy/providers/deno-deploy"}
