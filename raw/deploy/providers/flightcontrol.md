# Flightcontrol

> 通过 Flightcontrol 将 Nitro 应用部署到 AWS。

**预设：** `flightcontrol`

<read-more to="https://flightcontrol.dev?ref=nitro" title="flightcontrol.dev">



</read-more>

## 设置你的 Flightcontrol 账户

从高层次来看，首次部署项目需要遵循以下步骤：

<steps level="4">

#### 在 [Flightcontrol](https://app.flightcontrol.dev/signup?ref=nitro) 创建一个账户

#### 在 [AWS](https://portal.aws.amazon.com/billing/signup) 创建一个账户（如果你还没有的话）

#### 将你的 AWS 账户关联到 Flightcontrol

#### 授权 Flightcontrol GitHub App 访问你选择的仓库，无论公开或私有。

#### 通过 Dashboard 或通过 `flightcontrol.json` 创建 Flightcontrol 项目。

</steps>

### 通过 Dashboard 创建项目

<steps level="4">

#### 从 Dashboard 创建一个 Flightcontrol 项目。为源码选择一个仓库。

#### 选择 `GUI` 配置类型。

#### 选择 Nuxt 预设。该预设也适用于任何基于 Nitro 的应用。

#### 选择你偏好的 AWS 服务器规格。

#### 提交新项目的表单。

</steps>

### 通过 `flightcontrol.json` 创建项目

<steps level="4">

#### 从你的 Dashboard 创建一个 Flightcontrol 项目。为源码选择一个仓库。

#### 选择 `flightcontrol.json` 配置类型。

#### 在仓库根目录添加一个名为 `flightcontrol.json` 的新文件。以下是一个为你的应用创建 AWS Fargate 服务的示例配置：

</steps>

```json [flightcontrol.json]
{
  "$schema": "https://app.flightcontrol.dev/schema.json",
  "environments": [
    {
      "id": "production",
      "name": "Production",
      "region": "us-west-2",
      "source": {
        "branch": "main"
      },
      "services": [
        {
          "id": "nitro",
          "buildType": "nixpacks",
          "name": "My Nitro site",
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

1. 提交新项目的表单。

<read-more to="https://www.flightcontrol.dev/docs?ref=nitro">

了解更多关于 Flightcontrol 的 [配置](https://www.flightcontrol.dev/docs?ref=nitro)。

</read-more>
