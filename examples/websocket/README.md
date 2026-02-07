---
category: features
icon: i-lucide-radio
---

# WebSocket

> 支持 WebSocket 的实时双向通信。

<!-- automd:ui-code-tree src="." default="routes/_ws.ts" ignore="README.md,GUIDE.md" expandAll -->

::code-tree{defaultValue="routes/_ws.ts" expandAll}

```html [index.html]
<html lang="zh" data-theme="dark">
  <head>
    <title>CrossWS 测试页面</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      body {
        background-color: #1a1a1a;
      }
    </style>
    <script type="module">
      import { createApp, reactive, nextTick } from "https://esm.sh/petite-vue@0.4.1";

      let ws;

      const store = reactive({
        message: "",
        messages: [],
      });

      const scroll = () => {
        nextTick(() => {
          const el = document.querySelector("#messages");
          el.scrollTop = el.scrollHeight;
          el.scrollTo({
            top: el.scrollHeight,
            behavior: "smooth",
          });
        });
      };

      const format = async () => {
        for (const message of store.messages) {
          if (!message._fmt && message.text.startsWith("{")) {
            message._fmt = true;
            const { codeToHtml } = await import("https://esm.sh/shiki@1.0.0");
            const str = JSON.stringify(JSON.parse(message.text), null, 2);
            message.formattedText = await codeToHtml(str, {
              lang: "json",
              theme: "dark-plus",
            });
          }
        }
      };

      const log = (user, ...args) => {
        console.log("[ws]", user, ...args);
        store.messages.push({
          text: args.join(" "),
          formattedText: "",
          user: user,
          date: new Date().toLocaleString(),
        });
        scroll();
        format();
      };

      const connect = async () => {
        const isSecure = location.protocol === "https:";
        const url = (isSecure ? "wss://" : "ws://") + location.host + "/_ws";
        if (ws) {
          log("ws", "正在关闭之前的连接后重连...");
          ws.close();
          clear();
        }

        log("ws", "正在连接到", url, "...");
        ws = new WebSocket(url);

        ws.addEventListener("message", async (event) => {
          let data = typeof event.data === "string" ? event.data : await event.data.text();
          const { user = "system", message = "" } = data.startsWith("{")
            ? JSON.parse(data)
            : { message: data };
          log(user, typeof message === "string" ? message : JSON.stringify(message));
        });

        await new Promise((resolve) => ws.addEventListener("open", resolve));
        log("ws", "已连接！");
      };

      const clear = () => {
        store.messages.splice(0, store.messages.length);
        log("system", "已清除之前的消息");
      };

      const send = () => {
        console.log("正在发送消息...");
        if (store.message) {
          ws.send(store.message);
        }
        store.message = "";
      };

      const ping = () => {
        log("ws", "发送 ping");
        ws.send("ping");
      };

      createApp({
        store,
        send,
        ping,
        clear,
        connect,
        rand: Math.random(),
      }).mount();

      await connect();
    </script>
  </head>
  <body class="h-screen flex flex-col justify-between">
    <main v-scope="{}">
      <!-- 消息 -->
      <div id="messages" class="flex-grow flex flex-col justify-end px-4 py-8">
        <div class="flex items-center mb-4" v-for="message in store.messages">
          <div class="flex flex-col">
            <p class="text-gray-500 mb-1 text-xs ml-10">{{ message.user }}</p>
            <div class="flex items-center">
              <img
                :src="'https://www.gravatar.com/avatar/' + encodeURIComponent(message.user + rand) + '?s=512&d=monsterid'"
                alt="头像"
                class="w-8 h-8 rounded-full"
              />
              <div class="ml-2 bg-gray-800 rounded-lg p-2">
                <p
                  v-if="message.formattedText"
                  class="overflow-x-scroll"
                  v-html="message.formattedText"
                ></p>
                <p v-else class="text-white">{{ message.text }}</p>
              </div>
            </div>
            <p class="text-gray-500 mt-1 text-xs ml-10">{{ message.date }}</p>
          </div>
        </div>
      </div>

      <!-- 聊天框 -->
      <div class="bg-gray-800 px-4 py-2 flex items-center justify-between fixed bottom-0 w-full">
        <div class="w-full min-w-6">
          <input
            type="text"
            placeholder="输入你的消息..."
            class="w-full rounded-l-lg px-4 py-2 bg-gray-700 text-white focus:outline-none focus:ring focus:border-blue-300"
            @keydown.enter="send"
            v-model="store.message"
          />
        </div>
        <div class="flex">
          <button class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4" @click="send">
            发送
          </button>
          <button class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4" @click="ping">
            Ping
          </button>
          <button class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4" @click="connect">
            重连
          </button>
          <button
            class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-r-lg"
            @click="clear"
          >
            清除
          </button>
        </div>
      </div>
    </main>
  </body>
</html>
`
```

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  serverDir: "./",
  renderer: { static: true },
  features: { websocket: true },
});
```

```json [package.json]
{
  "type": "module",
  "scripts": {
    "dev": "nitro dev",
    "build": "nitro build"
  },
  "devDependencies": {
    "nitro": "latest"
  }
}
```

```json [tsconfig.json]
{
  "extends": "nitro/tsconfig"
}
```

```ts [vite.config.ts]
import { defineConfig } from "vite";
import { nitro } from "nitro/vite";

export default defineConfig({ plugins: [nitro()] });
```

```ts [routes/_ws.ts]
import { defineWebSocketHandler } from "nitro/h3";

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

::

<!-- /automd -->

<!-- automd:file src="GUIDE.md" -->

此示例使用 WebSocket 实现了一个简单的聊天室。客户端连接后，可以发送消息，并实时接收其他用户的消息。服务器通过发布/订阅频道将消息广播给所有已连接客户端。

## WebSocket 处理器

使用 `defineWebSocketHandler` 创建一个 WebSocket 路由。

```ts [routes/_ws.ts]
import { defineWebSocketHandler } from "nitro/h3";

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

`defineWebSocketHandler()` 暴露了不同的钩子，用以集成 WebSocket 生命周期中的不同阶段。

<!-- /automd -->

## 了解更多

- [路由](/docs/routing)
- [crossws 文档](https://crossws.h3.dev/guide/hooks)