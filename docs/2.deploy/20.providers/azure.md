# Azure

> 将 Nitro 应用部署到 Azure Static Web Apps。

## Azure Static Web Apps

**预设：** `azure_swa`

:read-more{title="Azure Static Web Apps" to="https://azure.microsoft.com/en-us/products/app-service/static"}

::note
与此提供商的集成可以通过[零配置](/deploy#zero-config-providers)实现。
::

[Azure Static Web Apps](https://azure.microsoft.com/en-us/products/app-service/static) 专为在 [GitHub Actions 工作流](https://docs.microsoft.com/en-us/azure/static-web-apps/github-actions-workflow)中持续部署而设计。Nitro 会检测此部署环境，并自动启用 `azure_swa` 预设。

### 本地预览

要在本地进行测试，请安装 [Azure Functions Core Tools](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local)，然后构建并启动本地预览环境：

```bash
NITRO_PRESET=azure_swa npm run build
npx @azure/static-web-apps-cli start .output/public --api-location .output/server
```

### 配置

Azure Static Web Apps 使用 `staticwebapp.config.json` 文件进行[配置](https://learn.microsoft.com/en-us/azure/static-web-apps/configuration)。

每当使用 `azure_swa` 预设构建应用程序时，Nitro 都会自动生成此配置文件。

Nitro 会自动设置以下属性：

| 属性 | 条件 | 默认值 |
| --- | --- | --- |
| **[platform.apiRuntime](https://learn.microsoft.com/en-us/azure/static-web-apps/configuration#platform)** | 根据 `package.json` 中的 `engines.node` 字段设置为 `node:20` 或 `node:22`。 | `node:20` |
| **[navigationFallback.rewrite](https://learn.microsoft.com/en-us/azure/static-web-apps/configuration#fallback-routes)** | 始终为 `/api/server` | `/api/server` |
| **[routes](https://learn.microsoft.com/en-us/azure/static-web-apps/configuration#routes)** | 添加所有预渲染路由。此外，如果没有 `index.html` 文件，则会创建一个空文件以实现兼容，并将对 `/index.html` 的请求重定向到根目录（由 `/api/server` 处理）。 | `[]` |

### 自定义配置

你可以使用 `azure.config` 选项修改 Nitro 生成的配置。

自定义路由会首先添加和匹配。如果发生冲突（两个对象具有相同的 route 属性），自定义路由会覆盖生成的路由。

### 通过 GitHub Actions 从 CI/CD 部署

当你将 GitHub 仓库链接到 Azure Static Web Apps 时，仓库中会添加一个工作流文件。

当你被要求选择框架时，选择 custom 并提供以下信息：

| 输入 | 值 |
| --- | --- |
| **app_location** | '/' |
| **api_location** | '.output/server' |
| **output_location** | '.output/public' |

如果你错过了此步骤，你可以在工作流中找到构建配置部分并更新构建配置：

```yaml [.github/workflows/azure-static-web-apps-<RANDOM_NAME>.yml]
###### 仓库/构建配置 ######
app_location: '/'
api_location: '.output/server'
output_location: '.output/public'
###### 仓库/构建配置结束 ######
```

就是这样！现在 Azure Static Web Apps 将在推送时自动部署你的 Nitro 驱动应用。

如果你使用 `runtimeConfig`，可能需要在 [Azure 上配置相应的环境变量](https://docs.microsoft.com/en-us/azure/static-web-apps/application-settings)。

