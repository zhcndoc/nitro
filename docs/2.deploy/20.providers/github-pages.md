# GitHub Pages

> 将 Nitro 应用部署到 GitHub Pages。

**预设:** `github_pages`

:read-more{title="GitHub Pages" to="https://pages.github.com/"}

## 设置

按照步骤 [创建一个 GitHub Pages 网站](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)。

## 部署

以下是一个示例 GitHub Actions 工作流，用于使用 `github_pages` 预设将您的网站部署到 GitHub Pages：

```yaml [.github/workflows/deploy.yml]
# https://github.com/actions/deploy-pages#usage
name: 部署到 GitHub Pages

on:
  workflow_dispatch:
  push:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: corepack enable
      - uses: actions/setup-node@v3
        with:
          node-version: "18"

      - run: npx nypm install
      - run: npm run build
        env:
          NITRO_PRESET: github_pages

      - name: 上传工件
        uses: actions/upload-pages-artifact@v1
        with:
          path: ./.output/public

  # 部署作业
  deploy:
    # 添加对构建作业的依赖
    needs: build

    # 授予 GITHUB_TOKEN 进行页面部署所需的权限
    permissions:
      pages: write      # 以便部署到 Pages
      id-token: write   # 以验证部署源自合适来源

    # 部署到 github_pages 环境
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}

    # 指定运行器 + 部署步骤
    runs-on: ubuntu-latest
    steps:
      - name: 部署到 GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v1
```