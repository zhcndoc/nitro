# Render.com

> 将 Nitro 应用部署到 Render.com。

**预设：** `render_com`

<read-more title="render.com" to="https://render.com">



</read-more>

## 设置应用

<steps level="4">

#### [创建新的 Web 服务](https://dashboard.render.com/select-repo?type=web) 并选择包含您代码的仓库。

#### 确保已选择 'Node' 环境。

#### 将启动命令更新为 `node .output/server/index.mjs`

#### 点击 'Advanced' 并添加一个环境变量，将 `NITRO_PRESET` 设置为 `render_com`。您可能还需要添加一个 `NODE_VERSION` 环境变量，设置为 `20` 以确保构建成功 ([文档](https://render.com/docs/node-version))。

#### 点击 'Create Web Service'。

</steps>

## 基础设施即代码 (IaC)

1. 在仓库根目录创建一个名为 `render.yaml` 的文件，内容如下：

> 此文件遵循 Render 上的 [Infrastructure as Code](https://render.com/docs/infrastructure-as-code)

```yaml
services:
  - type: web
    name: <PROJECTNAME>
    env: node
    branch: main
    startCommand: node .output/server/index.mjs
    buildCommand: npx nypm install && npm run build
    envVars:
    - key: NITRO_PRESET
      value: render_com
```

1. [创建新的 Blueprint 实例](https://dashboard.render.com/select-repo?type=blueprint) 并选择包含 `render.yaml` 文件的仓库。

您应该就可以开始了！
