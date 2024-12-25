# Zerops

> 将 Nitro 应用部署到 [Zerops](https://zerops.io)。

**预设:** `zerops`

:read-more{title="zerops.io" to="https://zerops.io"}

> [!重要]
> 🚧 此预设目前处于实验阶段。

Zerops 支持通过项目根目录中的简单配置文件部署静态和服务器端渲染的应用。

## 启动模板

如果您想快速开始使用 Zerops 和 Nitro，可以使用 [`zeropsio/recipe-nitro-nodejs`](https://github.com/zeropsio/recipe-nitro-nodejs) 和 [`zeropsio/recipe-nitro-static`](https://github.com/zeropsio/recipe-nitro-static) 启动模板。

## 项目设置

项目和服务可以通过 [项目添加向导](https://app.zerops.io/dashboard/project-add) 添加，或使用 `zerops-project-import.yml` 导入。

::code-group
```yml [zerops-project-import.yml (node.js)]
project:
  name: nitro-app

services:
  - hostname: app type: nodejs@20
```

```yml [zerops-project-import.yml (static)]
project:
  name: nitro-app

services:
  - hostname: app
    type: static
```

::

然后在项目根目录中创建一个 `zerops.yml` 配置文件：

::code-group
```yml [zerops.yml (node.js)]
zerops:
  - setup: app build:
      base: nodejs@20
      envVariables:
        SERVER_PRESET: zerops
      buildCommands:
        - pnpm i
        - pnpm run build deployFiles:
        - .output
        - package.json - node_modules
    run:
      base: nodejs@20 ports:
        - port: 3000
          httpSupport: true
      start: node .output/server/index.mjs
```

```yml [zerops.yml (static)]
zerops:
  - setup: app
    build:
      base: nodejs@20 envVariables:
        SERVER_PRESET: zerops-static
      buildCommands:
        - pnpm i
        - pnpm build
      deployFiles:
        - .zerops/output/static/~
    run:
      base: static
```

::

现在您可以使用 Zerops CLI 触发 [构建和部署管道](#building-deploying-your-app)，或通过在服务详细信息中将应用服务与您的 [GitHub](https://docs.zerops.io/references/github-integration/) / [GitLab](https://docs.zerops.io/references/gitlab-integration) 存储库连接。

## 构建和部署

在 Zerops 应用中打开 [设置 > 访问令牌管理](https://app.zerops.io/settings/token-management) 并生成一个新的访问令牌。

使用以下命令通过您的访问令牌登录：

:pm-x{command="@zerops/zcli login <token>"}

导航到您的应用根目录（`zerops.yml` 所在的位置），并运行以下命令以触发部署：

:pm-x{command="@zerops/zcli push"}

通过将服务与您的 [GitHub](https://docs.zerops.io/references/gitlab-integration) / [GitLab](https://docs.zerops.io/references/gitlab-integration) 存储库连接，您的代码可以在每次提交或新标签时自动部署。此连接可以在服务详细信息中设置。

:read-more{title="Zerops 文档" to="https://docs.zerops.io/"}