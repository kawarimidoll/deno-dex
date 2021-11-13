import {
  bold,
  brightBlue,
  dirname,
  ensureDir,
  getDenoDir,
  green,
  join,
  parseCliArgs,
  red,
  resolve,
} from "./deps.ts";
import { isDenoTest, runProcess, watchChanges } from "./utils.ts";

const VERSION = "0.1.0";
const versionInfo = `dex ${VERSION}`;

const helpMsg = `${versionInfo}
An easy deno runner for development.

Repository: https://github.com/kawarimidoll/deno-dex

To run a script:

  dex hello.ts

To run a test:

  dex hello_test.ts

USAGE:
    dex [OPTIONS] <SCRIPT_ARG>...

OPTIONS:
    -c, --clear
        Clear console when restarting process.

    -h, --help
        Prints help information.

    -q, --quiet
        Suppress console messages of dex.

    -v, --version
        Prints version information.

    -w, --watch <filenames>
        Watch the given files. Comma-separated list is allowed.

ARGS:
    <SCRIPT_ARG>...
        The script (and arguments) to run or test.`;

const errorMsg = `
USAGE:
    dex [OPTIONS] <SCRIPT_ARG>...

For more information try --help`;

function cliError(message: string) {
  console.error(`${bold(red("error"))}: ${message}`);
  console.error(errorMsg);
  Deno.exit(1);
}

const runOptions = [
  "--allow-all",
  "--no-check",
  "--unstable",
  "--watch",
];

const {
  "_": rawArgs,
  clear,
  debug,
  help,
  quiet,
  version,
  watch,
} = parseCliArgs(
  Deno.args,
  {
    boolean: [
      "clear",
      "debug",
      "help",
      "quiet",
      "version",
    ],
    string: [
      "watch",
    ],
    alias: {
      h: "help",
      q: "quiet",
      v: "version",
      w: "watch",
    },
    stopEarly: true,
    unknown: (arg: string, key?: string, value?: unknown) => {
      // console.log({ arg, key, value, type: typeof value });
      if (
        !key || key.startsWith("allow-") ||
        ["A", "no-check", "unstable"].includes(key)
      ) {
        return;
      }

      runOptions.push(
        (arg.startsWith("--") ? "--" : "-") + key +
          (typeof value === "boolean" ? "" : "=" + value),
      );
    },
  },
);

const debugLog = debug
  ? (...args: unknown[]) => console.debug(green("Debug"), ...args)
  : () => {};

if (quiet) {
  runOptions.push("--quiet");
}
const args = rawArgs.map((rawArg) => `${rawArg}`);
debugLog({
  args,
  clear,
  debug,
  help,
  version,
  watch,
});
debugLog({ runOptions });

if (version) {
  console.log(versionInfo);
  Deno.exit(0);
}
if (help) {
  console.log(helpMsg);
  Deno.exit(0);
}

if (!args[0]) {
  cliError("Filename is required as argument");
}

const fileFullPath = resolve(Deno.cwd(), args[0]);
const dexScript = (clear ? "console.clear();" : "") +
  `import "${fileFullPath}"`;
const dexScriptPath = join(await getDenoDir(), "dex/script.ts");

await ensureDir(dirname(dexScriptPath));
await Deno.writeTextFile(dexScriptPath, dexScript);
debugLog({ dexScriptPath, dexScript });

const cmd = [
  "deno",
  isDenoTest(fileFullPath) ? "test" : "run",
  ...runOptions,
  dexScriptPath,
  ...args.slice(1),
];
debugLog({ cmd });

let process = runProcess({ cmd });

if (watch) {
  watchChanges(watch.split(","), (event) => {
    debugLog({ detected: event.paths[0] });
    if (!quiet) {
      console.log(brightBlue("Watcher"), "File change detected! Restarting!");
    }
    process = runProcess({ cmd, ongoingProcess: process });
  });
}
