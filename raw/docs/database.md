# 数据库

> Nitro 提供了一个内置的轻量级 SQL 数据库层。

默认数据库连接已通过 [SQLite](https://db0.unjs.io/connectors/sqlite) **预配置**，可在开发模式和任何兼容 Node.js 的生产部署中开箱即用。默认情况下，数据将存储在 `.data/db.sqlite` 中。

<read-more title="DB0 文档" to="https://db0.unjs.io">



</read-more>

<important>

数据库支持目前处于实验阶段。
有关状态和错误报告，请参考 [db0 issues](https://github.com/unjs/db0/issues)。

</important>

为了启用数据库层，你需要启用实验性功能标志。

```ts [nitro.config.ts]
import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  experimental: {
    database: true
  }
})
```

<tip>

你可以更改默认连接或定义更多连接到任意一个[支持的数据库](https://db0.unjs.io/connectors/sqlite)。

</tip>

<tip>

你可以将数据库实例集成到任意一个[支持的 ORM](https://db0.unjs.io/integrations)中。

</tip>

## 用法

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

### `useDatabase`

使用 `useDatabase` 获取数据库实例。它接受一个可选的连接名称（默认为 `"default"`）。

```ts
import { useDatabase } from "nitro/database";

// 使用默认连接
const db = useDatabase();

// 使用命名连接
const usersDb = useDatabase("users");
```

<note>

当启用 `experimental.database` 时，`useDatabase` 会被自动导入，无需显式 import 语句即可使用。

</note>

数据库实例在首次使用时惰性创建，并在后续使用相同连接名称的调用中缓存。如果未配置连接名称，将抛出错误。

### `db.sql`

使用带标签的模板字面量和自动参数绑定执行 SQL 查询：

```ts
const db = useDatabase();

// 使用参数化值插入（防止 SQL 注入）
const id = "1001";
await db.sql`INSERT INTO users VALUES (${id}, 'John', 'Doe', 'john@example.com')`;

// 使用参数查询
const { rows } = await db.sql`SELECT * FROM users WHERE id = ${id}`;

// 结果包含行、变更计数和最后插入的 ID
const result = await db.sql`INSERT INTO posts (title) VALUES (${"Hello"})`;
// result.rows, result.changes, result.lastInsertRowid
```

### `db.exec`

直接执行原始 SQL 字符串：

```ts
const db = useDatabase();

await db.exec("CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT)");
```

### `db.prepare`

准备 SQL 语句以供重复执行：

```ts
const db = useDatabase();

const stmt = db.prepare("SELECT * FROM users WHERE id = ?");
const result = await stmt.bind("1001").all();
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

### 开发数据库

使用 `devDatabase` 配置来**仅在开发模式下**覆盖数据库配置。这对于在开发期间使用本地 SQLite 数据库，同时在生产环境中使用不同的数据库非常有用。

```ts [nitro.config.ts]
import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  database: {
    default: {
      connector: "postgresql",
      options: {
        url: "postgresql://username:password@hostname:port/database_name"
      }
    }
  },
  devDatabase: {
    default: {
      connector: "sqlite",
      options: { name: "dev-db" }
    }
  }
});
```

<tip>

当启用 `experimental.database` 且未提供 `database` 或 `devDatabase` 配置时，Nitro 会自动配置默认的 SQLite 连接。在开发模式下，数据相对于项目根目录存储。在 Node.js 生产环境中，它使用默认的 SQLite 路径。

</tip>

## 连接器

Nitro 支持所有 [db0 连接器](https://db0.unjs.io/connectors)。数据库配置中的 `connector` 字段接受以下任意值：

<table>
<thead>
  <tr>
    <th>
      连接器
    </th>
    
    <th>
      描述
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        sqlite
      </code>
    </td>
    
    <td>
      Node.js 内置 SQLite（<code>
        node-sqlite
      </code>
      
       的别名）
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        node-sqlite
      </code>
    </td>
    
    <td>
      Node.js 内置 SQLite
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        better-sqlite3
      </code>
    </td>
    
    <td>
      <a href="https://github.com/WiseLibs/better-sqlite3" rel="nofollow">
        better-sqlite3
      </a>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        sqlite3
      </code>
    </td>
    
    <td>
      <a href="https://github.com/TryGhost/node-sqlite3" rel="nofollow">
        sqlite3
      </a>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        bun
      </code>
      
       / <code>
        bun-sqlite
      </code>
    </td>
    
    <td>
      Bun 内置 SQLite
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        libsql
      </code>
      
       / <code>
        libsql-node
      </code>
    </td>
    
    <td>
      <a href="https://github.com/tursodatabase/libsql" rel="nofollow">
        libSQL
      </a>
      
       (Node.js)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        libsql-http
      </code>
    </td>
    
    <td>
      通过 HTTP 的 libSQL
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        libsql-web
      </code>
    </td>
    
    <td>
      适用于 Web 环境的 libSQL
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        postgresql
      </code>
    </td>
    
    <td>
      <a href="https://github.com/porsager/postgres" rel="nofollow">
        PostgreSQL
      </a>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        mysql2
      </code>
    </td>
    
    <td>
      <a href="https://github.com/sidorares/node-mysql2" rel="nofollow">
        MySQL
      </a>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        pglite
      </code>
    </td>
    
    <td>
      <a href="https://github.com/electric-sql/pglite" rel="nofollow">
        PGlite
      </a>
      
      （嵌入式 PostgreSQL）
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        planetscale
      </code>
    </td>
    
    <td>
      <a href="https://github.com/planetscale/database-js" rel="nofollow">
        PlanetScale
      </a>
      
       无服务器
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        cloudflare-d1
      </code>
    </td>
    
    <td>
      <a href="https://developers.cloudflare.com/d1/" rel="nofollow">
        Cloudflare D1
      </a>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        cloudflare-hyperdrive-mysql
      </code>
    </td>
    
    <td>
      Cloudflare Hyperdrive 与 MySQL
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        cloudflare-hyperdrive-postgresql
      </code>
    </td>
    
    <td>
      Cloudflare Hyperdrive 与 PostgreSQL
    </td>
  </tr>
</tbody>
</table>
