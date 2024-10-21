# Cloudflare

> 部署 Nitro 应用到 Cloudflare。

## Cloudflare Pages

**预设:** `cloudflare_pages`

:read-more{title="Cloudflare Pages" to="https://pages.cloudflare.com/"}

::note
这是 Cloudflare 部署的推荐预设，请仅在有特殊需求时考虑使用其他选项。
::

::note
与该提供商的集成可以通过 [零配置](/deploy#zero-config-providers) 实现。
::

Nitro 自动生成一个 `_routes.json` 文件，用于控制哪些路由从文件提供，哪些路由从 Worker 脚本提供。自动生成的路由文件可以通过配置选项 `cloudflare.pages.routes` 来覆盖 ([了解更多](https://developers.cloudflare.com/pages/platform/functions/routing/#functions-invocation-routes))。

### 使用预设构建您的应用程序

该预设仅适用于应用程序的构建过程。

如果您使用 [Cloudflare Pages GitHub/GitLab 集成](https://developers.cloudflare.com/pages/get-started/#connect-your-git-provider-to-pages)，并且不需要在本地预览您的应用程序，则 Nitro 不需要任何类型的配置。当您推送到您的代码库时，Cloudflare Pages CI/CD 过程将自动构建您的项目，Nitro 将检测正确的环境并相应地构建您的应用程序。

如果您希望在本地预览您的应用程序和/或手动部署它，在构建应用程序时，您需要让 Nitro 知道目标环境是 Cloudflare Pages，您可以通过两种方式实现：

- 通过定义 `NITRO_PRESET` 或 `SERVER_PRESET` 环境变量设置为 `cloudflare_pages` 来运行构建过程，例如：

    ```bash
    NITRO_PRESET=cloudflare_pages npm run build
    ```

- 或者通过更新您的 Nitro [预设配置](/config#preset):

    ```json5
    "preset": "cloudflare_pages",
    ```

    然后运行标准构建命令：

    :pm-run{script="build"}

### Wrangler

要在本地预览您的应用程序或手动部署它，您需要使用 [wrangler](https://github.com/cloudflare/workers-sdk/tree/main/packages/wrangler) CLI 工具，简单地将其安装为 Node 依赖项：

:pm-install{name="wrangler"}

### 在本地预览您的应用

在构建完应用程序后，您可以通过运行以下命令来使用 wrangler 在本地预览它：

:pm-x{command="wrangler pages dev dist"}

### 使用 wrangler 从本地机器部署

在构建完应用程序后，您可以使用 wrangler 手动部署它，
首先确保已登录到您的 Cloudflare 帐户：

:pm-x{command="wrangler login"}

然后您可以使用以下命令部署应用程序：

:pm-x{command="wrangler pages deploy dist"}

## Cloudflare Module Workers

**预设:** `cloudflare_module`

::note
**注意：** 该预设使用 [模块工作者语法](https://developers.cloudflare.com/workers/learning/migrating-to-module-workers/) 进行部署。
::

::warning
**注意：** 不推荐使用该预设。
::

使用 Workers 时，您需要在根目录中添加一个 `wrangler.toml` 文件。

以下是一个 Nitro 应用程序的典型 `wrangler.toml` 文件示例：

```ini
name = "playground"
main = "./.output/server/index.mjs"
workers_dev = true
compatibility_date = "2023-12-01"
# account_id = "<(可选) 您的 Cloudflare 账户 ID，可从 Cloudflare 仪表板获取>"
# route = "<(可选) 主要在您想设置自定义域名时使用>"

rules = [
  { type = "ESModule", globs = ["**/*.js", "**/*.mjs"]},
]

[site]
bucket = ".output/public"
```

### 在本地预览您的应用

您可以使用 [wrangler](https://github.com/cloudflare/workers-sdk/tree/main/packages/wrangler) 在本地预览您的应用：

```bash
NITRO_PRESET=cloudflare npm run build

# 如果您在项目根目录中添加了类似上述的 'wrangler.toml' 文件：
npx wrangler dev

# 如果您没有 'wrangler.toml'，直接使用：
npx wrangler dev .output/server/index.mjs --site .output/public
```

### 使用 wrangler 从本地机器部署

安装 [wrangler](https://github.com/cloudflare/workers-sdk/tree/main/packages/wrangler) 并登录到您的 Cloudflare 帐户：

```bash
npm i wrangler
wrangler login
```

使用 `cloudflare_module` 预设生成您的应用：

```bash
NITRO_PRESET=cloudflare_module npm run build
```

然后您可以在本地预览：

```bash
# 如果您有上述的 'wrangler.toml':
npx wrangler dev

# 如果您没有 'wrangler.toml':
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

该预设的工作方式与上述 `cloudflare_module` 的预设相同，唯一的区别是该预设继承了所有 [缺点](https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/#advantages-of-migrating)，这些语法带来的缺点。

## 使用 GitHub Actions 在 CI/CD 中部署

无论您使用的是 Cloudflare Pages 还是 Cloudflare workers，您都可以使用 [Wrangler GitHub actions](https://github.com/marketplace/actions/deploy-to-cloudflare-workers-with-wrangler) 来部署您的应用程序。

::note
**注意：** 请记得 [指示 Nitro 使用正确的预设](/deploy/#changing-the-deployment-preset)（请注意，这对于所有预设，包括 `cloudflare_pages`，都是必要的）。
::

## 环境变量

Nitro 允许您使用 `process.env` 或 `import.meta.env` 或运行时配置普遍访问环境变量。

::note
确保只在 **事件生命周期** 内访问环境变量，而不是在全局上下文中，因为 Cloudflare 仅在请求生命周期内提供它们，而不是在之前。
::

**示例：** 如果您设置了 `SECRET` 和 `NITRO_HELLO_THERE` 环境变量，您可以通过以下方式访问它们：

```ts
console.log(process.env.SECRET) // 注意这是在全局作用域中！所以实际上并不起作用，变量是未定义的！

export default defineEventHandler((event) => {
  // 注意以下所有方法都是有效的访问上述变量的方式
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
**注意：** 确保将 `.env` 添加到 `.gitignore` 文件中，以免提交，因为它可能包含敏感信息。
::

### 对于本地预览指定变量

构建后，当您尝试在本地使用 `wrangler dev` 或 `wrangler pages dev` 测试您的项目时，为了访问环境变量，您需要在项目根目录中的 `.dev.vars` 文件中指定它们（如 [Pages](https://developers.cloudflare.com/pages/functions/bindings/#interact-with-your-environment-variables-locally) 和 [Workers](https://developers.cloudflare.com/workers/configuration/environment-variables/#interact-with-environment-variables-locally) 文档中所示）。

如果您在开发时使用了 `.env` 文件，您的 `.dev.vars` 应该与之相同。

::note
**注意：** 确保将 `.dev.vars` 添加到 `.gitignore` 文件中，以免提交，因为它可能包含敏感信息。
::

### 对于生产环境指定变量

对于生产环境，使用 Cloudflare 仪表板或 [`wrangler secret`](https://developers.cloudflare.com/workers/wrangler/commands/#secret) 命令设置环境变量和机密。

### 使用 `wrangler.toml` 指定变量

您可以指定自定义的 `wrangler.toml` 文件，并在其中定义变量。

::note
**注意：** `wrangler.toml` 不被 Cloudflare Pages 支持。
::

::warning
请注意，这不推荐用于敏感数据。
::

**示例：**

```ini [wrangler.toml]
# 共享
[vars]
NITRO_HELLO_THERE="general"
SECRET="secret"

# 为 `--env production` 使用重写值
[env.production.vars]
NITRO_HELLO_THERE="captain"
SECRET="top-secret"
```

## 直接访问 Cloudflare 绑定

绑定是您与 Cloudflare 平台资源交互的方式，诸如此类的资源示例包括键值数据存储 ([KVs](https://developers.cloudflare.com/kv/)) 和无服务器 SQL 数据库 ([D1s](https://developers.cloudflare.com/d1/))。

::read-more
有关绑定的更多信息及其使用方法，请参阅 Cloudflare [Pages](https://developers.cloudflare.com/pages/functions/bindings/) 和 [Workers](https://developers.cloudflare.com/workers/configuration/bindings/#bindings) 文档。
::

> [!TIP]
> Nitro 提供高级 API 与诸如 [KV 存储](/guide/storage) 和 [数据库](/guide/database) 等原语进行交互，强烈建议您使用它们，而不是直接依赖低级 API 以确保使用的稳定性。

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

为了在本地开发模式中访问绑定，无论选择了哪个预设，建议使用 `wrangler.toml` 文件（以及 `.dev.vars` 文件）与 [`nitro-cloudflare-dev` 模块](https://github.com/pi0/nitro-cloudflare-dev) 结合使用，如下所示。

> [!NOTE]
> `nitro-cloudflare-dev` 模块是实验性的。Nitro 团队正在寻求更本地的集成，未来可能使该模块不再需要。

为了在开发模式中访问绑定，我们首先在 `wrangler.toml` 文件中定义绑定，例如，您可以这样定义一个变量和一个 KV 命名空间：

```ini [wrangler.toml]
[vars]
MY_VARIABLE="my-value"

[[kv_namespaces]]
binding = "MY_KV"
id = "xxx"
```

> [!NOTE]
> 只有默认环境中的绑定才会被识别。

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

您将能够从请求事件中访问 `MY_VARIABLE` 和 `MY_KV`，就像上面所示的那样。
