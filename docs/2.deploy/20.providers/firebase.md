# Firebase

> 将 Nitro 应用部署到 Firebase。

::note
你需要订阅 [**Blaze 计费方案**](https://firebase.google.com/pricing)（即用即付）才能开始使用。
::

## Firebase App Hosting

**预设：** `firebase_app_hosting`

:read-more{title="Firebase 应用托管" to="https://firebase.google.com/docs/app-hosting"}

::tip
你可以使用[零配置](/deploy#zero-config-providers)将此提供程序集成到项目中。
::

### 项目设置

1. 前往 Firebase [控制台](https://console.firebase.google.com/)并设置一个新项目。
2. 在侧边栏中选择 **构建 > App Hosting**。
    - 你可能需要在此步骤升级计费方案。
3. 点击**开始使用**。
    - 选择一个区域。
    - 导入 GitHub 仓库（你需要关联 GitHub 账户）。
    - 配置部署设置（项目根目录和分支），并启用自动发布。
    - 为后端选择一个唯一 ID。
4. 点击**完成并部署**以创建首次发布。

使用 Firebase App Hosting 部署时，App Hosting 预设会在构建时自动启用。

### 运行配置

你可以使用 Nitro 配置中的 `firebase.appHosting` 选项自定义生成的 [App Hosting 输出包](https://firebase.google.com/docs/app-hosting/build-config)运行配置：

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  firebase: {
    appHosting: {
      cpu: 1,
      memoryMiB: 512,
      concurrency: 80,
      minInstances: 0,
      maxInstances: 10,
    },
  },
});
```

支持的值包括 `runCommand`、`environmentVariables`、`concurrency`、`cpu`、`memoryMiB`、`minInstances` 和 `maxInstances`。
