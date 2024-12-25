# Cloudflare

> 部署 Nitro 应用到 Cloudflare。

## Cloudflare Pages

**预设:** `cloudflare_pages`

:read-more{title="Cloudflare Pages" to="https://pages.cloudflare.com/"}

::note
这是 Cloudflare 部署的推荐预设，如果您需要特殊功能，请考虑使用其他预设。
::

::note
与该提供商的集成可以通过[零配置](/deploy#zero-config-providers)实现。
::

Nitro 自动生成一个 `_routes.json` 文件，用于控制哪些路由由文件提供，哪些由 Worker 脚本提供。可以通过配置选项 `cloudflare.pages.routes` 来覆盖自动生成的路由文件 ([了解更多](https://developers.cloudflare.com/pages/platform/functions/routing/#functions-invocation-routes))。

### 使用预设构建您的应用程序

该预设仅适用于应用程序的构建过程。

如果您使用 [Cloudflare Pages GitHub/GitLab 集成](https://developers.cloudflare.com/pages/get-started/#connect-your-git-provider-to-pages)，并且不需要在本地预览您的应用程序，那么 Nitro 不需要任何形式的配置。当您推送到您的存储库时，Cloudflare Pages 的 CI/CD 过程将自动构建您的项目，Nitro 会检测正确的环境并相应地构建您的应用程序。

如果您想要在本地预览您的应用程序和/或手动部署它，在构建应用程序时，您需要让 Nitro 知道目标环境是 Cloudflare Pages，您可以通过以下两种方式做到这一点：

- 在运行构建过程时定义 `NITRO_PRESET` 或 `SERVER_PRESET` 环境变量设置为 `cloudflare_pages`，如下所示：

    ```bash
    NITRO_PRESET=cloudflare_pages npm run build
    ```

- 或通过更新您的 Nitro [预设配置](/config#preset):

    ```json5
    "preset": "cloudflare_pages",
    ```

    然后运行标准构建命令：

    :pm-run{script="build"}

### Wrangler

要在本地预览您的应用程序或手动部署它，您需要使用 [wrangler](https://github.com/cloudflare/workers-sdk/tree/main/packages/wrangler) CLI 工具，只需将其安装为节点依赖项：

:pm-install{name="wrangler"}

### 在本地预览您的应用程序

构建完应用程序后，您可以通过运行以下命令使用 wrangler 在本地预览它：

:pm-x{command="wrangler pages dev dist"}

### 使用 wrangler 从本地机器部署

构建完应用程序后，您可以使用 wrangler 手动部署它，首先确保您已登录到您的 Cloudflare 账户：

:pm-x{command="wrangler login"}

然后您可以使用以下命令部署应用程序：

:pm-x{command="wrangler pages deploy dist"}

## Cloudflare Module Workers

**预设:** `cloudflare_module`

::note
**注意：** 该预设使用 [模块工作者语法](https://developers.cloudflare.com/workers/learning/migrating-to-module-workers/) 进行部署。
::

使用 Workers 时，您需要一个位于根目录的 `wrangler.toml` 文件。对于使用 [静态资产](https://developers.cloudflare.com/workers/static-assets/) (测试版的 [限制](https://developers.cloudflare.com/workers/static-assets/#limitations)) 的 Worker，您还需要在 `wrangler.toml` 文件和 nitro 配置文件中设置兼容性日期为 `2024-09-19` 或更高。

以下是 Nitro 应用程序的典型 `wrangler.toml` 文件和 `nitro.config.ts` 文件的示例：

::code-group

```ts [nitro.config.ts]
export default defineNitroConfig({
    compatibilityDate: "2024-09-19",
})
```

```ts [nuxt.config.ts]
export default defineNuxtConfig({
    compatibilityDate: "2024-09-19",
})
```

::

```ini [wrangler.toml]
name = "nitro-app"
compatibility_date = "2024-09-19"
main = "./.output/server/index.mjs"
assets = { directory = "./.output/public/", binding = "ASSETS" }
```

## 运行时钩子

您可以使用 [运行时钩子](/guide/plugins#nitro-runtime-hooks) 来扩展 [worker 处理程序](https://developers.cloudflare.com/workers/runtime-apis/handlers/)。

:read-more{to="/guide/plugins#nitro-runtime-hooks"}

- [`cloudflare:scheduled`](https://developers.cloudflare.com/workers/runtime-apis/handlers/scheduled/)
- [`cloudflare:email`](https://developers.cloudflare.com/email-routing/email-workers/runtime-api/)
- [`cloudflare:queue`](https://developers.cloudflare.com/queues/configuration/javascript-apis/#consumer)
- [`cloudflare:tail`](https://developers.cloudflare.com/workers/runtime-apis/handlers/tail/)
- `cloudflare:trace`

### 在本地预览您的应用程序

您可以使用 [wrangler](https://github.com/cloudflare/workers-sdk/tree/main/packages/wrangler) 来在本地预览您的应用程序：

```bash
NITRO_PRESET=cloudflare npm run build

# 如果您在 project 根目录中添加了 'wrangler.toml' 文件，如上所示：
npx wrangler dev

# 如果您没有 'wrangler.toml'，直接使用：
npx wrangler dev .output/server/index.mjs --site .output/public
```

### 使用 wrangler 从本地机器部署

安装 [wrangler](https://github.com/cloudflare/workers-sdk/tree/main/packages/wrangler) 并登录到您的 Cloudflare 账户：

```bash
npm i wrangler
wrangler login
```

使用 `cloudflare_module` 预设生成您的应用程序：

```bash
NITRO_PRESET=cloudflare_module npm run build
```

然后，您可以在本地预览它：

```bash
# 如果您有一个 'wrangler.toml' 文件，如上所示：
npx wrangler dev

# 如果您没有 'wrangler.toml'：
npx wrangler dev .output/server/index.mjs --site .output/public
```

并发布它：

:pm-x{command="wrangler deploy"}

## Cloudflare Service Workers

**预设:** `cloudflare`

::note
**注意：** 该预设使用 [服务工作者语法](https://developers.cloudflare.com/workers/learning/service-worker/) 进行部署。
::

::warning
**注意：** 该预设已被弃用。
::

该预设的工作方式与上面介绍的 `cloudflare_module` 相同，唯一的区别是该预设继承了所有该语法所带来的 [缺点](https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/#advantages-of-migrating)。

## 使用 GitHub Actions 在 CI/CD 中部署

无论您是在使用 Cloudflare Pages 还是 Cloudflare Workers，您都可以使用 [Wrangler GitHub actions](https://github.com/marketplace/actions/deploy-to-cloudflare-workers-with-wrangler) 来部署您的应用程序。

::note
**注意：** 记得[指示 Nitro 使用正确的预设](/deploy#changing-the-deployment-preset)（注意对于所有预设，包括 `cloudflare_pages` 预设，这是必要的）。
::

## 环境变量

Nitro 允许您通过 `process.env` 或 `import.meta.env` 或运行时配置统一访问环境变量。

::note
确保仅在 **事件生命周期** 内访问环境变量，而不是在全局上下文中，因为 Cloudflare 只在请求生命周期内提供它们，而不在之前提供。
::

**示例:** 如果您设置了 `SECRET` 和 `NITRO_HELLO_THERE` 环境变量，您可以通过以下方式访问它们：

```ts
console.log(process.env.SECRET) // 请注意这是在全局作用域！所以它实际上不起作用，变量是未定义的！

export default defineEventHandler((event) => {
  // 请注意，以下所有方式都是访问上述变量的有效方式
  useRuntimeConfig(event).helloThere
  useRuntimeConfig(event).secret
  process.env.NITRO_HELLO_THERE
  import.meta.env.SECRET
});
```

### 在开发模式中指定变量

对于开发，您可以使用 `.env` 文件来指定环境变量：

```ini
NITRO_HELLO_THERE="captain"
SECRET="top-secret"
```

::note
**注意：** 确保将 `.env` 添加到 `.gitignore` 文件中，以防止您提交它，因为它可能包含敏感信息。
::

### 为本地预览指定变量

构建后，当您尝试通过 `wrangler dev` 或 `wrangler pages dev` 在本地测试您的项目时，为了访问环境变量，您需要在项目根目录中指定一个 `.dev.vars` 文件（如在 [Pages](https://developers.cloudflare.com/pages/functions/bindings/#interact-with-your-environment-variables-locally) 和 [Workers](https://developers.cloudflare.com/workers/configuration/environment-variables/#interact-with-environment-variables-locally) 文档中所述）。

如果您在开发时使用 `.env` 文件，则您的 `.dev.vars` 应与其相同。

::note
**注意：** 确保将 `.dev.vars` 添加到 `.gitignore` 文件中，以防止您提交它，因为它可能包含敏感信息。
::

### 为生产指定变量

对于生产，使用 Cloudflare 控制台或 [`wrangler secret`](https://developers.cloudflare.com/workers/wrangler/commands/#secret) 命令设置环境变量和机密。

### 使用 `wrangler.toml` 指定变量

您可以指定一个自定义的 `wrangler.toml` 文件并在其中定义变量。

::note
**注意：** `wrangler.toml` 在 cloudflare pages 中不受支持。
::

::warning
请注意，这不建议用于敏感数据。
::

**示例：**

```ini [wrangler.toml]
# 共享
[vars]
NITRO_HELLO_THERE="general"
SECRET="secret"

# 为 `--env production` 使用覆盖值
[env.production.vars]
NITRO_HELLO_THERE="captain"
SECRET="top-secret"
```

## 直接访问 Cloudflare 绑定

绑定允许您与 Cloudflare 平台的资源进行交互，这些资源的例子包括键值数据存储 ([KVs](https://developers.cloudflare.com/kv/)) 和无服务器 SQL 数据库 ([D1s](https://developers.cloudflare.com/d1/))。

::read-more
有关绑定及其使用方式的更多详细信息，请参阅 Cloudflare 的 [Pages](https://developers.cloudflare.com/pages/functions/bindings/) 和 [Workers](https://developers.cloudflare.com/workers/configuration/bindings/#bindings) 文档。
::

> [!TIP]
> Nitro 提供高层 API 来与诸如 [KV 存储](/guide/storage) 和 [数据库](/guide/database) 等原语进行交互，强烈建议您更倾向于使用它们，而不是直接依赖低级 API 以确保稳定性。

:read-more{title="数据库层" to="/guide/database"}

:read-more{title="KV 存储" to="/guide/storage"}

在运行时，您可以通过请求事件访问绑定，通过访问其 `context.cloudflare.env` 字段，例如以下方法可以访问 D1 绑定：

```ts
defineEventHandler(async (event) => {
  const { cloudflare } = event.context
  const stmt = await cloudflare.env.MY_D1.prepare('SELECT id FROM table')
  const { results } = await stmt.all()
})
```

### 在本地环境中访问绑定

为了在本地开发模式中访问绑定，无论所选的预设如何，建议使用 `wrangler.toml` 文件（以及 `.dev.vars` 文件）与 [`nitro-cloudflare-dev` 模块](https://github.com/nitrojs/nitro-cloudflare-dev) 结合使用，如下所示。

> [!NOTE]
> `nitro-cloudflare-dev` 模块是实验性的。Nitro 团队正在寻找更原生的集成，这可能在不久的将来使该模块变得不必要。

为了在开发模式中访问绑定，我们首先在 `wrangler.toml` 文件中定义绑定，例如这样定义一个变量和一个 KV 命名空间：

```ini [wrangler.toml]
[vars]
MY_VARIABLE="my-value"

[[kv_namespaces]]
binding = "MY_KV"
id = "xxx"
```

> [!NOTE]
> 仅识别默认环境中的绑定。

接下来，我们安装 `nitro-cloudflare-dev` 模块以及所需的 `wrangler` 包（如果尚未安装）：

:pm-install{name="-D nitro-cloudflare-dev wrangler"}

然后定义模块：

::code-group

```js [nitro.config.js]
import nitroCloudflareBindings from "nitro-cloudflare-dev";

export default defineNitroConfig({
  modules: [nitroCloudflareBindings],
});
```

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['nitro-cloudflare-dev']
})
```

::

从这时起，当运行

:pm-run{script="dev"}

您将能够从请求事件中访问 `MY_VARIABLE` 和 `MY_KV`，正如上面所示的那样。