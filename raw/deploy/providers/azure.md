# Azure

> 将 Nitro 应用部署到 Azure 静态 Web 应用或 Functions。

## Azure 静态 Web 应用

**预设:** `azure-swa`

<read-more title="Azure 静态 Web 应用" to="https://azure.microsoft.com/en-us/products/app-service/static">



</read-more>

<note>

与此提供程序的集成可以通过 [零配置](/deploy/#zero-config-providers) 实现。

</note>

[Azure 静态 Web 应用](https://azure.microsoft.com/en-us/products/app-service/static) 旨在在 [GitHub Actions 工作流](https://docs.microsoft.com/en-us/azure/static-web-apps/github-actions-workflow) 中进行持续部署。默认情况下，Nitro 将检测此部署环境并启用 `azure` 预设。

### 本地预览

如果您想要进行本地测试，请安装 [Azure Functions Core Tools](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local)。

您可以调用开发环境以在部署之前进行预览。

```bash
NITRO_PRESET=azure npx nypm@latest build
npx @azure/static-web-apps-cli start .output/public --api-location .output/server
```

### 配置

Azure 静态 Web 应用使用 `staticwebapp.config.json` 文件进行 [配置](https://learn.microsoft.com/en-us/azure/static-web-apps/configuration)。

Nitro 每当使用 `azure` 预设构建应用时，会自动生成此配置文件。

Nitro 将根据以下标准自动添加以下属性：

<table>
<thead>
  <tr>
    <th>
      属性
    </th>
    
    <th>
      标准
    </th>
    
    <th>
      默认值
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <strong>
        <a href="https://learn.microsoft.com/en-us/azure/static-web-apps/configuration#platform" rel="nofollow">
          platform.apiRuntime
        </a>
      </strong>
    </td>
    
    <td>
      将根据您的包配置自动设置为 <code>
        node:16
      </code>
      
       或 <code>
        node:14
      </code>
      
      。
    </td>
    
    <td>
      <code>
        node:16
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <strong>
        <a href="https://learn.microsoft.com/en-us/azure/static-web-apps/configuration#fallback-routes" rel="nofollow">
          navigationFallback.rewrite
        </a>
      </strong>
    </td>
    
    <td>
      始终为 <code>
        /api/server
      </code>
    </td>
    
    <td>
      <code>
        /api/server
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <strong>
        <a href="https://learn.microsoft.com/en-us/azure/static-web-apps/configuration#routes" rel="nofollow">
          routes
        </a>
      </strong>
    </td>
    
    <td>
      所有预渲染路由将被添加。此外，如果您没有 <code>
        index.html
      </code>
      
       文件，将为兼容性目的创建一个空的，并且对 <code>
        /index.html
      </code>
      
       的请求将重定向到根目录，由 <code>
        /api/server
      </code>
      
       处理。
    </td>
    
    <td>
      <code>
        []
      </code>
    </td>
  </tr>
</tbody>
</table>

### 自定义配置

您可以使用 `azure.config` 选项修改 Nitro 生成的配置。

自定义路由将首先被添加和匹配。在发生冲突的情况下（如果对象具有相同的路由属性），自定义路由将覆盖生成的路由。

### 通过 GitHub actions 从 CI/CD 部署

当您将 GitHub 仓库链接到 Azure 静态 Web 应用时，将向仓库添加一个工作流文件。

当系统要求您选择框架时，选择自定义并提供以下信息：

<table>
<thead>
  <tr>
    <th>
      输入
    </th>
    
    <th>
      值
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <strong>
        app_location
      </strong>
    </td>
    
    <td>
      '/'
    </td>
  </tr>
  
  <tr>
    <td>
      <strong>
        api_location
      </strong>
    </td>
    
    <td>
      '.output/server'
    </td>
  </tr>
  
  <tr>
    <td>
      <strong>
        output_location
      </strong>
    </td>
    
    <td>
      '.output/public'
    </td>
  </tr>
</tbody>
</table>

如果您错过了此步骤，您可以随时在工作流中找到构建配置部分并更新构建配置：

```yaml [.github/workflows/azure-static-web-apps-<RANDOM_NAME>.yml]
###### 仓库/构建配置 ######
app_location: '/'
api_location: '.output/server'
output_location: '.output/public'
###### 仓库/构建配置结束 ######
```

就是这样！现在，Azure 静态 Web 应用将在推送时自动部署您的 Nitro 驱动应用。

如果您使用 runtimeConfig，您可能希望在 Azure 上配置相应的 [环境变量](https://docs.microsoft.com/en-us/azure/static-web-apps/application-settings)。
