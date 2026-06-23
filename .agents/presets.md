# Nitro 预设参考

## 所有预设

### 核心
- `_nitro/` — 内部预设（dev、prerender、worker 模式）
- `_static/` — 内部静态 / 仅 prerender 输出
- `standard/` — 与框架无关的标准服务器
- `node/` — Node.js（server、middleware、cluster）
- `bun/` — Bun 运行时

### 云提供商
- `aws-lambda/` — AWS Lambda
- `aws-amplify/` — AWS Amplify
- `azure/` — Azure 静态网页应用
- `cloudflare/` — Cloudflare Pages/Workers
- `deno/` — Deno Deploy
- `digitalocean/` — DigitalOcean App Platform
- `edgeone/` — 腾讯 EdgeOne
- `firebase/` — Firebase Hosting
- `genezio/` — Genezio
- `heroku/` — Heroku
- `koyeb/` — Koyeb
- `netlify/` — Netlify Functions/Edge
- `render.com/` — Render
- `stormkit/` — Stormkit
- `vercel/` — Vercel Functions/Edge
- `winterjs/` — WinterJS
- `zeabur/` — Zeabur
- `zephyr/` — Zephyr
- `zerops/` — Zerops
- `alwaysdata/`
- `cleavr/`
- `flightcontrol/`
- `iis/`
- `platform.sh/`

## 预设结构

```
presets/<name>/
├── preset.ts        # defineNitroPreset() — 配置覆盖、钩子
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
