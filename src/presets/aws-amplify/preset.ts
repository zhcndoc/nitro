import { defineNitroPreset } from "../_utils/preset";
import { writeAmplifyFiles } from "./utils";

export type { AWSAmplifyOptions as PresetOptions } from "./types";

const awsAmplify = defineNitroPreset(
  {
    entry: "./runtime/aws-amplify",
    serveStatic: true,
    output: {
      dir: "{{ rootDir }}/.amplify-hosting",
      serverDir: "{{ output.dir }}/compute/default",
      publicDir: "{{ output.dir }}/static{{ baseURL }}",
    },
    commands: {
      preview: "node ./compute/default/server.js",
    },
    hooks: {
      async compiled(nitro) {
        await writeAmplifyFiles(nitro);
      },
    },
  },
  {
    name: "aws-amplify" as const,
    stdName: "aws_amplify",
    url: import.meta.url,
  }
);

export default [awsAmplify] as const;
