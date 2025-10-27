import type { IncomingMessage, OutgoingMessage } from "node:http";
import type { Duplex } from "node:stream";
import type { FSWatcher } from "chokidar";
import type { ServerOptions, Server } from "srvx";
import { NodeDevWorker } from "./worker";
import type { DevWorkerData } from "./worker";
import type {
  DevMessageListener,
  DevRPCHooks,
  DevWorker,
  Nitro,
  NitroBuildInfo,
  WorkerAddress,
} from "nitro/types";

import { HTTPError } from "h3";

import { version as nitroVersion } from "nitro/meta";
import consola from "consola";
import { writeFile } from "node:fs/promises";
import { resolve } from "pathe";
import { watch } from "chokidar";
import { serve } from "srvx/node";
import { debounce } from "perfect-debounce";
import { isTest, isCI } from "std-env";
import { NitroDevApp } from "./app";

export function createDevServer(nitro: Nitro): NitroDevServer {
  return new NitroDevServer(nitro);
}

export class NitroDevServer extends NitroDevApp implements DevRPCHooks {
  #entry: string;
  #workerData: DevWorkerData = {};
  #listeners: Server[] = [];
  #watcher?: FSWatcher;
  #workers: DevWorker[] = [];
  #workerIdCtr: number = 0;
  #workerError?: unknown;
  #building?: boolean = true; // Assume initial build will start soon
  #buildError?: unknown;
  #messageListeners: Set<DevMessageListener> = new Set();

  constructor(nitro: Nitro) {
    super(nitro, async (event) => {
      const worker = await this.#getWorker();
      if (!worker) {
        return this.#generateError();
      }
      return worker.fetch(event.req as Request);
    });

    // Bind all methods to `this`
    for (const key of Object.getOwnPropertyNames(NitroDevServer.prototype)) {
      const value = (this as any)[key];
      if (typeof value === "function" && key !== "constructor") {
        (this as any)[key] = value.bind(this);
      }
    }

    this.#entry = resolve(
      nitro.options.output.dir,
      nitro.options.output.serverDir,
      "index.mjs"
    );

    nitro.hooks.hook("close", () => this.close());

    nitro.hooks.hook("dev:start", () => {
      this.#building = true;
      this.#buildError = undefined;
    });

    nitro.hooks.hook("dev:reload", (payload) => {
      this.#buildError = undefined;
      this.#building = false;
      if (payload?.entry) {
        this.#entry = payload.entry;
      }
      if (payload?.workerData) {
        this.#workerData = payload.workerData;
      }
      this.reload();
    });

    nitro.hooks.hook("dev:error", (cause: unknown) => {
      this.#buildError = cause;
      this.#building = false;
      for (const worker of this.#workers) {
        worker.close();
      }
    });

