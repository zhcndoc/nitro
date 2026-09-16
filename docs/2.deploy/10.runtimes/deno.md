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

:read-more{to="/deploy/providers/deno-deploy"}
