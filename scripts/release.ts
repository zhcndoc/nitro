#!/bin/env node
import { execSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { parseArgs } from "node:util";

const { values: args } = parseArgs({
  allowNegative: true,
  options: {
    tests: { type: "boolean", default: true },
  },
});

const c = {
  cyan: (s: string) => `\x1B[36m${s}\x1B[0m`,
  green: (s: string) => `\x1B[32m${s}\x1B[0m`,
  red: (s: string) => `\x1B[31m${s}\x1B[0m`,
  bold: (s: string) => `\x1B[1m${s}\x1B[0m`,
  gray: (s: string) => `\x1B[90m${s}\x1B[0m`,
};

function run(cmd: string, opts?: { silent?: boolean }) {
  console.log(c.gray(`$ ${cmd}`));
  return execSync(cmd, {
    stdio: opts?.silent ? "pipe" : "inherit",
    encoding: "utf8",
  });
}

async function main() {
  console.log(c.bold("\n🚀 Nitro Release\n"));

  // 1. Build and Test
  if (!args.tests) {
    console.log(c.gray("→ Skipping build/tests (--no-tests)\n"));
  } else {
    console.log(c.cyan("\n→ Building...\n"));
    run("pnpm build");
    console.log(c.cyan("→ Running tests...\n"));
    run("pnpm test");
  }

  // 2. Bump version
  console.log(c.cyan("\n→ Bumping version...\n"));
  run("node scripts/bump-version.ts");

  // 3. Read new version
  const pkg = JSON.parse(await readFile("package.json", "utf8"));
  const version = `v${pkg.version}`;
  console.log(c.cyan(`\n→ Version: ${c.bold(version)}\n`));

  // 4. Generate release notes
  console.log(c.cyan("→ Generating release notes...\n"));
  run("pnpx changelogen --output CHANGELOG.md");
  console.log(c.green("  Written to CHANGELOG.md"));

  // 5. Commit and tag
  console.log(c.cyan("\n→ Creating release commit and tag...\n"));
  run("git add package.json CHANGELOG.md");
  run(`git commit -m "${version}"`);
  run(`git tag -a ${version} -m "${version}"`);

  console.log(c.green(c.bold(`\n✅ Release ${version} prepared!\n`)));

  // Prompt to push
  process.stdout.write(c.cyan(`  Push with ${c.bold("git push --follow-tags")}? (yes/no) `));
  const answer = await new Promise<string>((resolve) => {
    process.stdin.setEncoding("utf8");
    process.stdin.once("data", (data) => resolve(data.toString().trim()));
  });
  if (answer === "yes") {
    run("git push --follow-tags");
    console.log(c.green(c.bold("\n🎉 Released!\n")));
  } else {
    console.log(c.cyan(`\n  Run ${c.bold("git push --follow-tags")} manually to publish.\n`));
  }
}

main().catch((error) => {
  console.error(c.red(`\nError: ${error.message}\n`));
  process.exit(1);
});
