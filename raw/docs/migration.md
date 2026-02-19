# 迁移指南

> 

<note>

这是一个关于从 Nitro 2 迁移到 3 的活文档。在使用测试版时请定期检查。

</note>

Nitro v3 引入了故意的不向后兼容的更改。本指南帮助您从 Nitro v2 迁移。

## `nitropack` 重命名为 `nitro`

NPM 包 [nitropack](https://www.npmjs.com/package/nitropack)（v2）已更名为 [nitro](https://www.npmjs.com/package/nitro)（v3）。

**迁移：** 在 `package.json` 中更新 `nitropack` 依赖为 `nitro`：

<note>

目前只提供夜间版本。

</note>

```diff [nightly channel]
{
  "dependencies": {
--    "nitropack": "latest"
++    "nitro": "npm:nitro-nightly"
  }
}
```

**迁移：** 在您的代码库中搜索并将所有 `nitropack` 实例重命名为 `nitro`：

```diff
-- import { defineNitroConfig } from "nitropack/config"
++ import { defineNitroConfig } from "nitro/config"
```

## nitro/runtime

运行时工具已被移至各自的 `nitro/*` 子路径导出。请参考文档以了解用法。

```diff
-- import { useStorage } from "nitropack/runtime/storage"
++ import { useStorage } from "nitro/storage"
```

## 最低支持的 Node.js 版本：20

Nitro 现在要求最低 Node.js 版本为 20，因为 Node.js 18 将在 [2025 年 4 月](https://node.zhcndoc.com/zh-cn/about/previous-releases) 达到生命周期结束。

请升级到 [最新的 LTS](https://node.zhcndoc.com/zh-cn/download) 版本（>= 20）。

**迁移：**

- 使用 `node --version` 检查您的本地 Node.js 版本，如有必要请更新。
- 如果您使用 CI/CD 系统进行部署，请确保您的管道正在运行 Node.js 20 或更高版本。
- 如果您的托管提供商管理 Node.js 运行时，请确保它设置为版本 20、22 或更高。

## 类型导入

Nitro 类型现在仅从 `nitro/types` 导出。

**迁移：** 从 `nitro/types` 导入类型，而不是从 `nitro`：

```diff
-- import { NitroRuntimeConfig } from "nitropack"
++ import { NitroRuntimeConfig } from "nitro/types"
```

## 应用配置支持已移除

Nitro v2 支持一个捆绑的应用配置，可以在 `app.config.ts` 中定义配置，并通过 `useAppConfig()` 在运行时访问它们。

此功能已被移除。

**迁移：**

在您的服务器目录中使用常规的 `.ts` 文件并直接导入。

## 预设更新

Nitro 预设已更新以确保与最新版本兼容。

一些（遗留）预设已被移除或重命名。

<table>
<thead>
  <tr>
    <th>
      旧预设
    </th>
    
    <th>
      新预设
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        node
      </code>
    </td>
    
    <td>
      <code>
        node-middleware
      </code>
      
      （导出更改为 <code>
        middleware
      </code>
      
      ）
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        cloudflare
      </code>
      
      , <code>
        cloudflare_worker
      </code>
      
      , <code>
        cloudflare_module_legacy
      </code>
    </td>
    
    <td>
      <code>
        cloudflare_module
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        deno-server-legacy
      </code>
    </td>
    
    <td>
      <code>
        deno_server
      </code>
      
      ，使用 Deno v2
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        netlify-builder
      </code>
    </td>
    
    <td>
      <code>
        netlify_functions
      </code>
      
       或 <code>
        netlify_edge
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        vercel-edge
      </code>
    </td>
    
    <td>
      <code>
        vercel
      </code>
      
      ，启用 Fluid 计算
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        azure
      </code>
      
      , <code>
        azure_functions
      </code>
    </td>
    
    <td>
      <code>
        azure_swa
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        firebase
      </code>
    </td>
    
    <td>
      <code>
        firebase-functions
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        iis
      </code>
    </td>
    
    <td>
      <code>
        iis-handler
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        deno
      </code>
    </td>
    
    <td>
      <code>
        deno-deploy
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        edgio
      </code>
    </td>
    
    <td>
      已停产
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        cli
      </code>
    </td>
    
    <td>
      因使用不足而移除
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        service_worker
      </code>
    </td>
    
    <td>
      因不稳定性而移除
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        firebase
      </code>
    </td>
    
    <td>
      使用新的 Firebase 应用托管
    </td>
  </tr>
</tbody>
</table>

## 移除的子路径导出

Nitro v2 引入了多个子路径导出，其中一些已被移除或更新：

- `nitro/rollup`、`nitropack/core`（请使用 `nitro/builder`）
- `nitropack/runtime/*`（请使用 `nitro/*`）
- `nitropack/kit`（已移除）
- `nitropack/presets`（已移除）

曾经引入了一个实验性的 `nitropack/kit`，但现在已经被移除。未来可能会推出一个独立的 Nitro Kit 包，并且目标会更加明确。

**Migration:**

- 使用来自 `nitro/types` 的 `NitroModule`，而不是来自 kit 的 `defineNitroModule`。
- 优先使用内置的 Nitro 预设（外部预设仅供评估使用）。

## 可选钩子

如果您之前在 Nitro 插件外部使用过 `useNitroApp().hooks`，它可能为 undefined。请使用新的 `useNitroHooks()` 来保证获得实例。
