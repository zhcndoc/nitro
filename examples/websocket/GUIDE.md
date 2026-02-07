此示例使用 WebSockets 实现了一个简单的聊天室。客户端连接后，可以发送消息，并实时接收其他用户的消息。服务器使用发布/订阅通道向所有已连接的客户端广播消息。

## WebSocket 处理器

使用 `defineWebSocketHandler` 创建一个 WebSocket 路由。

```ts [routes/_ws.ts]
import { defineWebSocketHandler } from "nitro/h3";

export default defineWebSocketHandler({
  open(peer) {
    peer.send({ user: "server", message: `Welcome ${peer}!` });
    peer.publish("chat", { user: "server", message: `${peer} joined!` });
    peer.subscribe("chat");
  },
  message(peer, message) {
    if (message.text().includes("ping")) {
      peer.send({ user: "server", message: "pong" });
    } else {
      const msg = {
        user: peer.toString(),
        message: message.toString(),
      };
      peer.send(msg); // 回显
      peer.publish("chat", msg);
    }
  },
  close(peer) {
    peer.publish("chat", { user: "server", message: `${peer} left!` });
  },
});
```

`defineWebSocketHandler()` 暴露了不同的钩子，用于集成 WebSocket 生命周期的不同部分。