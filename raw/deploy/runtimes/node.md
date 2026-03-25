# Node.js

> 使用 Node.js 运行时运行 Nitro 应用。

**预设：** `node_server`

Node.js 是生产构建的默认 Nitro 输出预设，且 Nitro 原生支持 Node.js 运行时。

使用 Nitro CLI 构建项目：

```bash
nitro build
```

当使用 Node 服务器预设运行 `nitro build` 时，结果将是一个启动即可运行的 Node 服务器的入口点。要试运行输出：

```bash
$ node .output/server/index.mjs
Listening on http://localhost:3000
```

你现在可以将完全独立的 `.output` 目录部署到你选择的托管服务上。

### 环境变量

你可以使用以下环境变量自定义服务器行为：

- `NITRO_PORT` 或 `PORT`（默认为 `3000`）
- `NITRO_HOST` 或 `HOST`
- `NITRO_UNIX_SOCKET` - 如果提供（指向所需套接字文件的路径），服务将通过提供的 UNIX 套接字提供服务。
- `NITRO_SSL_CERT` 和 `NITRO_SSL_KEY` - 如果两者都存在，这将以 HTTPS 模式启动服务器。在绝大多数情况下，除了测试之外不应使用此功能，Nitro 服务器应该运行在像 nginx 或 Cloudflare 这样的反向代理后面，由它们来终止 SSL。
- `NITRO_SHUTDOWN_DISABLED` - 当设置为 `'true'` 时禁用优雅关闭功能。如果设置为 `'true'`，将绕过优雅关闭以加快开发过程。默认为 `'false'`。
- `NITRO_SHUTDOWN_SIGNALS` - 允许你指定应处理哪些信号。每个信号应以空格分隔。默认为 `'SIGINT SIGTERM'`。
- `NITRO_SHUTDOWN_TIMEOUT` - 设置在强制关闭前的时间（以毫秒为单位）。默认为 `'30000'` 毫秒。
- `NITRO_SHUTDOWN_FORCE` - 当设置为 true 时，在关闭过程结束时触发 `process.exit()`。如果设置为 `'false'`，进程将只是让事件循环清空。默认为 `'true'`。

## 集群模式

**预设：** `node_cluster`

为了获得更好的性能并利用多核处理能力，你可以使用集群预设。

### 环境变量

除了 `node_server` 预设的环境变量外，你还可以自定义行为：

- `NITRO_CLUSTER_WORKERS`：集群工作进程数（默认为可用的 CPU 核心数）

## 处理器（高级）

**预设：** `node_middleware`

Nitro 还有一个更低级的预设，直接导出一个可用于自定义服务器的中间件。

当使用 Node 中间件预设运行 `nitro build` 时，结果将是一个导出中间件处理程序的入口点。

**示例：**

```js
import { createServer } from 'node:http'
import { listener } from './.output/server'

const server = createServer(listener)
server.listen(8080)
```
