# Cloudflare

> 部署 Nitro 应用到 Cloudflare。

## Cloudflare Workers

**预设:** `cloudflare_module`

<read-more to="https://developers.cloudflare.com/workers/" title="Cloudflare Workers">



</read-more>

<note>

与此提供者的集成可以通过 [零配置](/deploy#zero-config-providers) 实现，支持 [workers builds (beta)](https://developers.cloudflare.com/workers/ci-cd/builds/)。

</note>

<important>

要将 Workers 与静态资产一起使用，您需要设置 Nitro 兼容日期为 `2024-09-19` 或更高。

</important>

以下是将 Nitro 应用部署到 Cloudflare Workers 的示例 `nitro.config.ts` 文件。

<CodeGroup>

```ts [nitro.config.ts]
import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
    compatibilityDate: "2024-09-19",
    preset: "cloudflare_module",
    cloudflare: {
      deployConfig: true,
      nodeCompat: true
    }
})
```

```ts [nuxt.config.ts]
export default defineNuxtConfig({
    compatibilityDate: "2024-09-19",
    nitro: {
      preset: "cloudflare_module",
      cloudflare: {
        deployConfig: true,
        nodeCompat: true
      }
    }
})
```

</CodeGroup>

::

通过设置 `deployConfig: true`，Nitro 将自动为您生成一个正确配置的 `wrangler.json`。
如果您需要添加 [Cloudflare Workers 配置](https://developers.cloudflare.com/workers/wrangler/configuration/)，例如 [bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/)，您可以：

- 在您的 Nitro 配置中设置 `cloudflare: { wrangler : {} }`。这与 `wrangler.json` 的类型相同。
- 提供您自己的 `wrangler.json`。Nitro 将与适当的设置合并您的配置，包括指向构建输出。

### 本地预览

您可以使用 [Wrangler](https://github.com/cloudflare/workers-sdk/tree/main/packages/wrangler) 在本地预览您的应用：

<pm-run script="build">



</pm-run>

<pm-x command="wrangler dev">



</pm-x>

### 手动部署

构建应用程序后，您可以使用 Wrangler 手动部署它。

首先确保您已登录到 Cloudflare 账户：

<pm-x command="wrangler login">



</pm-x>

然后您可以用以下命令部署应用程序：

<pm-x command="wrangler deploy">



</pm-x>

### 运行时钩子

您可以使用以下 [运行时钩子](/guide/plugins#nitro-runtime-hooks) 来扩展 [Worker 处理程序](https://developers.cloudflare.com/workers/runtime-apis/handlers/)。

<read-more to="/guide/plugins#nitro-runtime-hooks">



</read-more>

- [`cloudflare:scheduled`](https://developers.cloudflare.com/workers/runtime-apis/handlers/scheduled/)
- [`cloudflare:email`](https://developers.cloudflare.com/email-routing/email-workers/runtime-api/)
- [`cloudflare:queue`](https://developers.cloudflare.com/queues/configuration/javascript-apis/#consumer)
- [`cloudflare:tail`](https://developers.cloudflare.com/workers/runtime-apis/handlers/tail/)
- `cloudflare:trace`

### 额外导出

你可以在项目根目录下添加一个 `exports.cloudflare.ts` 文件，以向 Cloudflare Worker 入口点导出额外的处理程序或属性。

```ts [exports.cloudflare.ts]
export class MyWorkflow extends WorkflowEntrypoint {
  async run(event: WorkflowEvent, step: WorkflowStep) {
    // ...
  }
}
```

Nitro 将自动检测此文件，并在最终构建中包含其导出内容。

<warning>

`exports.cloudflare.ts` 文件不能有默认导出。

</warning>

您还可以在 `nitro.config.ts` 中使用 `cloudflare.exports` 选项自定义入口文件的位置：

```ts [nitro.config.ts]
export default defineConfig({
  cloudflare: {
    exports: "custom-exports-entry.ts"
  }
})
```

## Cloudflare Pages

**预设:** `cloudflare_pages`

<read-more to="https://pages.cloudflare.com/" title="Cloudflare Pages">



</read-more>

<note>

与此提供者的集成可以通过 [零配置](/deploy#zero-config-providers) 实现。

</note>

<warning>

Cloudflare [Workers Module](#cloudflare-workers) 是推荐用于部署的新预设。如果您只需特定功能，请考虑使用 Pages。

</warning>

以下是将 Nitro 应用部署到 Cloudflare Pages 的示例 `nitro.config.ts` 文件。

<CodeGroup>

```ts [nitro.config.ts]
import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
    preset: "cloudflare_pages",
    cloudflare: {
      deployConfig: true,
      nodeCompat:true
    }
})
```

```ts [nuxt.config.ts]
export default defineNuxtConfig({
    nitro: {
      preset: "cloudflare_pages",
      cloudflare: {
        deployConfig: true,
        nodeCompat:true
      }
    }
})
```

</CodeGroup>

::

Nitro 将自动生成一个 `_routes.json` 文件，该文件控制来自文件的路由和来自 Worker 脚本的路由。通过配置选项 `cloudflare.pages.routes` 可以覆盖自动生成的路由文件 ([了解更多](https://developers.cloudflare.com/pages/platform/functions/routing/#functions-invocation-routes))。

### 本地预览

您可以使用 [Wrangler](https://github.com/cloudflare/workers-sdk/tree/main/packages/wrangler) 在本地预览您的应用：

<pm-run script="build">



</pm-run>

<pm-x command="wrangler pages dev">



</pm-x>

### 手动部署

构建应用程序后，您可以使用 Wrangler 手动部署它，首先确保您已登录到 Cloudflare 账户：

<pm-x command="wrangler login">



</pm-x>

然后您可以用以下命令部署应用程序：

<pm-x command="wrangler pages deploy">



</pm-x>

## 使用 GitHub Actions 在 CI/CD 中部署

无论您是使用 Cloudflare Pages 还是 Cloudflare Workers，您都可以使用 [Wrangler GitHub actions](https://github.com/marketplace/actions/deploy-to-cloudflare-workers-with-wrangler) 来部署您的应用。

<note>

**注意：** 请记得 [指示 Nitro 使用正确的预设](/deploy#changing-the-deployment-preset)（请注意，这在所有预设中都是必要的，包括 `cloudflare_pages`）。

</note>

## 环境变量

Nitro 允许您通过 `process.env` 或 `import.meta.env` 或运行时配置通用访问环境变量。

<note>

确保仅在 **事件生命周期内** 访问环境变量，而不是在全局上下文中，因为 Cloudflare 仅在请求生命周期期间提供它们，而不是在此之前。

</note>

**示例：** 如果您设置了 `SECRET` 和 `NITRO_HELLO_THERE` 环境变量，您可以通过以下方式访问它们：

```ts
import { defineHandler } from "nitro/h3";
import { useRuntimeConfig } from "nitro/runtime-config";

console.log(process.env.SECRET) // 请注意，这是在全局范围内！因此实际上它不起作用，变量是未定义的！

export default defineHandler((event) => {
  // 请注意，所有以下方式都是访问上述变量的有效方法
  useRuntimeConfig().helloThere
  useRuntimeConfig().secret
  process.env.NITRO_HELLO_THERE
  import.meta.env.SECRET
});
```

### 在开发模式中指定变量

在开发时，您可以使用 `.env` 或 `.env.local` 文件指定环境变量：

```ini
NITRO_HELLO_THERE="captain"
SECRET="top-secret"
```

<note>

**注意：** 请确保将 `.env` 和 `.env.local` 添加到 `.gitignore` 文件中，以免您提交它，因为它可能包含敏感信息。

</note>

### 为本地预览指定变量

构建后，当您尝试在本地使用 `wrangler dev` 或 `wrangler pages dev` 测试项目时，为了访问环境变量，您需要在项目根目录中指定在 `.dev.vars` 文件中（如 [Pages](https://developers.cloudflare.com/pages/functions/bindings/#interact-with-your-environment-variables-locally) 和 [Workers](https://developers.cloudflare.com/workers/configuration/environment-variables/#interact-with-environment-variables-locally) 文档中所示）。

如果您在开发时使用了 `.env` 或 `.env.local` 文件，则您的 `.dev.vars` 应与之相同。

<note>

**注意：** 请确保将 `.dev.vars` 添加到 `.gitignore` 文件中，以免您提交它，因为它可能包含敏感信息。

</note>

### 为生产环境指定变量

对于生产环境，请使用 Cloudflare 控制台或 [`wrangler secret`](https://developers.cloudflare.com/workers/wrangler/commands/#secret) 命令设置环境变量和机密。

### 使用 `wrangler.toml`/`wrangler.json` 指定变量

您可以指定自定义的 `wrangler.toml`/`wrangler.json` 文件，并在其中定义变量。

<warning>

请注意，这不推荐用于敏感数据，例如机密。

</warning>

**示例：**

<code-group>

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

```json [wrangler.json]
{
  "vars": {
    "NITRO_HELLO_THERE": "general",
    "SECRET": "secret"
  },
  "env": {
    "production": {
      "vars": {
        "NITRO_HELLO_THERE": "captain",
        "SECRET": "top-secret"
      }
    }
  }
}
```

</code-group>

## 直接访问 Cloudflare 绑定

绑定允许您与 Cloudflare 平台上的资源交互，这些资源的示例包括键值数据存储 ([KVs](https://developers.cloudflare.com/kv/)) 和无服务器 SQL 数据库 ([D1s](https://developers.cloudflare.com/d1/))。

<read-more>

有关绑定的更多详细信息及其用法，请参阅 Cloudflare 的 [Pages](https://developers.cloudflare.com/pages/functions/bindings/) 和 [Workers](https://developers.cloudflare.com/workers/configuration/bindings/#bindings) 文档。

</read-more>

<tip>

Nitro 提供了高级 API，以便与 [KV 存储](/guide/storage) 和 [数据库](/guide/database) 交互，强烈建议您优先使用它们，而不是直接依赖低级 API 以确保使用稳定性。

</tip>

<read-more to="/guide/database" title="数据库层">



</read-more>

<read-more to="/guide/storage" title="KV 存储">



</read-more>

在运行时，您可以通过访问请求事件的 `context.cloudflare.env` 字段来访问绑定，例如，您可以这样访问 D1 绑定：

```ts
import { defineHandler } from "nitro/h3";

defineHandler(async (event) => {
  const { cloudflare } = event.context
  const stmt = await cloudflare.env.MY_D1.prepare('SELECT id FROM table')
  const { results } = await stmt.all()
})
```

### 在本地开发中访问绑定

要在开发模式下访问绑定，首先需要定义它们。你可以在 `wrangler.jsonc`、`wrangler.json` 或 `wrangler.toml` 文件中进行定义。

例如，在 `wrangler.toml` 中定义一个变量和一个 KV 命名空间：

<code-group>

```ini [wrangler.toml]
[vars]
MY_VARIABLE="my-value"

[[kv_namespaces]]
binding = "MY_KV"
id = "xxx"
```

```json [wrangler.json]
{
  "vars": {
    "MY_VARIABLE": "my-value"
  },
  "kv_namespaces": [
    {
      "binding": "MY_KV",
      "id": "xxx"
    }
  ]
}
```

</code-group>

接下来我们安装所需的 `wrangler` 包（如果尚未安装）：

<pm-install name="wrangler -D">



</pm-install>

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['nitro-cloudflare-dev']
})
```

::

从此时起，当运行

<pm-run script="dev">



</pm-run>

您将能够像上面所示一样，从请求事件中访问 `MY_VARIABLE` 和 `MY_KV`。

#### Wrangler 环境

如果您有多个 Wrangler 环境，可以在 Cloudflare 开发仿真期间指定要使用的 Wrangler 环境：

```ts [nitro.config.ts]
import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  preset: 'cloudflare-module',
  cloudflare: {
    dev: {
      environment: 'preview'
    }
  }
})
```
