---
category: features
icon: i-lucide-database
---

# 数据库

> 使用 SQL 模板字面量的内置数据库支持。

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

  // 创建用户表
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
    description: "运行数据库迁移",
  },
  async run() {
    const db = useDatabase();

    console.log("正在运行数据库迁移...");

    // 创建用户表
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

Nitro 提供了一个使用 SQL 模板字面量进行安全、参数化查询的内置数据库层。本示例创建了用户表，插入一条记录，并查询返回。

## 查询数据库

```ts [server.ts]
import { defineHandler } from "nitro";
import { useDatabase } from "nitro/database";

export default defineHandler(async () => {
  const db = useDatabase();

  // 创建用户表
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

使用 `useDatabase()` 获取数据库实例。可以使用 `db.sql` 查询数据库，像 `${userId}` 这样的变量会自动转义以防止 SQL 注入。

## 使用 Tasks 运行迁移

Nitro 任务允许你在请求处理程序之外运行操作。对于数据库迁移，在 `tasks/` 中创建任务文件并通过 CLI 运行。这样可以将架构更改与应用程序代码分离。

```ts [tasks/db/migrate.ts]
import { defineTask } from "nitro/task";
import { useDatabase } from "nitro/database";

export default defineTask({
  meta: {
    description: "运行数据库迁移",
  },
  async run() {
    const db = useDatabase();

    console.log("正在运行数据库迁移...");

    // 创建用户表
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
