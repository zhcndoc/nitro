# Nitro 预设参考

## 所有预设（31 个）

### 核心
- `_nitro/` — 内部预设（开发、预渲染、工作线程模式）
- `standard/` — 与框架无关的标准服务器
- `node/` — Node.js（服务器、中间件、集群）
- `bun/` — Bun 运行时

### 云提供商
- `aws-lambda/` — AWS Lambda
- `aws-amplify/` — AWS Amplify
- `azure/` — Azure 静态网页应用
- `cloudflare/` — Cloudflare Pages/Workers
- `deno/` — Deno 部署
- `firebase/` — Firebase 托管
- `netlify/` — Netlify 函数/边缘网络
- `vercel/` — Vercel 函数/边缘网络
- `digitalocean/` — DigitalOcean 应用平台
- `heroku/` — Heroku
- `koyeb/` — Koyeb
- `zeabur/` — Zeabur
- `render.com/` — Render
- `stormkit/` — Stormkit
- `genezio/` — Genezio
- `winterjs/` — WinterJS
- `zephyr/` — Zephyr
- `alwaysdata/`
- `cleavr/`
- `flightcontrol/`
- `iis/`
- `platform.sh/`

## 预设结构

```
presets/<name>/
├── preset.ts        # defineNitroPreset() — 配置覆盖，钩子
├── runtime/         # 运行时入口（打包到输出中）
│   └── <name>.ts    # 平台特定的请求处理器
├── types.ts         # TypeScript 类型定义（可选）
├── utils.ts         # 构建时工具（可选）
└── unenv/           # 环境 polyfill 覆盖（可选）
    ├── preset.ts
    └── node-compat.ts
```

## 创建预设

使用来自 `src/presets/_utils/preset.ts` 的 `defineNitroPreset()`：

```ts
import { defineNitroPreset } from "../_utils/preset.ts";

export default defineNitroPreset({
  // 预设元数据
  entry: "./runtime/<name>.ts",
  // Nitro 配置覆盖
  node: false,
  // 钩子
  hooks: {
    "build:before": async (nitro) => { /* ... */ },
  },
});
```

## 预设解析 (`presets/_resolve.ts`)

`resolvePreset(name, opts)` 会考虑：
- 预设名称别名
- 开发与生产模式
- 兼容日期
- 静态托管检测
- 在 `_all.gen.ts` 和 `_types.gen.ts` 中生成的映射
