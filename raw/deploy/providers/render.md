# Render.com

> 部署 Nitro 应用到 Render.com。

**预设:** `render_com`

<read-more title="render.com" to="https://render.com">



</read-more>

## 设置应用

<steps level="4">

#### [创建一个新的 Web 服务](https://dashboard.render.com/select-repo?type=web)并选择包含您代码的存储库。

#### 确保选择了 'Node' 环境。

#### 将启动命令更新为 `node .output/server/index.mjs`

#### 点击 '高级' 并添加一个环境变量，`NITRO_PRESET` 设置为 `render_com`。您可能还需要添加一个 `NODE_VERSION` 环境变量，设置为 `18` 以确保构建成功（[文档](https://render.com/docs/node-version)）。

#### 点击 '创建 Web 服务'。

</steps>

## 基础设施即代码 (IaC)

1. 在您存储库的根目录下创建一个名为 `render.yaml` 的文件，内容如下。

> 此文件遵循 Render 上的 [基础设施即代码](https://render.com/docs/infrastructure-as-code) 规范

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

1. [创建一个新的 Blueprint 实例](https://dashboard.render.com/select-repo?type=blueprint)并选择包含您的 `render.yaml` 文件的存储库。

您已经准备好开始了！
