# Deno Deploy

> 将 Nitro 应用部署到 Deno Deploy。

**预设：** `deno_deploy`

<read-more to="https://deno.zhcndoc.com/deploy" title="Deno Deploy">



</read-more>

## 使用 CLI 部署

您可以使用 [deployctl](https://deno.zhcndoc.com/deploy/docs/deployctl) 来部署您的应用。

登录到 [Deno Deploy](https://dash.deno.com/account#access-tokens) 获取 `DENO_DEPLOY_TOKEN` 访问令牌，并将其设置为环境变量。

```bash
# 使用 deno_deploy NITRO 预设构建
NITRO_PRESET=deno_deploy npm run build

# 确保从输出目录运行 deployctl 命令
cd .output
deployctl deploy --project=my-project server/index.ts
```

## 通过 CI/CD 使用 GitHub Actions 部署

您只需将 deployctl GitHub Action 作为工作流中的一个步骤包括即可。

您不需要为此设置任何密钥。您需要将您的 GitHub 仓库链接到您的 Deno Deploy 项目，并选择 "GitHub Actions" 部署模式。您可以在 [Deno Deploy](https://dash.deno.com) 的项目设置中完成此操作。

在您的 `.github/workflows` 目录中创建如下工作流文件：

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
      - uses: actions/checkout@v5
      - run: corepack enable
      - uses: actions/setup-node@v6
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

<read-more to="/deploy/runtimes/deno">



</read-more>
