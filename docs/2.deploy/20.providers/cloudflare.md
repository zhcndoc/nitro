# Cloudflare

> 将 Nitro 应用部署到 Cloudflare。

## Cloudflare Workers

**预设：** `cloudflare_module`

:read-more{title="Cloudflare Workers" to="https://developers.cloudflare.com/workers/"}

::note
通过与该提供商的集成支持 [workers builds (beta)](https://developers.cloudflare.com/workers/ci-cd/builds/)，可以实现[零配置](/deploy#zero-config-providers)。
::

::important
要在 Workers 中使用静态资源，你需要将 Nitro 的兼容日期设置为 `2024-09-19` 或更晚。
::

以下展示了用于将 Nitro 应用部署到 Cloudflare Workers 的示例 `nitro.config.ts` 文件。

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

通过设置 `deployConfig: true`，Nitro 将自动为你生成具有正确配置的 `wrangler.json`。
如果你需要添加 [Cloudflare Workers 配置](https://developers.cloudflare.com/workers/wrangler/configuration/)，例如 [绑定](https://developers.cloudflare.com/workers/runtime-apis/bindings/)，你可以：

- 在 Nitro 配置的 `cloudflare: { wrangler : {} }` 下设置这些。这与 `wrangler.json` 具有相同的类型。
- 提供你自己的 `wrangler.json`。Nitro 会将你的配置与适当的设置合并，包括指向构建输出。

### 本地预览

你可以使用 [Wrangler](https://github.com/cloudflare/workers-sdk/tree/main/packages/wrangler) 在本地预览你的应用：

:pm-run{script="build"}

:pm-x{command="wrangler dev"}

### 手动部署

构建完应用后，你可以使用 Wrangler 手动部署它。

首先确保你已登录到你的 Cloudflare 账户：

:pm-x{command="wrangler login"}

然后你可以使用以下命令部署应用：

:pm-x{command="wrangler deploy"}

### 运行时钩子

你可以使用下面的[运行时钩子](/docs/plugins#nitro-runtime-hooks)来扩展 [Worker 处理器](https://developers.cloudflare.com/workers/runtime-apis/handlers/)。

:read-more{to="/docs/plugins#nitro-runtime-hooks"}

- [`cloudflare:scheduled`](https://developers.cloudflare.com/workers/runtime-apis/handlers/scheduled/)
- [`cloudflare:email`](https://developers.cloudflare.com/email-routing/email-workers/runtime-api/)
- [`cloudflare:queue`](https://developers.cloudflare.com/queues/configuration/javascript-apis/#consumer)
- [`cloudflare:tail`](https://developers.cloudflare.com/workers/runtime-apis/handlers/tail/)
- `cloudflare:trace`

### 额外导出

你可以在项目根目录添加一个 `exports.cloudflare.ts` 文件，以向 Cloudflare Worker 入口点导出额外的处理器或属性。

```ts [exports.cloudflare.ts]
export class MyWorkflow extends WorkflowEntrypoint {
  async run(event: WorkflowEvent, step: WorkflowStep) {
    // ...
  }
}
```

Nitro 将自动检测此文件并将其导出包含在最终构建中。

::warning
`exports.cloudflare.ts` 文件不能包含默认导出。
::

你还可以使用 `nitro.config.ts` 中的 `cloudflare.exports` 选项来自定义入口点文件位置：

```ts [nitro.config.ts]
export default defineConfig({
  cloudflare: {
    exports: "custom-exports-entry.ts"
  }
})
```

### 定时任务（Cron 触发器）

当使用带有 `scheduledTasks` 的 [Nitro 任务](/docs/tasks)时，Nitro 会在构建时自动在 wrangler 配置中生成 [Cron 触发器](https://developers.cloudflare.com/workers/configuration/cron-triggers/)。

```ts [nitro.config.ts]
import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  preset: "cloudflare_module",
  experimental: {
    tasks: true,
  },
  scheduledTasks: {
    "* * * * *": ["cms:update"],
    "0 15 1 * *": ["db:cleanup"],
  },
  cloudflare: {
    deployConfig: true,
  },
})
```

无需手动配置 Wrangler - Nitro 会为你处理。

## Cloudflare Pages

**预设：** `cloudflare_pages`

:read-more{title="Cloudflare Pages" to="https://pages.cloudflare.com/"}

::note
与该提供商的集成支持[零配置](/deploy#zero-config-providers)。
::

::warning
Cloudflare [Workers Module](#cloudflare-workers) 是现在推荐的部署预设。请仅在需要特定功能时才考虑使用 Pages。
::

以下展示了用于将 Nitro 应用部署到 Cloudflare Pages 的示例 `nitro.config.ts` 文件。

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

Nitro 自动生成一个 `_routes.json` 文件，用于控制哪些路由由文件提供，哪些由 Worker 脚本提供。自动生成的路由文件可以通过配置选项 `cloudflare.pages.routes` 覆盖（[了解更多](https://developers.cloudflare.com/pages/platform/functions/routing/#functions-invocation-routes)）。

### 本地预览

你可以使用 [Wrangler](https://github.com/cloudflare/workers-sdk/tree/main/packages/wrangler) 在本地预览你的应用：

:pm-run{script="build"}

:pm-x{command="wrangler pages dev"}

### 手动部署

构建完应用后，你可以使用 Wrangler 手动部署它，为此首先确保你已登录到你的 Cloudflare 账户：

:pm-x{command="wrangler login"}

然后你可以使用以下命令部署应用：

:pm-x{command="wrangler pages deploy"}


## 使用 GitHub Actions 在 CI/CD 中部署

无论你使用的是 Cloudflare Pages 还是 Cloudflare Workers，都可以使用 [Wrangler GitHub Actions](https://github.com/marketplace/actions/deploy-to-cloudflare-workers-with-wrangler) 来部署你的应用。

::note
**注意：** 记得[指示 Nitro 使用正确的预设](/deploy#changing-the-deployment-preset)（注意，这对所有预设都是必需的，包括 `cloudflare_pages`）。
::

## 环境变量

Nitro 允许你使用 `process.env` 或 `import.meta.env` 或运行时配置来统一访问环境变量。

::note
确保仅在**事件生命周期内**访问环境变量，而不是在全局上下文中，因为 Cloudflare 仅在请求生命周期期间提供这些变量，而不是在此之前。
::

**示例：** 如果你已设置 `SECRET` 和 `NITRO_HELLO_THERE` 环境变量，你可以通过以下方式访问它们：

```ts
import { defineHandler } from "nitro";
import { useRuntimeConfig } from "nitro/runtime-config";

console.log(process.env.SECRET) // 注意这是在全局作用域中！所以它实际上不起作用，变量是未定义的！

export default defineHandler((event) => {
  // 注意以下都是访问上述变量的有效方式
  useRuntimeConfig().helloThere
  useRuntimeConfig().secret
  process.env.NITRO_HELLO_THERE
  import.meta.env.SECRET
});
```

### 在开发模式中指定变量

对于开发，你可以使用 `.env` 或 `.env.local` 文件来指定环境变量：

```ini
NITRO_HELLO_THERE="captain"
SECRET="top-secret"
```

::note
**注意：** 确保将 `.env` 和 `.env.local` 添加到 `.gitignore` 文件中，这样你就不会提交它，因为它可能包含敏感信息。
::

### 为本地预览指定变量

构建后，当你使用 `wrangler dev` 或 `wrangler pages dev` 在本地试用项目时，为了能够访问环境变量，你需要在项目根目录的 `.dev.vars` 文件中指定它们（如 [Pages](https://developers.cloudflare.com/pages/functions/bindings/#interact-with-your-environment-variables-locally) 和 [Workers](https://developers.cloudflare.com/workers/configuration/environment-variables/#interact-with-environment-variables-locally) 文档中所述）。

如果你在开发时使用 `.env` 或 `.env.local` 文件，你的 `.dev.vars` 应该与之一致。

::note
**注意：** 确保将 `.dev.vars` 添加到 `.gitignore` 文件中，这样你就不会提交它，因为它可能包含敏感信息。
::

### 为生产环境指定变量

对于生产环境，请使用 Cloudflare 仪表板或 [`wrangler secret`](https://developers.cloudflare.com/workers/wrangler/commands/#secret) 命令来设置环境变量和密钥。

### 使用 `wrangler.toml`/`wrangler.json` 指定变量

你可以指定自定义的 `wrangler.toml`/`wrangler.json` 文件并在其中定义变量。

::warning
注意，这不建议用于 secrets 之类的敏感数据。
::

**示例：**

::code-group

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

::

## 直接访问 Cloudflare 绑定

绑定允许你与 Cloudflare 平台的资源进行交互，此类资源的例子包括键值数据存储（[KVs](https://developers.cloudflare.com/kv/)）和无服务器 SQL 数据库（[D1s](https://developers.cloudflare.com/d1/)）。

::read-more
有关绑定及其使用方法的更多详情，请参阅 Cloudflare [Pages](https://developers.cloudflare.com/pages/functions/bindings/) 和 [Workers](https://developers.cloudflare.com/workers/configuration/bindings/#bindings) 文档。
::

> [!TIP]
> Nitro 提供了高级 API 来与诸如 [KV 存储](/docs/storage) 和 [数据库](/docs/database) 之类的原语进行交互，强烈建议你优先使用它们，而不是直接依赖低级别 API 以确保使用稳定性。

:read-more{title="数据库层" to="/docs/database"}

:read-more{title="KV 存储" to="/docs/storage"}

在运行时，你可以通过 `event.req.runtime.cloudflare.env` 从请求事件中访问绑定。例如，以下是你如何访问 D1 绑定的方式：

```ts
import { defineHandler } from "nitro";

defineHandler(async (event) => {
  const { env } = event.req.runtime.cloudflare
  const stmt = await env.MY_D1.prepare('SELECT id FROM table')
  const { results } = await stmt.all()
})
```

### 在本地开发中访问绑定

要在开发模式中访问绑定，我们首先定义它们。你可以在 `wrangler.jsonc`/`wrangler.json`/`wrangler.toml` 文件中执行此操作

例如，要在 `wrangler.toml` 中定义变量和 KV 命名空间：

::code-group

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
    "MY_VARIABLE": "my-value",
  },
  "kv_namespaces": [
    {
      "binding": "MY_KV",
      "id": "xxx"
    }
  ]
}
```

::

接下来我们安装所需的 `wrangler` 包（如果尚未安装）：

:pm-install{name="wrangler -D"}

从此时起，当运行

:pm-run{script="dev"}

你将能够像上图所示那样从请求事件中访问 `MY_VARIABLE` 和 `MY_KV`。

#### Wrangler 环境

如果你有多个 Wrangler 环境，你可以指定在 Cloudflare 开发模拟期间使用哪个 Wrangler 环境：

```ts [nitro.config.ts]
import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  preset: 'cloudflare_module',
  cloudflare: {
    dev: {
      environment: 'preview'
    }
  }
})
```
