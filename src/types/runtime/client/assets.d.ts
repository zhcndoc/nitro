// Based on https://github.com/hi-ogawa/vite-plugins/blob/main/packages/fullstack/types/query.d.ts

export type ImportAssetsResult = ImportAssetsResultRaw & {
  merge(...args: ImportAssetsResultRaw[]): ImportAssetsResult;
};

export type ImportAssetsResultRaw = {
  entry?: string;
  js: { href: string }[];
  css: { href: string; "data-vite-dev-id"?: string }[];
};

declare module "*?assets" {
  const assets: ImportAssetsResult;
  export default assets;
}

declare module "*?assets=client" {
  const assets: ImportAssetsResult;
  export default assets;
}

declare module "*?assets=ssr" {
  const assets: ImportAssetsResult;
  export default assets;
}