    if (nitro.options.devServer.watch.length > 0) {
      const debouncedReload = debounce(() => this.reload());
      this.#watcher = watch(
        nitro.options.devServer.watch,
        nitro.options.watchOptions
      );
      this.#watcher.on("add", debouncedReload).on("change", debouncedReload);
    }
  }

  // #region Public Methods

  async upgrade(
    req: IncomingMessage,
    socket: OutgoingMessage<IncomingMessage> | Duplex,
    head: any
  ) {
    const worker = await this.#getWorker();
    if (!worker) {
      throw new HTTPError({
        status: 503,
        statusText: "No worker available.",
      });
    }
    return worker.upgrade(req, socket, head);
  }

  listen(opts?: Partial<Omit<ServerOptions, "fetch">>): Server {
    const server = serve({
      ...opts,
      fetch: this.fetch,
    });
    this.#listeners.push(server);
    if (server.node?.server) {
      server.node.server.on("upgrade", (req, sock, head) =>
        this.upgrade(req, sock, head)
      );
    }
    return server;
  }

  async close() {
    await Promise.all(
      [
        Promise.all(this.#listeners.map((l) => l.close())).then(() => {
          this.#listeners = [];
        }),
        Promise.all(this.#workers.map((w) => w.close())).then(() => {
          this.#workers = [];
        }),
        Promise.resolve(this.#watcher?.close()).then(() => {
          this.#watcher = undefined;
        }),
      ].map((p) =>
        p.catch((error) => {
          consola.error(error);
        })
      )
    );
  }

  reload() {
    for (const worker of this.#workers) {
      worker.close();
    }
    const worker = new NodeDevWorker({
      name: `Nitro_${this.#workerIdCtr++}`,
      entry: this.#entry,
      data: {
        ...this.#workerData,
        globals: {
          __NITRO_RUNTIME_CONFIG__: this.nitro.options.runtimeConfig,
          ...this.#workerData.globals,
        },
      },
      hooks: {
        onClose: (worker, cause) => {
          this.#workerError = cause;
          const index = this.#workers.indexOf(worker);
          if (index !== -1) {
            this.#workers.splice(index, 1);
          }
        },
        onReady: (worker, addr) => {
          this.#writeBuildInfo(worker, addr);
        },
      },
    });
    if (!worker.closed) {
      for (const listener of this.#messageListeners) {
        worker.onMessage(listener);
      }
      this.#workers.unshift(worker);
    }
  }

  sendMessage(message: unknown) {
    for (const worker of this.#workers) {
      if (!worker.closed) {
        worker.sendMessage(message);
      }
    }
  }

  onMessage(listener: DevMessageListener) {
    this.#messageListeners.add(listener);
    for (const worker of this.#workers) {
      worker.onMessage(listener);
    }
  }

  offMessage(listener: DevMessageListener) {
    this.#messageListeners.delete(listener);
    for (const worker of this.#workers) {
      worker.offMessage(listener);
    }
  }

  // #endregion

  // #region Private Methods

  #writeBuildInfo(_worker: DevWorker, addr?: WorkerAddress) {
    const buildInfoPath = resolve(this.nitro.options.buildDir, "nitro.json");
    const buildInfo: NitroBuildInfo = {
      date: new Date().toJSON(),
      preset: this.nitro.options.preset,
      framework: this.nitro.options.framework,
      versions: {
        nitro: nitroVersion,
      },
      dev: {
        pid: process.pid,
        workerAddress: addr,
      },
    };
    writeFile(buildInfoPath, JSON.stringify(buildInfo, null, 2)).catch(
      (error) => {
        consola.error(error);
      }
    );
  }

  async #getWorker() {
    let retry = 0;
    const maxRetries = isTest || isCI ? 100 : 10;
    while (this.#building || ++retry < maxRetries) {
      if ((this.#workers.length === 0 || this.#buildError) && !this.#building) {
        return;
      }
      const activeWorker = this.#workers.find((w) => w.ready);
      if (activeWorker) {
        return activeWorker;
      }
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
  }

  #generateError() {
    const error: any = this.#buildError || this.#workerError;
    if (error) {
      try {
        error.unhandled = false;
        let id = error.id || error.path;
        if (id) {
          const cause = (error as { errors?: any[] }).errors?.[0];
          const loc =
            error.location || error.loc || cause?.location || cause?.loc;
          if (loc) {
            id += `:${loc.line}:${loc.column}`;
          }
          error.stack = (error.stack || "").replace(
            /(^\s*at\s+.+)/m,
            `    at ${id}\n$1`
          );
        }
      } catch {
        // ignore
      }
      return new HTTPError(error);
    }

    return new Response(
      JSON.stringify(
        {
          error: "Dev server is unavailable.",
          hint: "Please reload the page and check the console for errors if the issue persists.",
        },
        null,
        2
      ),
      {
        status: 503,
        statusText: "Dev server is unavailable",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
          Refresh: "3",
        },
      }
    );
  }

  // #endregion
}
