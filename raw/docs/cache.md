# 缓存

> Nitro 提供了一种构建在存储层之上的缓存系统。

<warning>

Nitro v3 Alpha 文档仍在开发中 — 可能会有更新、不完善之处和偶发的不准确。

</warning>

## 缓存的事件处理器

要缓存事件处理器，您只需使用 `defineCachedHandler` 方法。

它的用法类似于 `defineHandler`，但增加了第二个 [options](#options) 参数用于缓存配置。

```ts [routes/cached.ts]
import { defineCachedHandler } from "nitro/cache";

export default defineCachedHandler((event) => {
  return "我被缓存一小时";
}, { maxAge: 60 * 60 });
```

在此示例中，响应将在 1 小时内被缓存，同时在后台更新缓存时，将发送一个过期值到客户端。如果您希望立即返回更新后的响应，请设置 `swr: false`。

<important>

**处理缓存响应时，所有传入的请求头都会被丢弃。** 如果您定义了 [`varies` 选项](#options)，则只有指定的请求头会在缓存和提供响应时被考虑。

</important>

有关可用选项的更多详细信息，请参阅 [options](#options) 部分。

<note>

您也可以使用 `cachedEventHandler` 方法作为 `defineCachedHandler` 的别名。

</note>

## 缓存的函数

您还可以使用 `defineCachedFunction` 函数缓存一个普通函数。对于缓存并复用多个处理器中调用的非事件处理器函数返回值非常有用。

例如，您可能想要缓存一个 API 调用的结果，缓存时间为 1 小时：

```ts [routes/api/stars/[...repo].ts]
import { defineHandler, type H3Event } from "nitro/h3";
import { defineHandler, defineCachedFunction } from "nitro/cache";

export default defineHandler(async (event) => {
  const { repo } = event.context.params;
  const stars = await cachedGHStars(repo).catch(() => 0)

  return { repo, stars }
});

const cachedGHStars = defineCachedFunction(async (repo: string) => {
  const data = await fetch(`https://api.github.com/repos/${repo}`).then(res => res.json());

  return data.stargazers_count;
}, {
  maxAge: 60 * 60,
  name: "ghStars",
  getKey: (repo: string) => repo
});
```

在开发环境中，星星数量将被缓存到 `.nitro/cache/functions/ghStars/<owner>/<repo>.json` 中，`value` 是星星的数量：

```json
{"expires":1677851092249,"value":43991,"mtime":1677847492540,"integrity":"ZUHcsxCWEH"}
```

<important>

由于缓存数据被序列化为 JSON，因此非常重要的是，缓存的函数不能返回任何无法序列化的内容，如 Symbols、Maps、Sets 等。

</important>

<callout>

如果您使用边缘工作者（Edge Workers）来托管您的应用，应该遵循以下说明。

<collapsible name="边缘工作者说明">

在边缘工作者中，实例会在每个请求后被销毁。Nitro 会自动使用 `event.waitUntil` 来在缓存更新时保持实例存活，同时将响应发送给客户端。

为了确保您的缓存函数在边缘工作者中正常工作，**您应该始终将 event 作为第一个参数传递给使用 defineCachedFunction 定义的函数。**

```ts [routes/api/stars/[...repo].ts]
import { defineCachedFunction } from "nitro/cache";


export default defineHandler(async (event) => {
  const { repo } = event.context.params;
  const stars = await cachedGHStars(event, repo).catch(() => 0)

  return { repo, stars }
});

const cachedGHStars = defineCachedFunction(async (event: H3Event, repo: string) => {
  const data = await fetch(`https://api.github.com/repos/${repo}`).then(res => res.json());

  return data.stargazers_count;
}, {
  maxAge: 60 * 60,
  name: "ghStars",
  getKey: (event: H3Event, repo: string) => repo
});
```

这样，函数在后台更新缓存时能够保持实例存活，而不会影响客户端的响应速度。

</collapsible>
</callout>

### 边缘工作者

如果您使用边缘工作者部署应用，每个请求后实例都会被销毁。Nitro 会自动使用 `event.waitUntil` 来在缓存更新时保持实例存活，同时将响应发送给客户端。

为了确保您的缓存函数在边缘工作者中如预期工作，**应该始终将 event 作为第一个参数传递给用 defineCachedFunction 定义的函数。**

```ts [routes/api/stars/[...repo].ts]
import { defineHandler, defineCachedFunction, type H3Event } from "nitro/runtime";

export default defineHandler(async (event) => {
  const { repo } = event.context.params;
  const stars = await cachedGHStars(event, repo).catch(() => 0)

  return { repo, stars }
});

const cachedGHStars = defineCachedFunction(async (event: H3Event, repo: string) => {
  const data = await fetch(`https://api.github.com/repos/${repo}`).then(res => res.json());

  return data.stargazers_count;
}, {
  maxAge: 60 * 60,
  name: "ghStars",
  getKey: (event: H3Event, repo: string) => repo
});
```

通过这种方式，函数将在更新缓存时能够保持实例存活而不会减慢客户端的响应速度。

## 缓存路由规则

此功能使您能够在主配置文件中直接添加基于通配符模式的缓存路由。这对于为应用程序的一部分提供全局缓存策略特别有用。

使用 `stale-while-revalidate` 行为缓存所有博客路由 1 小时：

```ts [nitro.config.ts]
import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  routeRules: {
    "/blog/**": { cache: { maxAge: 60 * 60 } },
  },
});
```

如果想使用一个 [自定义缓存存储](#cache-storage) 挂载点，可以使用 `base` 选项：

```ts [nitro.config.ts]
import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  storage: {
    redis: {
      driver: "redis",
      url: "redis://localhost:6379",
    },
  },
  routeRules: {
    "/blog/**": { cache: { maxAge: 60 * 60, base: "redis" } },
  },
});
```

## 自定义缓存存储

Nitro 将缓存数据存储在 `cache` 存储挂载点中。

- 在生产环境中，默认使用 [memory driver](https://unstorage.unjs.io/drivers/memory)。
- 在开发环境中，使用 [filesystem driver](https://unstorage.unjs.io/drivers/fs)，写入临时目录（`.nitro/cache`）。

要覆盖生产存储，请使用 `storage` 选项设置 `cache` 挂载点：

```ts [nitro.config.ts]
import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  storage: {
    cache: {
      driver: 'redis',
      /* Redis 连接器选项 */
    }
  }
})
```

在开发环境，您也可以通过 `devStorage` 选项覆盖缓存挂载点：

```ts [nitro.config.ts]
import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  storage: {
    cache: {
      // 生产环境缓存存储
    },
  },
  devStorage: {
    cache: {
      driver: 'redis',
      /* Redis 连接器选项 */
    }
  }
})
```

## 选项

`defineCachedHandler` 和 `defineCachedFunction` 函数接受以下选项：

<field-group>
<field name="base" type="string">

用于缓存的存储挂载点名称。<br />


默认值为 `cache`。

</field>

<field name="name" type="string">

缓存名称，若未提供则从函数名推断，默认值为 `'_'`。

</field>

<field name="group" type="string">

缓存分组。事件处理器默认为 `'nitro/handlers'`，函数默认为 `'nitro/functions'`。

</field>

<field name="getKey()" type="(...args) => string">

接收与原始函数相同参数并返回缓存键（`string`）的函数。<br />


若不提供，将使用内置哈希函数根据参数生成键。

</field>

<field name="integrity" type="string">

用于使缓存失效的值（变动时失效）。<br />


默认基于函数代码计算，在开发环境用于函数代码变更时失效缓存。

</field>

<field name="maxAge" type="number">

缓存最大有效时间（秒）。<br />


默认 `1`（秒）。

</field>

<field name="staleMaxAge" type="number">

过期缓存最大有效时间（秒）。设置为 `-1` 时启用后台更新同时返回过期缓存（SWR）。<br />


默认 `0`（禁用）。

</field>

<field name="swr" type="boolean">

是否启用 stale-while-revalidate 行为，在异步后台更新时提供过期响应。<br />


默认 `true`。

</field>

<field name="shouldInvalidateCache()" type="(...args) => boolean">

返回 `boolean`，决定是否使当前缓存失效并创建新缓存。

</field>

<field name="shouldBypassCache()" type="(...args) => boolean">

返回 `boolean`，决定是否绕过当前缓存但不失效现有缓存条目。

</field>

<field name="varies" type="string[]">

用于缓存的请求头数组，[了解更多](https://github.com/nitrojs/nitro/issues/1031)。多租户环境中可传递 `['host', 'x-forwarded-host']`，以确保这些请求头被考虑且缓存针对每个租户唯一。

</field>
</field-group>

## 缓存键和失效

`defineCachedFunction` 或 `defineCachedHandler` 生成缓存键的模式如下：

```ts
`${options.group}:${options.name}:${options.getKey(...args)}.json`
```

例如，以下缓存函数：

```ts
import { defineCachedFunction } from "nitro/cache";

const getAccessToken = defineCachedFunction(() => {
  return String(Date.now())
}, {
  maxAge: 10,
  name: "getAccessToken",
  getKey: () => "default"
});
```

其缓存键将为：

```ts
nitro:functions:getAccessToken:default.json
```

您可以通过以下代码使缓存函数的条目失效：

```ts
import { useStorage } from "nitro/storage";

await useStorage('cache').removeItem('nitro:functions:getAccessToken:default.json')
```

<read-more to="/docs/storage">

更多关于 Nitro 存储的内容。

</read-more>
