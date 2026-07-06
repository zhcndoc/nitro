# Zerops

> 将 Nitro 应用部署到 [Zerops](https://zerops.io)。

**预设：** `zerops`

:read-more{title="Zerops.io" to="https://zerops.io"}

Zerops 支持通过位于项目根目录中的简单配置文件来部署静态和服务端渲染应用。

## 项目设置

项目和服务可以通过 [Zerops 控制台](https://app.zerops.io) 点击 **Import a project** 来添加，或者使用 `zerops-project-import.yaml` 导入。

::code-group

```yml [zerops-project-import.yaml (node.js)]
project:
  name: nitro-app

services:
  - hostname: app
    type: nodejs@22
    enableSubdomainAccess: true
```

```yml [zerops-project-import.yaml (static)]
project:
  name: nitro-app

services:
  - hostname: app
    type: static
    enableSubdomainAccess: true
```

::

然后在项目根目录下创建一个 `zerops.yaml` 配置：

::code-group

```yml [zerops.yaml (node.js)]
zerops:
  - setup: app
    build:
      base: nodejs@22
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
      base: nodejs@22
      ports:
        - port: 3000
          httpSupport: true
      start: node .output/server/index.mjs
```

```yml [zerops.yaml (static)]
zerops:
  - setup: app
    build:
      base: nodejs@22
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

## 构建和部署

在 Zerops 应用中打开[设置 > 访问令牌管理](https://app.zerops.io/settings/token-management)并生成一个新的访问令牌。

使用以下命令和访问令牌登录：

:pm-x{command="@zerops/zcli login <token>"}

导航到你应用的根目录（即 `zerops.yaml` 所在位置），并运行以下命令以触发部署：

:pm-x{command="@zerops/zcli push"}

通过将服务连接到你的 [GitHub](https://docs.zerops.io/references/github-integration/) / [GitLab](https://docs.zerops.io/references/gitlab-integration) 仓库，你的代码可以在每次提交或新标签时自动部署。此连接可以在服务详情中进行设置。


