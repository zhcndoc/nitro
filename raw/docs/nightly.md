# 夜间通道

> Nitro 有一个夜间发布通道，对于每次对 main 分支的提交会自动发布，以尝试最新的更改。

您可以通过更新 `package.json` 来选择加入夜间发布通道：

```json
{
  "devDependencies": {
    "nitro": "npm:nitro-nightly@latest"
  }
}
```

```diff [Nuxt]
{
  "devDependencies": {
-    "nuxt": "^3.0.0"
+    "nuxt": "npm:nuxt-nightly@latest"
  }
}
```

::

<note>

如果您正在使用 Nuxt，[请使用 Nuxt 夜间通道](https://nuxt.zhcndoc.com/docs/guide/going-further/nightly-release-channel#opting-in)，因为它已经包含 `nitropack-nightly`。

</note>

删除锁文件（`package-lock.json`、`yarn.lock`、`pnpm-lock.yaml`、`bun.lock` 或 `bun.lockb`）并重新安装依赖项。

<important>

在单仓库中使用 **Bun 作为包管理器** 时，需要确保 nitro 包被正确提升。

<br />

```toml [bunfig.toml]
[install]
publicHoistPattern = ["nitro*"]
```

</important>

<important>

避免使用 `<npm|pnpm|yarn|bun|deno> install nitro-nightly`；这样安装不正确。
如果遇到问题，请删除 `node_modules` 和锁文件，然后按照以上步骤操作。

</important>
