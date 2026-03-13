This example implements a simple chat room using WebSockets. Clients connect, send messages, and receive messages from other users in real-time. The server broadcasts messages to all connected clients using pub/sub channels.

## WebSocket 处理器

使用 `defineWebSocketHandler` 创建一个 WebSocket 路由。

```ts [routes/_ws.ts]
import { defineWebSocketHandler } from "nitro";

export default defineWebSocketHandler({
  open(peer) {
    peer.send({ user: "server", message: `欢迎 ${peer}!` });
    peer.publish("chat", { user: "server", message: `${peer} 加入了！` });
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
    peer.publish("chat", { user: "server", message: `${peer} 离开了！` });
  },
});
```

Different hooks are exposed by `defineWebSocketHandler()` to integrate with different parts of the websocket lifecycle.
