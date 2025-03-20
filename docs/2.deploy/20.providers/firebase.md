# Firebase

> 将 Nitro 应用部署到 Firebase。

::note
您需要使用 [**Blaze 计划**](https://firebase.google.com/pricing)（按需付费）才能开始。
::

## Firebase 应用托管

预设: `firebase_app_hosting`

:read-more{title="Firebase 应用托管" to="https://firebase.google.com/docs/app-hosting"}

::tip
您可以使用 [零配置](/deploy/#zero-config-providers) 集成此提供者。
::

### 项目设置

1. 前往 Firebase [控制台](https://console.firebase.google.com/) 并设置一个新项目。
2. 从侧边栏选择 **构建 > 应用托管**。
    - 在此步骤中，您可能需要升级您的计费计划。
3. 点击 **开始使用**。
    - 选择一个区域。
    - 导入一个 GitHub 仓库（您需要链接您的 GitHub 账户）。
    - 配置部署设置（项目根目录和分支），并启用自动发布。
    - 为您的后端选择一个唯一的 ID。
4. 点击完成并部署以创建您的首次发布。

当您使用 Firebase 应用托管进行部署时，应用托管预设将在构建时自动运行。

## Firebase 托管（已弃用）

::important
此部署方法已弃用，且不推荐使用。Firebase 应用托管是推荐的在 Firebase 上部署 Nitro 应用的方法。
::

**预设:** `firebase`

:read-more{title="Firebase 托管" to="https://firebase.google.com/docs/hosting"}

::important
此预设默认将部署到 Firebase 函数第一代。如果您想部署到 Firebase 函数第二代，请参见 [下面的说明](#using-2nd-generation-firebase-functions)。
::

### 项目设置

#### 使用 Firebase CLI（推荐）

您也可以选择使用 Firebase CLI 来设置您的项目，它会为您获取项目 ID，添加所需的依赖项（见上文），甚至通过 GitHub Actions 设置自动部署（仅适用于托管）。 [了解如何安装 Firebase CLI](https://firebase.google.com/docs/cli#windows-npm)。

1. 全局安装 Firebase CLI

始终尝试使用最新版本的 Firebase CLI。

```bash
npm install -g firebase-tools@latest
```

**注意**：您需要在 [^11.18.0](https://github.com/firebase/firebase-tools/releases/tag/v11.18.0) 版本上才能部署 `nodejs18` 函数。

2. 初始化您的 Firebase 项目

```bash
firebase login
firebase init hosting
```

当提示时，您可以将 `.output/public` 作为公共目录。在下一步中，**不要**将项目配置为单页面应用 (SPA)。

完成后，将以下内容添加到 `firebase.json` 中以启用 Cloud Functions 的服务器渲染：

```json [firebase.json]
{
  "functions": { "source": ".output/server" },
  "hosting": [
    {
      "site": "<your_project_id>",
      "public": ".output/public",
      "cleanUrls": true,
      "rewrites": [{ "source": "**", "function": "server" }]
    }
  ]
}
```

您可以在 [Firebase 文档](https://firebase.google.com/docs/hosting/quickstart) 中找到更多详细信息。

#### 替代方法

如果您的根目录中尚未存在 `firebase.json` 文件，则在第一次运行 Nitro 时会自动创建一个。在该文件中，您需要将 `<your_project_id>` 替换为您的 Firebase 项目的 ID。然后该文件应被提交到 git。

1. 创建 `.firebaserc` 文件

建议创建一个 `.firebaserc` 文件，这样您就不需要手动将项目 ID 传递给您的 `firebase` 命令（使用 `--project <your_project_id>`）：

```json [.firebaserc]
{
  "projects": {
    "default": "<your_project_id>"
  }
}
```

通常在您使用 Firebase CLI 初始化项目时会自动生成此文件。但如果没有，您也可以手动创建它。

2. 安装 Firebase 依赖项

然后，将 Firebase 依赖项添加到您的项目中：

:pm-install{name="firebase-admin firebase-functions firebase-functions-test" dev}

3. 登录到 Firebase CLI

确保您已使用 Firebase CLI 身份验证。运行此命令并按照提示操作：

:pm-x{command="firebase-tools login"}

### 本地预览

如果您需要测试而不进行部署，可以预览您网站的本地版本。

```bash
NITRO_PRESET=firebase npm run build
firebase emulators:start
```

### 构建和部署

通过运行 Nitro 构建，然后运行 `firebase deploy` 命令来部署到 Firebase 托管。

```bash
NITRO_PRESET=firebase npm run build
```

:pm-x{command="firebase-tools deploy"}

如果您已全局安装 Firebase CLI，您还可以运行：

```bash
firebase deploy
```

### 使用第二代 Firebase 函数

- [第一代和第二代函数的比较](https://firebase.google.com/docs/functions/version-comparison)

要切换到更现代且推荐的 Firebase 函数版本，请将 `firebase.gen` 选项设置为 `2`：

::code-group

```ts{3} [nitro.config.ts]
export default defineNitroConfig({
  firebase: {
    gen: 2
    // ...
  }
})
```

```ts{4} [nuxt.config.ts]
export default defineNuxtConfig({
  nitro: {
    firebase: {
      gen: 2
      // ...
    }
  }
})
```

::

::note
如果由于某种原因无法使用配置，您可以使用 `NITRO_FIREBASE_GEN` 环境变量作为替代。
::

如果您已经有一个已部署版本的网站并想升级到第二代，请 [参见 Firebase 文档中的迁移过程](https://firebase.google.com/docs/functions/2nd-gen-upgrade)。具体来说，CLI 会要求您在部署新函数之前删除现有函数。

### 选项

您可以在 `nitro.config.ts` 文件中为 Firebase 函数设置选项：

::code-group

```ts [nitro.config.ts]
export default defineNitroConfig({
  firebase: {
    gen: 2,
    httpsOptions: {
      region: 'europe-west1',
      maxInstances: 3,
    },
  },
});
```

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  nitro: {
    firebase: {
      gen: 2,
      httpsOptions: {
        region: 'europe-west1',
        maxInstances: 3,
      },
    },
  },
});
```

::

如果 `gen` 选项设置为 `1`，您也可以为第一代 Cloud Functions 设置选项。请注意，这些与第二代 Cloud Functions 的选项不同。

#### 运行时 Node.js 版本

您可以在配置中设置自定义 Node.js 版本：

::code-group

```ts [nitro.config.ts]
export default defineNitroConfig({
  firebase: {
    nodeVersion: "20" // 可以是 "16"、"18"、"20" 或 "22"
  },
});
```

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  nitro: {
    firebase: {
      nodeVersion: "20" // 可以是 "16"、"18"、"20" 或 "22"
    },
  },
});
```

::

Firebase 工具使用 `package.json` 中的 `engines.node` 版本来确定用于您的函数的 Node 版本。Nitro 会自动将配置好的 Node.js 版本写入 `.output/server/package.json`。

您可能还需要在 `firebase.json` 文件中添加运行时键：

```json [firebase.json]
{
  "functions": {
    "source": ".output/server",
    "runtime": "nodejs20"
  }
}
```

有关更多信息，您可以阅读 [Firebase 文档](https://firebase.google.com/docs/functions/manage-functions?gen=2nd#set_nodejs_version)。

### 如果您的 Firebase 项目有其他云函数

您可能会收到警告，当您部署您的 Nitro 项目时，其他云函数将被删除。这是因为 Nitro 将您的整个项目部署到 Firebase 函数。如果您只想部署您的 Nitro 项目，可以使用 `--only` 标志：

```bash
firebase deploy --only functions:server,hosting
```

### 高级

#### 重命名函数

在同一 Firebase 项目中部署多个应用时，您必须给您的服务器提供一个唯一名称，以避免覆盖您的函数。

您可以在配置中为已部署的 Firebase 函数指定一个新名称：

::code-group

```ts [nitro.config.ts]
export default defineNitroConfig({
  firebase: {
    serverFunctionName: "<new_function_name>"
  }
})
```

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  nitro: {
    firebase: {
      serverFunctionName: "<new_function_name>"
    }
  }
})
```

::

::important
`firebase.serverFunctionName` 必须是一个有效的 JS 变量名，且不能包含破折号（`-`）。
::