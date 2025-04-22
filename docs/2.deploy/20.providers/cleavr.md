# Cleavr

> 将 Nitro 应用部署到 Cleavr。

**预设:** `cleavr`

:read-more{title="cleavr.io" to="https://cleavr.io"}

::note
与此提供商的集成可以通过 [零配置](/deploy/#zero-config-providers) 实现。
::

## 设置您的网页应用

在您的项目中，将 Nitro 预设设置为 `cleavr`。

```js
export default {
  nitro: {
    preset: 'cleavr'
  }
}
```

将更改推送到您的代码库。

**在您的 Cleavr 面板中:**

1. provision 一台新服务器
2. 添加一个网站，选择 **Nuxt 3** 作为应用类型
3. 在网页应用 > 设置 > 代码仓库，指向您项目的代码仓库

您现在已准备好部署您的项目！