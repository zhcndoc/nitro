# Genezio

> 将 Nitro 应用部署到 Genezio。

**预设:** `genezio`

:read-more{title="Genezio" to="https://genezio.com"}

> [!重要]
> 🚧 此预设目前处于实验阶段。

## 1. 项目设置

创建 `genezio.yaml` 文件：

```yaml
# 项目的名称。
name: nitro-app
# 要解析的 Genezio YAML 配置的版本。
yamlVersion: 2
backend:
  # 后端的根目录。
  path: .output/
  # 有关后端编程语言的信息。
  language:
      # 编程语言的名称。
      name: js
      # 后端使用的包管理器。
      packageManager: npm
  # 有关后端函数的信息。
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

::read-more{to="https://genezio.com/docs/project-structure/genezio-configuration-file/"}
要进一步根据您的需求自定义文件，您可以查看
[官方文档](https://genezio.com/docs/project-structure/genezio-configuration-file/)。
::

## 2. 部署您的项目

使用 genezio nitro 预设进行构建：

```bash
NITRO_PRESET=genezio npm run build
```

使用 [`genezio`](https://npmjs.com/package/genezio) CLI 部署：

:pm-x{command="genezio deploy"}

::read-more{title="后端环境变量" to="https://genezio.com/docs/project-structure/backend-environment-variables"}
要设置环境变量，请查看 [Genezio - 环境变量](https://genezio.com/docs/project-structure/backend-environment-variables)。
::

## 3. 监控您的项目
您可以通过 [Genezio 应用仪表板](https://app.genez.io/dashboard) 来监控和管理您的应用程序。仪表板 URL 在部署后也会提供，允许您访问项目状态和日志的综合视图。