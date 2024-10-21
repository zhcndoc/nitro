# Deno Deploy

> 将 Nitro 应用程序部署到 [Deno Deploy](https://deno.com/deploy)。

**预设:** `deno_deploy`

:read-more{title="Deno Deploy" to="https://deno.com/deploy"}

## 使用 CLI 部署

您可以使用 [deployctl](https://deno.com/deploy/docs/deployctl) 来部署您的应用程序。

登录到 [Deno Deploy](https://dash.deno.com/account#access-tokens) 以获取 `DENO_DEPLOY_TOKEN` 访问令牌，并将其设置为环境变量。

```bash
# 使用 deno_deploy NITRO 预设进行构建
NITRO_PRESET=deno_deploy npm run build

# 确保在输出目录中运行 deployctl 命令
cd .output
deployctl deploy --project=my-project server/index.ts
```

## 使用 GitHub Actions 在 CI/CD 中部署

您只需在工作流程中包含 deployctl GitHub Action 作为一个步骤。

您不需要设置任何秘密以使其正常工作。您需要将您的 GitHub 存储库链接到您的 Deno Deploy 项目，并选择 "GitHub Actions" 部署模式。您可以在 [Deno Deploy](https://dash.deno.com) 的项目设置中完成此操作。

在您的 `.github/workflows` 目录中创建以下工作流程文件：

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
    steps:
      - uses: actions/checkout@v3
      - run: corepack enable
      - uses: actions/setup-node@v3
        with:
          node-version: 18
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
