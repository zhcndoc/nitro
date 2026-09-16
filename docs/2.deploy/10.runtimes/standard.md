# Standard

> 在任何运行时上运行 Nitro 应用，并使用符合 Web 标准的入口。

**Preset:** `standard`

`standard` preset 会生成可移植且与运行时无关的构建产物，并提供符合 Web 标准的入口。服务器入口默认导出一个带有 [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) 处理程序的对象，与任何支持 Web 标准服务器约定的运行时或平台兼容。

```bash
# Build with the standard preset
NITRO_PRESET=standard npm run build
```

生成的入口如下：

```js [.output/server/index.mjs]
export default {
  fetch(request) {
    // ...
  }
}
```

## 预览

你可以使用 [srvx](https://srvx.h3.dev) 在本地预览输出：

```bash
cd .output
npx srvx --prod ./
```

::note
使用此 preset 时，服务器不会提供静态资源。公共资源会输出到构建输出的 `public/` 目录中，应由托管平台或单独的静态文件服务器提供服务。
::
