# Render.com

> 将 Nitro 应用部署到 Render.com。

**预设:** `render_com`

:read-more{title="render.com" to="https://render.com"}

## 设置应用程序

1. [创建一个新的 Web 服务](https://dashboard.render.com/select-repo?type=web) 并选择包含您代码的仓库。
2. 确保选中 'Node' 环境。
3. 将启动命令更新为 `node .output/server/index.mjs`
4. 点击 '高级'，并添加一个环境变量 `NITRO_PRESET`，值设为 `render_com`。您可能还需要添加一个 `NODE_VERSION` 环境变量，值设为 `18`，以确保构建成功 ([文档](https://render.com/docs/node-version))。
5. 点击 '创建 Web 服务'。

## 基础设施即代码 (IaC)

1. 在您的仓库根目录下创建一个名为 `render.yaml` 的文件，内容如下。

> 此文件遵循 [基础设施即代码](https://render.com/docs/infrastructure-as-code) 在 Render 上的规范

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

1. [创建一个新的 Blueprint 实例](https://dashboard.render.com/select-repo?type=blueprint) 并选择包含您的 `render.yaml` 文件的仓库。

您现在可以开始了！
