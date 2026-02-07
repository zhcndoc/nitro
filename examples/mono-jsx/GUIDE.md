## 服务器入口

```tsx [server.tsx]
export default () => (
  <html>
    <h1>Nitro + mongo-jsx 工作正常！</h1>
  </html>
);
```

Nitro 会自动检测 `server.tsx` 并使用 mono-jsx 将 JSX 转换为 HTML。导出一个返回 JSX 的函数，Nitro 会将渲染后的 HTML 作为响应发送。