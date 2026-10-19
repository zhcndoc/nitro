---
navigation:
  category: vite
icon: i-logos-vitest
---

# Vitest

> 使用 Vitest 和 `serverFetch` 测试服务器路由。

<!-- automd:ui-code-tree src="../../examples/vitest" default="test/api.test.ts" ignore="README.md,GUIDE.md" expandAll -->

::code-tree{defaultValue="test/api.test.ts" expandAll}

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  serverDir: "./",
  runtimeConfig: {
    greeting: "Hello",
  },
});
```

```json [package.json]
{
  "type": "module",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "test": "vitest"
  },
  "dependencies": {
    "unstorage": "^2.0.0-alpha.10"
  },
  "devDependencies": {
    "nitro": "latest",
    "vite": "latest",
    "vitest": "latest"
  }
}
```

```json [tsconfig.json]
{
  "extends": "nitro/tsconfig"
}
```

```ts [vite.config.ts]
import { defineConfig } from "vite";
import { nitro } from "nitro/vite";

export default defineConfig({ plugins: [nitro()] });
```

```ts [api/hello.ts]
import { defineHandler } from "nitro";
import { useRuntimeConfig } from "nitro/runtime-config";

export default defineHandler(() => {
  const { greeting } = useRuntimeConfig();
  return { message: `${greeting} from Nitro!` };
});
```

```ts [api/visits.ts]
import { defineHandler } from "nitro";
import { useKV } from "nitro/kv";

export default defineHandler(async () => {
  const kv = useKV<number>();
  const visits = ((await kv.getItem("visits")) || 0) + 1;
  await kv.setItem("visits", visits);
  return { visits };
});
```

```ts [test/api.test.ts]
import { beforeEach, expect, test } from "vitest";
import { serverFetch } from "nitro";
import { useKV } from "nitro/kv";

beforeEach(async () => {
  await useKV().removeItem("visits");
});

test("GET /api/hello", async () => {
  const res = await serverFetch("/api/hello");
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual({ message: "Hello from Nitro!" });
});

test("GET /api/visits", async () => {
  await serverFetch("/api/visits");
  const res = await serverFetch("/api/visits");
  expect(await res.json()).toEqual({ visits: 2 });
  expect(await useKV().getItem("visits")).toBe(2);
});
```

::

<!-- /automd -->

<!-- automd:file src="../../examples/vitest/README.md" -->

使用 [Vitest](https://vitest.dev) 测试服务器路由。Vitest 会从 `vite.config.ts` 中获取 `nitro()` 插件，因此测试文件可以使用与服务器相同的路由、运行时配置和存储，而无需启动开发服务器。

## 路由

```ts [api/hello.ts]
import { defineHandler } from "nitro";
import { useRuntimeConfig } from "nitro/runtime-config";

export default defineHandler(() => {
  const { greeting } = useRuntimeConfig();
  return { message: `${greeting} from Nitro!` };
});
```

```ts [api/visits.ts]
import { defineHandler } from "nitro";
import { useKV } from "nitro/kv";

export default defineHandler(async () => {
  const kv = useKV<number>();
  const visits = ((await kv.getItem("visits")) || 0) + 1;
  await kv.setItem("visits", visits);
  return { visits };
});
```

## 测试

```ts [test/api.test.ts]
import { beforeEach, expect, test } from "vitest";
import { serverFetch } from "nitro";
import { useKV } from "nitro/kv";

beforeEach(async () => {
  await useKV().removeItem("visits");
});

test("GET /api/hello", async () => {
  const res = await serverFetch("/api/hello");
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual({ message: "Hello from Nitro!" });
});

test("GET /api/visits", async () => {
  await serverFetch("/api/visits");
  const res = await serverFetch("/api/visits");
  expect(await res.json()).toEqual({ visits: 2 });
  expect(await useKV().getItem("visits")).toBe(2);
});
```

`serverFetch` 会在进程内通过 Nitro 应用发送请求。`useKV` 等运行时工具也可在测试中使用，因此你可以直接准备或检查状态。

运行 `vitest` 执行测试，或使用 `vitest run` 仅运行一次。

<!-- /automd -->

## 了解更多

- [Testing](/docs/testing)
- [Server Fetch](/examples/server-fetch)
