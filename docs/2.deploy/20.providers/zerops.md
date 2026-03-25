# Zerops

> 将 Nitro 应用部署到 [Zerops](https://zerops.io)。

**预设：** `zerops`

:read-more{title="Zerops.io" to="https://zerops.io"}

> [!IMPORTANT]
> 🚧 此预设目前处于实验阶段。

Zerops 支持通过项目根目录中的一个简单配置文件来部署静态应用和服务器端渲染应用。

## 入门模板

如果你想快速入门 Zerops 和 Nitro，可以使用 [`zeropsio/recipe-nitro-nodejs`](https://github.com/zeropsio/recipe-nitro-nodejs) 和 [`zeropsio/recipe-nitro-static`](https://github.com/zeropsio/recipe-nitro-static) 这两个 starter 模板仓库。

## 项目设置

项目和服务可以通过[项目添加向导](https://app.zerops.io/dashboard/project-add)添加，或者使用 `zerops-project-import.yml` 导入。

::code-group
```yml [zerops-project-import.yml (node.js)]
project:
  name: nitro-app

services:
  - hostname: app
    type: nodejs@20
```
```yml [zerops-project-import.yml (static)]
project:
  name: nitro-app

services:
  - hostname: app
    type: static
```
::

然后在你的项目根目录中创建一个 `zerops.yml` 配置文件：

::code-group
```yml [zerops.yml (node.js)]
zerops:
  - setup: app
    build:
      base: nodejs@20
      envVariables:
        NITRO_PRESET: zerops
      buildCommands:
        - pnpm i
        - pnpm run build
      deployFiles:
        - .output
        - package.json
        - node_modules
    run:
      base: nodejs@20
      ports:
        - port: 3000
          httpSupport: true
      start: node .output/server/index.mjs
```
```yml [zerops.yml (static)]
zerops:
  - setup: app
    build:
      base: nodejs@20
      envVariables:
        NITRO_PRESET: zerops-static
      buildCommands:
        - pnpm i
        - pnpm build
      deployFiles:
        - .zerops/output/static/~
    run:
      base: static
```
::

现在你可以通过[使用 Zerops CLI 构建和部署流水线](#building-deploying-your-app)来触发部署，或者通过在服务详情中连接你的 [GitHub](https://docs.zerops.io/references/github-integration/) / [GitLab](https://docs.zerops.io/references/gitlab-integration) 仓库来部署。


## 构建与部署

在 Zerops 应用中打开[设置 > 访问令牌管理](https://app.zerops.io/settings/token-management)并生成一个新的访问令牌。

使用以下命令和访问令牌登录：

:pm-x{command="@zerops/zcli login <token>"}

导航到你的应用根目录（即 `zerops.yml` 所在的位置）并运行以下命令来触发部署：

:pm-x{command="@zerops/zcli push"}

你可以通过将该服务与你的 [GitHub](https://docs.zerops.io/references/gitlab-integration) / [GitLab](https://docs.zerops.io/references/gitlab-integration) 仓库连接，从而在每次提交或创建新标签时自动部署代码。这种连接可以在服务详情中进行设置。


:read-more{title="Zerops 文档" to="https://docs.zerops.io/"}
