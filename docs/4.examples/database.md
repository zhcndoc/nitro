---
category: features
icon: i-lucide-database
---

# 数据库

> 内置支持数据库，使用 SQL 模板字面量。

<!-- automd:ui-code-tree src="../../examples/database" default="server.ts" ignore="README.md,GUIDE.md" expandAll -->

::code-tree{defaultValue="server.ts" expandAll}

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  experimental: {
    database: true,
    tasks: true,
  },
  database: {
    default: { connector: "sqlite" },
  },
});
```

```json [package.json]
{
  "type": "module",
  "scripts": {
    "dev": "nitro dev",
    "build": "nitro build"
  },
  "devDependencies": {
    "nitro": "latest"
  }
}
```

```ts [server.ts]
import { defineHandler } from "nitro";
import { useDatabase } from "nitro/database";

export default defineHandler(async () => {
  const db = useDatabase();

  // 创建 users 表
  await db.sql`DROP TABLE IF EXISTS users`;
  await db.sql`CREATE TABLE IF NOT EXISTS users ("id" TEXT PRIMARY KEY, "firstName" TEXT, "lastName" TEXT, "email" TEXT)`;

  // 添加新用户
  const userId = String(Math.round(Math.random() * 10_000));
  await db.sql`INSERT INTO users VALUES (${userId}, 'John', 'Doe', '')`;

  // 查询用户
  const { rows } = await db.sql`SELECT * FROM users WHERE id = ${userId}`;

  return {
    rows,
  };
});
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

```ts [tasks/db/migrate.ts]
import { defineTask } from "nitro/task";
import { useDatabase } from "nitro/database";

export default defineTask({
  meta: {
    description: "执行数据库迁移",
  },
  async run() {
    const db = useDatabase();

    console.log("正在运行数据库迁移...");

    // 创建 users 表
    await db.sql`DROP TABLE IF EXISTS users`;
    await db.sql`CREATE TABLE IF NOT EXISTS users ("id" TEXT PRIMARY KEY, "firstName" TEXT, "lastName" TEXT, "email" TEXT)`;

    return {
      result: "数据库迁移完成！",
    };
  },
});
```

::

<!-- /automd -->

<!-- automd:file src="../../examples/database/README.md" -->

Nitro 提供了内置的数据库层，使用 SQL 模板字面量进行安全的参数化查询。此示例演示创建 users 表，插入记录，并查询该记录。

## 查询数据库

```ts [server.ts]
import { defineHandler } from "nitro";
import { useDatabase } from "nitro/database";

export default defineHandler(async () => {
  const db = useDatabase();

  // 创建 users 表
  await db.sql`DROP TABLE IF EXISTS users`;
  await db.sql`CREATE TABLE IF NOT EXISTS users ("id" TEXT PRIMARY KEY, "firstName" TEXT, "lastName" TEXT, "email" TEXT)`;

  // 添加新用户
  const userId = String(Math.round(Math.random() * 10_000));
  await db.sql`INSERT INTO users VALUES (${userId}, 'John', 'Doe', '')`;

  // 查询用户
  const { rows } = await db.sql`SELECT * FROM users WHERE id = ${userId}`;

  return {
    rows,
  };
});
```

通过 `useDatabase()` 获取数据库实例。可以使用 `db.sql` 进行查询，像 `${userId}` 这样的变量会自动转义以防止 SQL 注入。

## 使用任务运行迁移

Nitro 的任务功能允许你在请求处理之外运行操作。对于数据库迁移，创建一个位于 `tasks/` 目录的任务文件，并通过 CLI 运行。这能将数据库模式变更与应用代码分离。

```ts [tasks/db/migrate.ts]
import { defineTask } from "nitro/task";
import { useDatabase } from "nitro/database";

export default defineTask({
  meta: {
    description: "执行数据库迁移",
  },
  async run() {
    const db = useDatabase();

    console.log("正在运行数据库迁移...");

    // 创建 users 表
    await db.sql`DROP TABLE IF EXISTS users`;
    await db.sql`CREATE TABLE IF NOT EXISTS users ("id" TEXT PRIMARY KEY, "firstName" TEXT, "lastName" TEXT, "email" TEXT)`;

    return {
      result: "数据库迁移完成！",
    };
  },
});
```

<!-- /automd -->

## 了解更多

- [数据库](/docs/database)
- [任务](/docs/tasks)
