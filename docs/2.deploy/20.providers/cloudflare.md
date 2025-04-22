# Cloudflare

> 将 Nitro 应用部署到 Cloudflare Workers 和 Pages。

## Cloudflare Worker

**预设:** `cloudflare_module`

:read-more{title="Cloudflare Workers" to="https://developers.cloudflare.com/workers/"}

::note
此预设使用 [模块工作器语法](https://developers.cloudflare.com/workers/learning/migrating-to-module-workers/) 进行部署。
::

::note
此预设默认享受 [静态资源](https://developers.cloudflare.com/workers/static-assets/) 的好处。
::

## Cloudflare Pages

**预设:** `cloudflare_pages`

:read-more{title="Cloudflare Pages" to="https://pages.cloudflare.com/"}

::note
可以通过 [零配置](/deploy#zero-config-providers) 集成此提供方。
::

Nitro 自动生成一个 `_routes.json` 文件，该文件控制从文件提供的路由和从 Worker 脚本提供的路由。自动生成的路由文件可以通过配置选项 `cloudflare.pages.routes` 被覆盖 ([了解更多](https://developers.cloudflare.com/pages/platform/functions/routing/#functions-invocation-routes))。

### 使用预设构建您的应用程序

预设仅适用于应用程序构建过程。

如果您使用 [Cloudflare Pages GitHub/GitLab 集成](https://developers.cloudflare.com/pages/get-started/#connect-your-git-provider-to-pages)，且不需要在本地预览您的应用程序，则 Nitro 不需要任何类型的配置。当您推送到您的代码库时，Cloudflare Pages CI/CD 过程将自动构建您的项目，Nitro 将检测正确的环境并相应地构建您的应用程序。

如果您希望在本地预览您的应用程序和/或手动部署它，在构建应用程序时需要让 Nitro 知道目标环境是 Cloudflare Pages，您可以通过两种方式实现：

- 在运行构建过程时，将 `NITRO_PRESET` 或 `SERVER_PRESET` 环境变量设置为 `cloudflare_pages`，如下所示：

    ```bash
    NITRO_PRESET=cloudflare_pages npm run build
    ```

- 或者通过更新您的 Nitro [预设配置](/config#preset):

    ```json5
    "preset": "cloudflare_pages",
    ```

    然后运行标准的构建命令：

    :pm-run{script="build"}

### Wrangler

要在本地预览您的应用程序或手动部署它，您需要使用 [wrangler](https://github.com/cloudflare/workers-sdk/tree/main/packages/wrangler) 命令行工具，只需将其安装为 node 依赖项：

:pm-install{name="wrangler"}

### 本地预览您的应用

构建应用程序后，您可以通过运行以下命令使用 wrangler 在本地预览它：

:pm-x{command="wrangler pages dev dist"}

### 使用 wrangler 从本地机器部署

构建应用程序后，您可以使用 wrangler 手动部署它，首先确保您已登录 Cloudflare 账户：

:pm-x{command="wrangler login"}

然后您可以部署该应用程序：

:pm-x{command="wrangler pages deploy dist"}

## 运行时钩子

您可以使用 [运行时钩子](/guide/plugins#nitro-runtime-hooks) 来扩展 [工作器处理程序](https://developers.cloudflare.com/workers/runtime-apis/handlers/)。

:read-more{to="/guide/plugins#nitro-runtime-hooks"}

- [`cloudflare:scheduled`](https://developers.cloudflare.com/workers/runtime-apis/handlers/scheduled/)
- [`cloudflare:email`](https://developers.cloudflare.com/email-routing/email-workers/runtime-api/)
- [`cloudflare:queue`](https://developers.cloudflare.com/queues/configuration/javascript-apis/#consumer)
- [`cloudflare:tail`](https://developers.cloudflare.com/workers/runtime-apis/handlers/tail/)
- `cloudflare:trace`

### 本地预览您的应用

您可以使用 [wrangler](https://github.com/cloudflare/workers-sdk/tree/main/packages/wrangler) 来本地预览您的应用：

```bash
NITRO_PRESET=cloudflare npm run build

# 如果您在项目根目录添加了 'wrangler.toml' 文件，如上所示：
npx wrangler dev

# 如果您没有 'wrangler.toml'，则直接使用：
npx wrangler dev .output/server/index.mjs --site .output/public
```

### 使用 wrangler 从本地机器部署

安装 [wrangler](https://github.com/cloudflare/workers-sdk/tree/main/packages/wrangler) 并登录到您的 Cloudflare 账户：

```bash
npm i wrangler
wrangler login
```

使用 `cloudflare_module` 预设生成您的应用：

```bash
NITRO_PRESET=cloudflare_module npm run build
```

然后您可以在本地预览它：

```bash
# 如果您有一个 'wrangler.toml' 文件，如上所示：
npx wrangler dev

# 如果您没有 'wrangler.toml'：
npx wrangler dev .output/server/index.mjs --site .output/public
```

并发布：

:pm-x{command="wrangler deploy"}

## 使用 GitHub Actions 在 CI/CD 中部署

无论您使用 Cloudflare Pages 还是 Cloudflare Workers，您都可以使用 [Wrangler GitHub actions](https://github.com/marketplace/actions/deploy-to-cloudflare-workers-with-wrangler) 来部署您的应用程序。

::note
**注意：** 请记得 [指示 Nitro 使用正确的预设](/deploy#changing-the-deployment-preset)（请注意，这在所有预设中都是必要的，包括 `cloudflare_pages`）。
::

## 环境变量

Nitro 允许您通过 `process.env` 或 `import.meta.env` 或运行时配置通用访问环境变量。

::note
确保仅在 **事件生命周期内** 访问环境变量，而不是在全局上下文中，因为 Cloudflare 仅在请求生命周期期间提供它们，而不是在此之前。
::

**示例：** 如果您设置了 `SECRET` 和 `NITRO_HELLO_THERE` 环境变量，您可以通过以下方式访问它们：

```ts
console.log(process.env.SECRET) // 请注意，这是在全局范围内！因此实际上它不起作用，变量是未定义的！

export default defineEventHandler((event) => {
  // 请注意，所有以下方式都是访问上述变量的有效方法
  useRuntimeConfig(event).helloThere
  useRuntimeConfig(event).secret
  process.env.NITRO_HELLO_THERE
  import.meta.env.SECRET
});
```

### 在开发模式中指定变量

在开发时，您可以使用 `.env` 文件指定环境变量：

```ini
NITRO_HELLO_THERE="captain"
SECRET="top-secret"
```

::note
**注意：** 请确保将 `.env` 添加到 `.gitignore` 文件中，以免您提交它，因为它可能包含敏感信息。
::

### 为本地预览指定变量

构建后，当您尝试在本地使用 `wrangler dev` 或 `wrangler pages dev` 测试项目时，为了访问环境变量，您需要在项目根目录中指定在 `.dev.vars` 文件中（如 [Pages](https://developers.cloudflare.com/pages/functions/bindings/#interact-with-your-environment-variables-locally) 和 [Workers](https://developers.cloudflare.com/workers/configuration/environment-variables/#interact-with-environment-variables-locally) 文档中所示）。

如果您在开发时使用了 `.env` 文件，则您的 `.dev.vars` 应与之相同。

::note
**注意：** 请确保将 `.dev.vars` 添加到 `.gitignore` 文件中，以免您提交它，因为它可能包含敏感信息。
::

### 为生产环境指定变量

对于生产环境，使用 Cloudflare 控制面板或 [`wrangler secret`](https://developers.cloudflare.com/workers/wrangler/commands/#secret) 命令设置环境变量和秘密。

### 使用 `wrangler.toml` 指定变量

您可以指定一个自定义的 `wrangler.toml` 文件并在其中定义变量。

::warning
请注意，这不推荐用于敏感数据。
::

**示例：**

```ini [wrangler.toml]
# 共享
[vars]
NITRO_HELLO_THERE="general"
SECRET="secret"

# 为 `--env production` 用法覆盖值
[env.production.vars]
NITRO_HELLO_THERE="captain"
SECRET="top-secret"
```

## 直接访问 Cloudflare 绑定

绑定允许您与 Cloudflare 平台上的资源交互，这些资源的示例包括键值数据存储 ([KVs](https://developers.cloudflare.com/kv/)) 和无服务器 SQL 数据库 ([D1s](https://developers.cloudflare.com/d1/))。

::read-more
有关绑定的更多详细信息及其用法，请参阅 Cloudflare 的 [Pages](https://developers.cloudflare.com/pages/functions/bindings/) 和 [Workers](https://developers.cloudflare.com/workers/configuration/bindings/#bindings) 文档。
::

> [!TIP]
> Nitro 提供了高级 API，以便与 [KV 存储](/guide/storage) 和 [数据库](/guide/database) 交互，强烈建议您优先使用它们，而不是直接依赖低级 API 以确保使用稳定性。

:read-more{title="数据库层" to="/guide/database"}

:read-more{title="KV 存储" to="/guide/storage"}

在运行时，您可以通过访问请求事件的 `context.cloudflare.env` 字段来访问绑定，例如，您可以这样访问 D1 绑定：

```ts
defineEventHandler(async (event) => {
  const { cloudflare } = event.context
  const stmt = await cloudflare.env.MY_D1.prepare('SELECT id FROM table')
  const { results } = await stmt.all()
})
```

### 在本地环境中访问绑定

为了在本地开发模式中访问绑定，无论选择的预设是什么，建议使用一个 `wrangler.toml` 文件（以及一个 `.dev.vars` 的文件）结合 [`nitro-cloudflare-dev` 模块](https://github.com/nitrojs/nitro-cloudflare-dev)，如下所示。

> [!NOTE]
> `nitro-cloudflare-dev` 模块是实验性的。Nitro 团队正在寻找更本地化的集成，这可能在不久的将来使该模块不再需要。

为了在开发模式中访问绑定，我们首先在 `wrangler.toml` 文件中定义绑定，例如，您将如何定义一个变量和一个 KV 命名空间：

```ini [wrangler.toml]
[vars]
MY_VARIABLE="my-value"

[[kv_namespaces]]
binding = "MY_KV"
id = "xxx"
```

> [!NOTE]
> 仅默认环境中的绑定被识别。

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

从此时起，当运行

:pm-run{script="dev"}

您将能够从请求事件访问 `MY_VARIABLE` 和 `MY_KV`，就像上面所示。