# Upsun

> 将 Nitro 应用部署到 Upsun

**Preset：** `upsun`

:read-more{to="https://upsun.com"}

::note
旧的 `platform_sh` preset 名称仍然有效，并会解析为 `upsun`
::

## 项目创建

首先，在 [Upsun](https://upsun.com) 上创建一个新项目：

```bash
upsun project:create
```

或者关联一个现有项目：

```bash
upsun project:set <project_id>
```

## Upsun 配置

然后在仓库中创建 `.upsun/config.yaml` 文件：

```yaml [.upsun/config.yaml]
applications:
  nitro:
    type: nodejs:24
    dependencies:
      nodejs:
        "pnpm": "*"
    source:
      root: "/"
    hooks:
      build: |
        set -eux
        pnpm install
        NITRO_PRESET=upsun pnpm build
    web:
      commands:
        start: "node .output/server/index.mjs"
      locations:
        "/":
          root: "dist/client"
          passthru: true
          allow: false
    mounts:
      ".data":
        source: storage
        source_path: data

routes:
  # Primary domain
  "https://{default}/":
    type: upstream
    upstream: "nitro:http"
    cache:
      enabled: true
      cookies: ["*"]
      default_ttl: 300
      headers: ["Accept", "Accept-Language"]
```

:read-more{title="所有可用配置属性的完整列表" to="https://docs.upsun.com/get-started/here/configure/nodejs.html"}

:read-more{title="Nitro 存储层" to="/docs/storage"}

## 部署

准备就绪后，使用以下命令部署 `main` 分支：

```bash
git push upsun main
```

或者，如果已安装 Upsun CLI 客户端：

```bash
upsun deploy
```

随后，Upsun 流水线会构建并部署项目：

```bash
Building application 'nitro' (runtime type: nodejs:24)
  Executing build hook...
    W: + pnpm install
    W: + pnpm build
    [info] [nitro] Building Nitro Server (preset: `upsun`)
    [success] [nitro] Nitro Server built

Redeploying environment main
  Environment routes
    https://example.org/ is served by application `nitro`
```

如需任何支持，请联系 [Discord 上的 Upsun 团队](https://discord.com/invite/upsun)。
