## WebSocket 处理器

使用 `defineWebSocketHandler` 创建一个 WebSocket 路由。

```ts [routes/_ws.ts]
import { defineWebSocketHandler } from "nitro";

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
      peer.send(msg); // echo
      peer.publish("chat", msg);
    }
  },
  close(peer) {
    peer.publish("chat", { user: "server", message: `${peer} left!` });
  },
});
```

`defineWebSocketHandler()` 会暴露不同的钩子，以便集成到 WebSocket 生命周期的不同部分。
