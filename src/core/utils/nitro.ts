import type { Nitro } from "nitropack/types";
import { upperFirst } from "scule";

export function nitroServerName(nitro: Nitro) {
  return nitro.options.framework.name === "nitro"
    ? "Nitro Server"
    : `${upperFirst(nitro.options.framework.name as string)} Nitro server`;
}
