# 任务

> Nitro 任务允许在运行时进行开关操作。

<warning>

Nitro v3 Alpha 文档仍在开发中 — 预计会有更新、不完善之处及偶尔的错误。

</warning>

## 选择实验性功能

<important>

任务支持目前是实验性的。
请查看 [nitrojs/nitro#1974](https://github.com/nitrojs/nitro/issues/1974) 以获取相关讨论。

</important>

为了使用任务 API，您需要启用实验性功能标志。

<CodeGroup>

```ts [nitro.config.ts]
import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  experimental: {
    tasks: true
  }
})
```

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  nitro: {
    experimental: {
      tasks: true
    }
  }
})
```

</CodeGroup>

::

## 定义任务

任务可以在 `server/tasks/[name].ts` 文件中定义。

支持嵌套目录。任务名称将通过 `:` 连接。（例：`server/tasks/db/migrate.ts` 任务名称将为 `db:migrate`）

**示例：**

```ts [tasks/db/migrate.ts]
export default defineTask({
  meta: {
    name: "db:migrate",
    description: "运行数据库迁移",
  },
  run({ payload, context }) {
    console.log("正在运行数据库迁移任务...");
    return { result: "成功" };
  },
});
```

## 定时任务

您可以使用 Nitro 配置定义定时任务，以便在每段时间后自动运行。

<CodeGroup>

```ts [nitro.config.ts]
import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  scheduledTasks: {
    // 每分钟运行一次 `cms:update` 任务
    '* * * * *': ['cms:update']
  }
})
```

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  nitro: {
    scheduledTasks: {
      // 每分钟运行一次 `cms:update` 任务
      '* * * * *': ['cms:update']
    }
  }
})
```

</CodeGroup>

<tip>

您可以使用 [crontab.guru](https://crontab.guru/) 来轻松生成和理解 cron 表达式模式。

</tip>

## `waitUntil`

在运行后台任务时，您可能希望确保服务器或工作线程等待任务完成。

可选的 `context.waitUntil` 函数 *可能* 可用，这取决于运行时环境。

```ts
export default defineTask({
  run({ context }) {
    const promise = fetch(...)
    context.waitUntil?.(promise);
    await promise;
    return { result: "Success" };
  },
});
```

### 平台支持

- `dev`、`node-server`、`bun` 和 `deno-server` 预设支持 [croner](https://croner.56k.guru/) 引擎。
- `cloudflare_module` 预设与 [Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/) 具有原生集成。确保配置 wrangler 使用与您在 `scheduledTasks` 中定义的完全相同的模式以进行匹配。
- `vercel` 预设与 [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs) 具有原生集成。Nitro 会在构建时自动生成 cron 任务配置 — 无需手动设置 `vercel.json`。
- 计划支持更多预设（具有原生原语支持）！

## 程序化运行任务

要手动运行任务，您可以使用 `runTask(name, { payload? })` 工具。

**示例：**

```ts [api/migrate.ts]
export default eventHandler(async (event) => {
  // 重要：身份验证用户和验证负载！
  const payload = { ...getQuery(event) };
  const { result } = await runTask("db:migrate", { payload });

  return { result };
});
```

## 使用开发服务器运行任务

Nitro 内置的开发服务器使任务可以轻松执行，而无需编程使用。

### 使用 API 路由

#### `/_nitro/tasks`

此端点返回可用的任务名称及其元数据的列表。

```json
// [GET] /_nitro/tasks
{
  "tasks": {
    "db:migrate": {
      "description": "运行数据库迁移"
    },
    "cms:update": {
      "description": "更新 CMS 内容"
    }
  },
  "scheduledTasks": [
    {
      "cron": "* * * * *",
      "tasks": [
        "cms:update"
      ]
    }
  ]
}
```

#### `/_nitro/tasks/:name`

此端点执行一个任务。您可以使用查询参数和主体 JSON 负载提供负载。发送的 JSON 主体负载必须位于 `"payload"` 属性下。

<code-group>

```ts [tasks/echo/payload.ts]
export default defineTask({
  meta: {
    name: "echo:payload",
    description: "返回提供的负载",
  },
  run({ payload, context }) {
    console.log("正在运行回声任务...");
    return { result: payload };
  },
});
```

```json [GET]
// [GET] /_nitro/tasks/echo:payload?field=value&array=1&array=2
{
  "field": "value",
  "array": ["1", "2"]
}
```

```json [POST]
/**
 * [POST] /_nitro/tasks/echo:payload?field=value
 * body: {
 *   "payload": {
 *     "answer": 42,
 *     "nested": {
 *       "value": true
 *     }
 *   }
 * }
 */
{
  "field": "value",
  "answer": 42,
  "nested": {
    "value": true
  }
}
```

</code-group>

<note>

包含在正文中的 JSON 负载将覆盖查询参数中存在的键。

</note>

### 使用 CLI

<important>

只能在 **开发服务器运行** 时运行这些命令。您应该在第二个终端中运行它们。

</important>

#### 列出任务

```sh
nitro task list
```

#### 运行任务

```sh
nitro task run db:migrate --payload "{}"
```

## 注意事项

### 并发

每个任务只能有 **一个运行实例**。在并行调用同一个名称的任务多次时，实际上只调用一次，所有调用者将获得相同的返回值。

<note>

Nitro 任务可以多次同时运行。

</note>
