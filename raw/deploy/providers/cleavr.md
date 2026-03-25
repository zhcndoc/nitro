# Cleavr

> 将 Nitro 应用部署到 Cleavr。

**预设：** `cleavr`

<read-more title="cleavr.io" to="https://cleavr.io">



</read-more>

<note>

与此提供方的集成可以通过[零配置](/deploy/#zero-config-providers)实现。

</note>

## 设置你的 Web 应用

在你的项目中，将 Nitro 预设设置为 `cleavr`。

```js
export default {
  nitro: {
    preset: 'cleavr'
  }
}
```

将更改推送到你的代码仓库。

**在你的 Cleavr 面板中：**

<steps level="4">

#### 置备一台新服务器

#### 添加一个网站，选择 **Nuxt 3** 作为应用类型

#### 在 Web 应用 > 设置 > 代码仓库中，指向你项目的代码仓库

</steps>

一切就绪，现在可以部署你的项目了！
