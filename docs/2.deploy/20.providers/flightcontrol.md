# Flightcontrol

> 通过 Flightcontrol 将 Nitro 应用程序部署到 AWS。

**预设:** `flightcontrol`

:read-more{title="flightcontrol.dev" to="https://flightcontrol.dev?ref=nitro"}

::note
Flightcontrol 对 [Nuxt](https://nuxt.zhcndoc.com/) 项目提供零配置支持。
::

## 设置你的 Flightcontrol 账户

总体来说，你第一次部署项目需要遵循的步骤如下：

1. 在 [Flightcontrol](https://app.flightcontrol.dev/signup?ref=nitro) 创建一个账户
2. 在 [AWS](https://portal.aws.amazon.com/billing/signup) 创建一个账户（如果你还没有的话）
3. 将你的 AWS 账户链接到 Flightcontrol
4. 授权 Flightcontrol GitHub 应用访问你选择的公共或私有仓库。
5. 通过仪表板或 `flightcontrol.json` 配置创建一个 Flightcontrol 项目。

### 通过仪表板创建带配置的项目

1. 从仪表板创建一个 Flightcontrol 项目。选择一个作为源的仓库。
2. 选择 `GUI` 配置类型。
3. 选择 Nuxt 预设。此预设同样适用于任何基于 Nitro 的应用程序。
4. 选择你偏好的 AWS 服务器大小。
5. 提交新项目表单。

### 通过 `flightcontrol.json` 创建带配置的项目

1. 从你的仪表板创建一个 Flightcontrol 项目。选择一个作为源的仓库。
2. 选择 `flightcontrol.json` 配置类型。
3. 在你的仓库根目录添加一个名为 `flightcontrol.json` 的新文件。以下是一个示例配置，它为你的应用创建一个 AWS fargate 服务：

  ```json [flightcontrol.json]
  {
    "$schema": "https://app.flightcontrol.dev/schema.json",
    "environments": [
      {
        "id": "production",
        "name": "生产环境",
        "region": "us-west-2",
        "source": {
          "branch": "main"
        },
        "services": [
          {
            "id": "nitro",
            "buildType": "nixpacks",
            "name": "我的 Nitro 网站",
            "type": "fargate",
            "domain": "www.yourdomain.com",
            "outputDirectory": ".output",
            "startCommand": "node .output/server/index.mjs",
            "cpu": 0.25,
            "memory": 0.5
          }
        ]
      }
    ]
  }
  ```

4. 提交新项目表单。

::read-more{to="https://www.flightcontrol.dev/docs?ref=nitro"}
了解更多关于 Flightcontrol 的 [配置](https://www.flightcontrol.dev/docs?ref=nitro) 信息。
::