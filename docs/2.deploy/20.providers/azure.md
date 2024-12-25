# Azure

> 将 Nitro 应用部署到 Azure 静态 Web 应用或函数。

## Azure 静态 Web 应用

**预设:** `azure`

:read-more{title="Azure 静态 Web 应用" to="https://azure.microsoft.com/en-us/products/app-service/static"}

::note
与此提供者的集成可以实现 [零配置](/deploy/#zero-config-providers)。
::

[Azure 静态 Web 应用](https://azure.microsoft.com/en-us/products/app-service/static) 旨在通过 [GitHub Actions 工作流程](https://docs.microsoft.com/en-us/azure/static-web-apps/github-actions-workflow) 持续部署。默认情况下，Nitro 将检测此部署环境并启用 `azure` 预设。

### 本地预览

如果您想进行本地测试，请安装 [Azure Functions Core Tools](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local)。

您可以调用开发环境以预览部署前的效果。

```bash
NITRO_PRESET=azure npx nypm@latest build
npx @azure/static-web-apps-cli start .output/public --api-location .output/server
```

### 配置

Azure 静态 Web 应用通过 `staticwebapp.config.json` 文件进行 [配置](https://learn.microsoft.com/en-us/azure/static-web-apps/configuration)。

Nitro 会在使用 `azure` 预设构建应用程序时自动生成此配置文件。

Nitro 将根据以下标准自动添加以下属性：
| 属性 | 标准 | 默认值 |
| --- | --- | --- |
| **[platform.apiRuntime](https://learn.microsoft.com/en-us/azure/static-web-apps/configuration#platform)** | 将根据您的包配置自动设置为 `node:16` 或 `node:14`。 | `node:16` |
| **[navigationFallback.rewrite](https://learn.microsoft.com/en-us/azure/static-web-apps/configuration#fallback-routes)** | 始终为 `/api/server` | `/api/server` |
| **[routes](https://learn.microsoft.com/en-us/azure/static-web-apps/configuration#routes)** | 所有预渲染的路由会被添加。此外，如果您没有 `index.html` 文件，会为您创建一个空的兼容文件，并且对 `/index.html` 的请求会重定向到根目录，由 `/api/server` 处理。 | `[]` |

### 自定义配置

您可以使用 `azure.config` 选项更改 Nitro 生成的配置。

自定义路由将首先被添加和匹配。如果发生冲突（通过对象的路由属性是否相同来确定），自定义路由将覆盖生成的路由。

### 通过 GitHub actions 从 CI/CD 部署

当您将 GitHub 仓库链接到 Azure 静态 Web 应用时，将在仓库中添加一个工作流程文件。

当要求您选择框架时，选择自定义并提供以下信息：

| 输入 | 值 |
| --- | --- |
| **app_location** | '/' |
| **api_location** | '.output/server' |
| **output_location** | '.output/public' |

如果您错过了这一步，您可以在工作流程中的构建配置部分查找并更新构建配置：

```yaml [.github/workflows/azure-static-web-apps-<RANDOM_NAME>.yml]
###### 仓库/构建配置 ######
app_location: '/'
api_location: '.output/server'
output_location: '.output/public'
###### 仓库/构建配置结束 ######
```

就是这样！现在 Azure 静态 Web 应用将在推送时自动部署您的 Nitro 动力应用。

如果您使用了 runtimeConfig，您可能希望在 Azure 上配置相应的 [环境变量](https://docs.microsoft.com/en-us/azure/static-web-apps/application-settings)。

## Azure 函数

**预设:** `azure_functions`

::important
如果您遇到任何问题，请确保您使用 Node.js 16+ 运行时。您可以在 Azure 文档中找到 [如何设置 Node 版本](https://docs.microsoft.com/en-us/azure/azure-functions/functions-reference-node?tabs=v2#setting-the-node-version) 的更多信息。
有关常见问题，请参见 [nitrojs/nitro#2114](https://github.com/nitrojs/nitro/issues/2114)。
::

### 本地预览

如果您想进行本地测试，请安装 [Azure Functions Core Tools](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local)。

您可以从无服务器目录调用开发环境。

```bash
NITRO_PRESET=azure_functions npx nypm@latest build
cd .output
func start
```

现在您可以在浏览器中访问 `http://localhost:7071/` 并浏览您在 Azure Functions 上本地运行的网站。

### 从本地计算机部署

要进行部署，只需运行以下命令：

```bash
# 发布打包的 zip 文件
az functionapp deployment source config-zip -g <resource-group> -n <app-name> --src dist/deploy.zip
# 或者您可以从源发布
cd dist && func azure functionapp publish --javascript <app-name>
```

### 通过 GitHub actions 从 CI/CD 部署

首先，获取您的 Azure Functions 发布配置文件，并将其添加为您 GitHub 仓库设置中的秘密，按照 [这些说明](https://github.com/Azure/functions-action#using-publish-profile-as-deployment-credential-recommended)。

然后创建以下文件作为工作流程：

```yaml [.github/workflows/azure.yml]
name: azure
on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main
jobs:
  deploy:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ ubuntu-latest ]
        node: [ 14 ]
    steps:
      - uses: actions/setup-node@v2
        with:
          node-version: ${{ matrix.node }}

      - name: Checkout
        uses: actions/checkout@master

      - name: 获取 yarn 缓存目录路径
        id: yarn-cache-dir-path
        run: echo "::set-output name=dir::$(yarn cache dir)"

      - uses: actions/cache@v2
        id: yarn-cache
        with:
          path: ${{ steps.yarn-cache-dir-path.outputs.dir }}
          key: ${{ runner.os }}-yarn-${{ hashFiles('**/yarn.lock') }}
          restore-keys: |
            ${{ runner.os }}-yarn-azure

      - name: 安装依赖
        if: steps.cache.outputs.cache-hit != 'true'
        run: yarn

      - name: 构建
        run: npm run build
        env:
          NITRO_PRESET: azure_functions

      - name: '部署到 Azure Functions'
        uses: Azure/functions-action@v1
        with:
          app-name: <your-app-name>
          package: .output/deploy.zip
          publish-profile: ${{ secrets.AZURE_FUNCTIONAPP_PUBLISH_PROFILE }}
```

### 优化 Azure 函数

考虑 [开启不可变包](https://docs.microsoft.com/en-us/azure/app-service/deploy-run-package) 以支持从 zip 文件运行您的应用。这可以加速冷启动。
