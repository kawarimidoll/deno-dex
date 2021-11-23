import {
  bold,
  brightBlue,
  dirname,
  ensureDir,
  getDenoDir,
  green,
  join,
  parse,
  red,
  resolve,
} from "./deps.ts";
import {
  ensureOptsArgs,
  isDenoTest,
  runProcess,
  watchChanges,
} from "./utils.ts";
import { VERSION } from "./version.ts";

const versionInfo = `dex ${VERSION}`;

const helpMsg = `${versionInfo}
A dexterous deno executor for development

Repository: https://github.com/kawarimidoll/deno-dex

To run a script:

  dex hello.ts

To run a test:

  dex hello_test.ts

To pass arguments or options to script:

  dex hello.ts -a 1 --foo=bar baz

USAGE:
    dex [OPTIONS] <SCRIPT_ARGS>...

OPTIONS:
        --clear
        Clear console when restarting process.

    -h, --help
        Prints help information.

    -v, --version
        Prints version information.

    -w, --watch <filenames>
        Watch the given files. Comma-separated list is allowed.

    Any other options are passed to 'deno' process transparently.
    To show available options, run 'deno run --help' or 'deno test --help'.

ARGS:
    <SCRIPT_ARGS>...
        The script file path (and arguments) to run or test.`;

const errorMsg = `
USAGE:
    dex [OPTIONS] <SCRIPT_ARGS>...

For more information try --help`;

function cliError(message: string) {
  console.error(`${bold(red("error"))}: ${message}`);
  console.error(errorMsg);
  Deno.exit(1);
}

export const NEED_EQUALS = [
  "--allow-env",
  "--allow-ffi",
  "--allow-net",
  "--allow-read",
  "--allow-run",
  "--allow-write",
  "--coverage",
  "--fail-fast",
  "--inspect",
  "--inspect-brk",
  "--reload",
  "--shuffle",
  "--unsafely-ignore-certificate-errors",
  "--v8-flags",
];

export function parseCliArgs(cliArgs: string[]): {
  args: string[];
  clear: boolean;
  debug: boolean;
  help: boolean;
  quiet: boolean;
  version: boolean;
  watch: string[];
  runOptions: string[];
} {
  const runOptions = [
    "--allow-all",
    "--no-check",
    "--unstable",
    "--watch",
  ];
  const {
    _: rawArgs,
    clear,
    help,
    version,
    debug,
    quiet,
    watch,
  } = parse(
    ensureOptsArgs(cliArgs, NEED_EQUALS),
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
          ["A", "unstable"].includes(key) ||
          arg === "--no-check"
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
  if (quiet) {
    runOptions.push("--quiet");
  }

  return {
    args: rawArgs.map((rawArg) => `${rawArg}`),
    clear,
    debug,
    help,
    quiet,
    version,
    watch: watch?.split(",") || [],
    runOptions,
  };
}

async function main() {
  const {
    args,
    clear,
    debug,
    help,
    quiet,
    version,
    watch,
    runOptions,
  } = parseCliArgs(Deno.args);

  const debugLog = debug
    ? (...args: unknown[]) => console.debug(green("Debug"), ...args)
    : () => {};

  debugLog({
    args,
    clear,
    debug,
    help,
    version,
    watch,
    runOptions,
  });

  if (version) {
    console.log(versionInfo);
    Deno.exit(0);
  }
  if (help) {
    console.log(helpMsg);
    Deno.exit(0);
  }

  if (!args[0]) {
    cliError("File path is required as argument");
  }

  const fileFullPath = resolve(Deno.cwd(), args[0]);
  const dexScript = `${
    clear ? "console.clear();" : ""
  }import("${fileFullPath}")`;
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

  // wait a moment to prevent malfunction
  await new Promise((resolve) => setTimeout(resolve, 10));

  let process = runProcess({ cmd });

  if (watch[0]) {
    watchChanges(watch, (event) => {
      debugLog({ detected: event.paths[0] });
      if (!quiet) {
        console.log(brightBlue("Watcher"), "File change detected! Restarting!");
      }
      process = runProcess({ cmd, ongoingProcess: process });
    });
  }
}

if (import.meta.main) {
  main();
}
