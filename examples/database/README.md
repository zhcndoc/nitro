Nitro 提供了一个内置数据库层，该数据库层使用 SQL 模板字面量来执行安全的参数化查询。此示例创建一个 users 表，插入一条记录，然后查询该记录。

## 查询数据库

```ts [server.ts]
import { defineHandler } from "nitro";
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

使用 `useDatabase()` 获取数据库实例。可以使用 `db.sql` 查询数据库，`${userId}` 之类的变量会自动进行转义，以防止 SQL 注入。

## 使用 Tasks 运行迁移

Nitro tasks 允许你在请求处理程序之外运行操作。对于数据库迁移，请在 `tasks/` 中创建任务文件，然后通过 CLI 运行它。这样可以将架构变更与应用代码分离。

```ts [tasks/db/migrate.ts]
import { defineTask } from "nitro/task";
import { useDatabase } from "nitro/database";

export default defineTask({
  meta: {
    description: "Run database migrations",
  },
  async run() {
    const db = useDatabase();

    console.log("Running database migrations...");

    // Create users table
    await db.sql`DROP TABLE IF EXISTS users`;
    await db.sql`CREATE TABLE IF NOT EXISTS users ("id" TEXT PRIMARY KEY, "firstName" TEXT, "lastName" TEXT, "email" TEXT)`;

    return {
      result: "Database migrations complete!",
    };
  },
});
```
