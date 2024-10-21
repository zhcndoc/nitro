# Cleavr

> 将 Nitro 应用部署到 Cleavr。

**预设:** `cleavr`

:read-more{title="cleavr.io" to="https://cleavr.io"}

::note
与此提供商的集成可以通过 [零配置](/deploy/#zero-config-providers) 实现。
::

## 设置你的网络应用

在你的项目中，将 Nitro 预设设置为 `cleavr`。

```js
export default {
  nitro: {
    preset: 'cleavr'
  }
}
```

将更改推送到你的代码仓库。

**在你的 Cleavr 面板中:**

1. 配置一个新服务器
2. 添加一个网站，选择 **Nuxt 3** 作为应用类型
3. 在网络应用 > 设置 > 代码仓库，指向你的项目代码仓库

现在你可以部署你的项目了！
