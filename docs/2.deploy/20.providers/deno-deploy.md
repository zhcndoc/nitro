# Deno Deploy

> 将 Nitro 应用部署到 [Deno Deploy](https://deno.com/deploy)。

**预设：** `deno_deploy`

:read-more{title="Deno Deploy" to="https://deno.com/deploy"}

## 使用 CLI 部署

你可以使用 [deployctl](https://deno.com/deploy/docs/deployctl) 来部署你的应用。

登录 [Deno Deploy](https://dash.deno.com/account#access-tokens) 以获取 `DENO_DEPLOY_TOKEN` 访问令牌，并将其设置为环境变量。

```bash
# Build with the deno_deploy preset
NITRO_PRESET=deno_deploy npm run build

# 确保从输出目录运行 deployctl 命令
cd .output
deployctl deploy --project=my-project server/index.ts
```

## 使用 GitHub Actions 在 CI/CD 中部署

将 deployctl GitHub Action 作为一个步骤包含在工作流中。

无需任何密钥，但你需要将 GitHub 仓库关联到 Deno Deploy 项目，并在 [Deno Deploy](https://dash.deno.com) 的项目设置中选择“GitHub Actions”部署模式。

在你的 `.github/workflows` 目录中创建以下工作流文件：

```yaml [.github/workflows/deno_deploy.yml]
name: deno-deploy

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - run: corepack enable
      - uses: actions/setup-node@v6
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install
      - run: pnpm build
        env:
          NITRO_PRESET: deno_deploy
      - name: 部署到 Deno Deploy
        uses: denoland/deployctl@v1
        with:
          project: my-project
          entrypoint: server/index.ts
          root: .output
```

## Deno 运行时

:read-more{to="/deploy/runtimes/deno"}
