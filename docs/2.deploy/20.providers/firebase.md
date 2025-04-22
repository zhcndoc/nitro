# Firebase

> 将 Nitro 应用部署到 Firebase。

::note
您需要订阅 [**Blaze 计划**](https://firebase.google.com/pricing)（按需付费）才能开始。
::

## Firebase 应用托管

预设: `firebase_app_hosting`

:read-more{title="Firebase 应用托管" to="https://firebase.google.com/docs/app-hosting"}

::tip
您可以使用 [零配置](/deploy/#zero-config-providers) 与此提供者集成。
::

### 项目设置

1. 前往 Firebase [控制台](https://console.firebase.google.com/) 并设置一个新项目。
2. 从侧边栏选择 **构建 > 应用托管**。
    - 在此步骤中，您可能需要升级您的账单计划。
3. 点击 **开始使用**。
    - 选择一个区域。
    - 导入一个 GitHub 仓库（您需要链接您的 GitHub 账户）。
    - 配置部署设置（项目根目录和分支），并启用自动发布。
    - 为您的后端选择一个唯一的 ID。
4. 点击完成并部署以创建您的首次发布。

当您使用 Firebase 应用托管进行部署时，应用托管预设将在构建时自动运行。