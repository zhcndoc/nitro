import { existsSync, promises as fsp } from "node:fs";
import { defu } from "defu";
import { genTypeImport } from "knitwork";
import {
  lookupNodeModuleSubpath,
  parseNodeModulePath,
  resolvePath,
} from "mlly";
import { isDirectory, resolveNitroPath, writeFile } from "nitropack/kit";
import { runtimeDir } from "nitropack/runtime/meta";
import type { Nitro, NitroTypes } from "nitropack/types";
import { dirname, isAbsolute, join, resolve } from "pathe";
import { relative } from "pathe";
import { resolveAlias } from "pathe/utils";
import type { TSConfig } from "pkg-types";
import { type JSValue, generateTypes, resolveSchema } from "untyped";
import { toExports } from "unimport";

export async function writeTypes(nitro: Nitro) {
  const types: NitroTypes = {
    routes: {},
  };

  const typesDir = resolve(nitro.options.buildDir, "types");

  const middleware = [...nitro.scannedHandlers, ...nitro.options.handlers];

  for (const mw of middleware) {
    if (typeof mw.handler !== "string" || !mw.route) {
      continue;
    }
    const relativePath = relative(
      typesDir,
      resolveNitroPath(mw.handler, nitro.options)
    ).replace(/\.(js|mjs|cjs|ts|mts|cts|tsx|jsx)$/, "");

    const method = mw.method || "default";

    types.routes[mw.route] ??= {};
    types.routes[mw.route][method] ??= [];
    types.routes[mw.route][method]!.push(
      `Simplify<Serialize<Awaited<ReturnType<typeof import('${relativePath}').default>>>>`
    );
  }

  let autoImportedTypes: string[] = [];
  let autoImportExports = "";

  if (nitro.unimport) {
    await nitro.unimport.init();

    // TODO: fully resolve utils exported from `#imports`

    const allImports = await nitro.unimport.getImports();

    autoImportExports = toExports(allImports).replace(
      /#internal\/nitro/g,
      relative(typesDir, runtimeDir)
    );

    const resolvedImportPathMap = new Map<string, string>();

    for (const i of allImports.filter((i) => !i.type)) {
      if (resolvedImportPathMap.has(i.from)) {
        continue;
      }
      let path = resolveAlias(i.from, nitro.options.alias);
      if (!isAbsolute(path)) {
        const resolvedPath = await resolvePath(i.from, {
          url: nitro.options.nodeModulesDirs,
        }).catch(() => null);
        if (resolvedPath) {
          const { dir, name } = parseNodeModulePath(resolvedPath);
          if (!dir || !name) {
            path = resolvedPath;
          } else {
            const subpath = await lookupNodeModuleSubpath(resolvedPath);
            path = join(dir, name, subpath || "");
          }
        }
      }
      if (existsSync(path) && !(await isDirectory(path))) {
        path = path.replace(/\.[a-z]+$/, "");
      }
      if (isAbsolute(path)) {
        path = relative(typesDir, path);
      }
      resolvedImportPathMap.set(i.from, path);
    }

    autoImportedTypes = [
      nitro.options.imports && nitro.options.imports.autoImport !== false
        ? (
            await nitro.unimport.generateTypeDeclarations({
              exportHelper: false,
              resolvePath: (i) => resolvedImportPathMap.get(i.from) ?? i.from,
            })
          ).trim()
        : "",
    ];
  }

  await nitro.hooks.callHook("types:extend", types);

  const routes = [
    "// Generated by nitro",
    'import type { Serialize, Simplify } from "nitropack/types";',
    'declare module "nitropack/types" {',
    "  type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T",
    "  interface InternalApi {",
    ...Object.entries(types.routes).map(([path, methods]) =>
      [
        `    '${path}': {`,
        ...Object.entries(methods).map(
          ([method, types]) => `      '${method}': ${types.join(" | ")}`
        ),
        "    }",
      ].join("\n")
    ),
    "  }",
    "}",
    // Makes this a module for augmentation purposes
    "export {}",
  ];

  const config = [
    "// Generated by nitro",
    `
// App Config
import type { Defu } from 'defu'

${nitro.options.appConfigFiles
  .map((file, index) =>
    genTypeImport(relative(typesDir, file).replace(/\.\w+$/, ""), [
      { name: "default", as: `appConfig${index}` },
    ])
  )
  .join("\n")}

type UserAppConfig = Defu<{}, [${nitro.options.appConfigFiles
      .map((_, index: number) => `typeof appConfig${index}`)
      .join(", ")}]>

declare module "nitropack/types" {
  interface AppConfig extends UserAppConfig {}`,
    nitro.options.typescript.generateRuntimeConfigTypes
      ? generateTypes(
          await resolveSchema(
            Object.fromEntries(
              Object.entries(nitro.options.runtimeConfig).filter(
                ([key]) => !["app", "nitro"].includes(key)
              )
            ) as Record<string, JSValue>
          ),
          {
            interfaceName: "NitroRuntimeConfig",
            addExport: false,
            addDefaults: false,
            allowExtraKeys: false,
            indentation: 2,
          }
        )
      : "",
    `}`,
    // Makes this a module for augmentation purposes
    "export {}",
  ];

  const declarations = [
    // local nitropack augmentations
    '/// <reference path="./nitro-routes.d.ts" />',
    '/// <reference path="./nitro-config.d.ts" />',
    // global server auto-imports
    '/// <reference path="./nitro-imports.d.ts" />',
  ];

  const buildFiles: { path: string; contents: string }[] = [];

  buildFiles.push({
    path: join(typesDir, "nitro-routes.d.ts"),
    contents: routes.join("\n"),
  });

  buildFiles.push({
    path: join(typesDir, "nitro-config.d.ts"),
    contents: config.join("\n"),
  });

  buildFiles.push({
    path: join(typesDir, "nitro-imports.d.ts"),
    contents: [...autoImportedTypes, autoImportExports || "export {}"].join(
      "\n"
    ),
  });

  buildFiles.push({
    path: join(typesDir, "nitro.d.ts"),
    contents: declarations.join("\n"),
  });

  if (nitro.options.typescript.generateTsConfig) {
    const tsConfigPath = resolve(
      nitro.options.buildDir,
      nitro.options.typescript.tsconfigPath
    );
    const tsconfigDir = dirname(tsConfigPath);
    const tsConfig: TSConfig = defu(nitro.options.typescript.tsConfig, {
      compilerOptions: {
        forceConsistentCasingInFileNames: true,
        strict: nitro.options.typescript.strict,
        noEmit: true,
        target: "ESNext",
        module: "ESNext",
        moduleResolution:
          nitro.options.experimental.typescriptBundlerResolution === false
            ? "Node"
            : "Bundler",
        allowJs: true,
        resolveJsonModule: true,
        jsx: "preserve",
        allowSyntheticDefaultImports: true,
        jsxFactory: "h",
        jsxFragmentFactory: "Fragment",
        paths: {
          "#imports": [
            relativeWithDot(tsconfigDir, join(typesDir, "nitro-imports")),
          ],
          "~/*": [
            relativeWithDot(
              tsconfigDir,
              join(nitro.options.alias["~"] || nitro.options.srcDir, "*")
            ),
          ],
          "@/*": [
            relativeWithDot(
              tsconfigDir,
              join(nitro.options.alias["@"] || nitro.options.srcDir, "*")
            ),
          ],
          "~~/*": [
            relativeWithDot(
              tsconfigDir,
              join(nitro.options.alias["~~"] || nitro.options.rootDir, "*")
            ),
          ],
          "@@/*": [
            relativeWithDot(
              tsconfigDir,
              join(nitro.options.alias["@@"] || nitro.options.rootDir, "*")
            ),
          ],
          ...(nitro.options.typescript.internalPaths
            ? {
                "nitropack/runtime": [
                  relativeWithDot(tsconfigDir, join(runtimeDir, "index")),
                ],
                "#internal/nitro": [
                  relativeWithDot(tsconfigDir, join(runtimeDir, "index")),
                ],
                "nitropack/runtime/*": [
                  relativeWithDot(tsconfigDir, join(runtimeDir, "*")),
                ],
                "#internal/nitro/*": [
                  relativeWithDot(tsconfigDir, join(runtimeDir, "*")),
                ],
              }
            : {}),
        },
      },
      include: [
        relativeWithDot(tsconfigDir, join(typesDir, "nitro.d.ts")).replace(
          /^(?=[^.])/,
          "./"
        ),
        join(relativeWithDot(tsconfigDir, nitro.options.rootDir), "**/*"),
        ...(nitro.options.srcDir === nitro.options.rootDir
          ? []
          : [join(relativeWithDot(tsconfigDir, nitro.options.srcDir), "**/*")]),
      ],
    });

    for (const alias in tsConfig.compilerOptions!.paths) {
      const paths = tsConfig.compilerOptions!.paths[alias];
      tsConfig.compilerOptions!.paths[alias] = await Promise.all(
        paths.map(async (path: string) => {
          if (!isAbsolute(path)) {
            return path;
          }
          const stats = await fsp
            .stat(path)
            .catch(() => null /* file does not exist */);
          return relativeWithDot(
            tsconfigDir,
            stats?.isFile()
              ? path.replace(/(?<=\w)\.\w+$/g, "") /* remove extension */
              : path
          );
        })
      );
    }

    tsConfig.include = [
      ...new Set(
        tsConfig.include!.map((p) =>
          isAbsolute(p) ? relativeWithDot(tsconfigDir, p) : p
        )
      ),
    ];
    if (tsConfig.exclude) {
      tsConfig.exclude = [
        ...new Set(
          tsConfig.exclude!.map((p) =>
            isAbsolute(p) ? relativeWithDot(tsconfigDir, p) : p
          )
        ),
      ];
    }

    buildFiles.push({
      path: tsConfigPath,
      contents: JSON.stringify(tsConfig, null, 2),
    });
  }

  await Promise.all(
    buildFiles.map(async (file) => {
      await writeFile(
        resolve(nitro.options.buildDir, file.path),
        file.contents
      );
    })
  );
}

const RELATIVE_RE = /^\.{1,2}\//;

export function relativeWithDot(from: string, to: string) {
  const rel = relative(from, to);
  return RELATIVE_RE.test(rel) ? rel : "./" + rel;
}
