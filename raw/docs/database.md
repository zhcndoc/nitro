# SQL 数据库

> Nitro 提供了一个内置的轻量级 SQL 数据库层。

<warning>



</warning>

Nitro v3 Alpha 文档仍在开发中 — 可能会有更新、不完善之处和偶尔的不准确。
:

默认的数据库连接已**预配置**为 [SQLite](https://db0.unjs.io/connectors/sqlite)，并且可以在开发模式和任何兼容 Node.js 的生产部署中开箱即用。默认情况下，数据将存储在 `.data/db.sqlite` 中。

<important>

数据库支持目前处于实验阶段。
请参阅 [db0 问题](https://github.com/unjs/db0/issues) 以获取状态信息和报告错误。

</important>

为了启用数据库层，你需要启用实验特性标志。

```ts [nitro.config.ts]
import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  experimental: {
    database: true
  }
})
```

<tip>

你可以更改默认连接，或者为任何 [支持的数据库](https://db0.unjs.io/connectors/sqlite) 定义更多连接。

</tip>

<tip>

你可以将数据库实例集成到任何 [支持的 ORM](https://db0.unjs.io/integrations) 中。

</tip>

<read-more title="DB0 文档" to="https://db0.unjs.io">



</read-more>

## 用法

```ts [server.ts]
import { defineHandler } from "nitro/h3";
import { useDatabase } from "nitro/database";

export default defineHandler(async () => {
  const db = useDatabase();

  // Create users table
  await db.sql`DROP TABLE IF EXISTS users`;
  await db.sql`CREATE TABLE IF NOT EXISTS users ("id" TEXT PRIMARY KEY, "firstName" TEXT, "lastName" TEXT, "email" TEXT)`;

  // Add a new user
  const userId = String(Math.round(Math.random() * 10_000));
  await db.sql`INSERT INTO users VALUES (${userId}, 'John', 'Doe', '')`;

  // Query for users
  const { rows } = await db.sql`SELECT * FROM users WHERE id = ${userId}`;

  return {
    rows,
  };
});
```

## 配置

你可以使用 `database` 配置来配置数据库连接：

```ts [nitro.config.ts]
import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  database: {
    default: {
      connector: "sqlite",
      options: { name: "db" }
    },
    users: {
      connector: "postgresql",
      options: {
        url: "postgresql://username:password@hostname:port/database_name"
      },
    },
  },
});
```

<tip>

你可以使用 `devDatabase` 配置仅在开发模式下覆盖数据库配置。

</tip>
