import type { Nitro, RollupConfig } from "nitro/types";
import type { RollupWatcher } from "rollup";
import { watch as chokidarWatch } from "chokidar";
import { watch } from "node:fs";
import defu from "defu";
import { join } from "pathe";
import { debounce } from "perfect-debounce";
import { scanHandlers } from "../../scan";
import { nitroServerName } from "../../utils/nitro";
import { formatRollupError } from "./error";
import { writeTypes } from "../types";

export async function watchDev(nitro: Nitro, rollupConfig: RollupConfig) {
  const rollup = await import("rollup");

  let rollupWatcher: RollupWatcher;

  async function load() {
    if (rollupWatcher) {
      await rollupWatcher.close();
    }
    await scanHandlers(nitro);
    nitro.routing.sync();
    rollupWatcher = startRollupWatcher(nitro, rollupConfig);
    await writeTypes(nitro);
  }
  const reload = debounce(load);

  const scanDirs = nitro.options.scanDirs.flatMap((dir) => [
    join(dir, nitro.options.apiDir || "api"),
    join(dir, nitro.options.routesDir || "routes"),
    join(dir, "middleware"),
    join(dir, "plugins"),
    join(dir, "modules"),
  ]);

  const watchReloadEvents = new Set(["add", "addDir", "unlink", "unlinkDir"]);
  const scanDirsWatcher = chokidarWatch(scanDirs, {
    ignoreInitial: true,
  }).on("all", (event, path, stat) => {
    if (watchReloadEvents.has(event)) {
      reload();
    }
  });

  const srcDirWatcher = watch(
    nitro.options.srcDir,
    { persistent: false },
    (_event, filename) => {
      if (filename && /^server\.[mc]?[jt]sx?$/.test(filename)) {
        reload();
      }
    }
  );

  nitro.hooks.hook("close", () => {
    rollupWatcher.close();
    scanDirsWatcher.close();
    srcDirWatcher.close();
  });

  nitro.hooks.hook("rollup:reload", () => reload());

  await load();

  function startRollupWatcher(nitro: Nitro, rollupConfig: RollupConfig) {
    const watcher = rollup.watch(
      defu(rollupConfig, {
        watch: {
          chokidar: nitro.options.watchOptions,
        },
      })
    );
    let start: number;

    watcher.on("event", (event) => {
      // START > BUNDLE_START > BUNDLE_END > END
      // START > BUNDLE_START > ERROR > END
      switch (event.code) {
        case "START": {
          start = Date.now();
          nitro.hooks.callHook("dev:start");
          break;
        }
        case "BUNDLE_END": {
          nitro.hooks.callHook("compiled", nitro);
          if (nitro.options.logging.buildSuccess) {
            nitro.logger.success(
              `${nitroServerName(nitro)} built with rollup`,
              start ? `in ${Date.now() - start}ms` : ""
            );
          }
          nitro.hooks.callHook("dev:reload");
          break;
        }
        case "ERROR": {
          nitro.logger.error(formatRollupError(event.error));
          nitro.hooks.callHook("dev:error", event.error);
        }
      }
    });

    return watcher;
  }
}
