# Firebase

> 将 Nitro 应用部署到 Firebase。

<note>

你需要订阅 [**Blaze 计费方案**](https://firebase.google.com/pricing)（即用即付）才能开始使用。

</note>

## Firebase App Hosting

预设：`firebase_app_hosting`

<read-more title="Firebase 应用托管" to="https://firebase.google.com/docs/app-hosting">



</read-more>

<tip>

你可以使用[零配置](/deploy/#zero-config-providers)与此提供商集成。

</tip>

### 项目设置

<steps level="4">

#### 前往 Firebase [控制台](https://console.firebase.google.com/)并创建一个新项目。

#### 从侧边栏选择**构建 > 应用托管**。
- 在这一步你可能需要升级你的计费方案。



#### 点击**开始使用**。
- 选择一个区域。
- 导入一个 GitHub 仓库（你需要关联你的 GitHub 账户）。
- 配置部署设置（项目根目录和分支），并启用自动发布。
- 为你的后端选择一个唯一 ID。



#### 点击**完成并部署**以创建你的首次发布。

</steps>

当你使用 Firebase App Hosting 部署时，App Hosting 预设将在构建时自动运行。
