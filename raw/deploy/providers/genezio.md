# Genezio

> 将 Nitro 应用部署到 Genezio。

**预设：** `genezio`

<read-more to="https://genezio.com" title="Genezio">



</read-more>

<important>

🚧 此预设目前处于实验阶段。

</important>

## 1. 项目设置

创建 `genezio.yaml` 文件：

```yaml
# 项目的名称。
name: nitro-app
# 要解析的 Genezio YAML 配置版本。
yamlVersion: 2
backend:
  # 后端的根目录。
  path: .output/
  # 后端编程语言的信息。
  language:
      # 编程语言的名称。
      name: js
      # 后端使用的包管理器。
      packageManager: npm
  # 后端函数的信息。
  functions:
      # 函数的名称（标签）。
      - name: nitroServer
      # 函数代码的路径。
        path: server/
        # 函数处理程序的名称
        handler: handler
        # 函数的入口点。
        entry: index.mjs
```

<read-more to="https://genezio.com/docs/project-structure/genezio-configuration-file/">

如需根据您的需求进一步自定义该文件，您可以查阅
[官方文档](https://genezio.com/docs/project-structure/genezio-configuration-file/)。

</read-more>

## 2. 部署您的项目

使用 genezio nitro 预设进行构建：

```bash
NITRO_PRESET=genezio npm run build
```

使用 [`genezio`](https://npmjs.com/package/genezio) CLI 进行部署：

<pm-x command="genezio deploy">



</pm-x>

<read-more to="https://genezio.com/docs/project-structure/backend-environment-variables" title="后端环境变量">

要设置环境变量，请查看 [Genezio - 环境变量](https://genezio.com/docs/project-structure/backend-environment-variables)。

</read-more>

## 3. 监控您的项目

您可以通过 [Genezio 应用仪表板](https://app.genez.io/dashboard) 监控和管理您的应用程序。仪表板 URL 也会在部署后提供，让您可以全面查看项目的状态和日志。
