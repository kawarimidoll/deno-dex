import {
  basename,
  bold,
  brightBlue,
  brightGreen,
  dirname,
  ensureDir,
  getDenoDir,
  join,
  parseCliArgs,
  red,
  resolve,
} from "./deps.ts";

const DENO_DIR = await getDenoDir();
const DEX_SCRIPT_PATH = join(DENO_DIR, "dex/script.ts");
const VERSION = "0.1.0";
const versionInfo = `dex ${VERSION}`;

const helpMsg = `${versionInfo}
An easy deno runner for development.

Repository: https://github.com/kawarimidoll/deno-dex

EXAMPLE:
  dex hello.ts

USAGE:
  dex [OPTIONS] <FILENAME>

OPTIONS:
  -v, --version           Show the version number.
  -h, --help              Show the help message.
  -c, --clear             Clear console when restarting process.
  -q, --quiet             Suppress console messages of dex.
  -w, --watch <filenames> Watch the given files. Comma-separated list is allowed.

ARGS:
  <FILENAME>              The file to run or test.`;

function cliError(message: string) {
  console.error(`${bold(red("error"))}: ${message}

    USAGE:
      dex [OPTIONS] <FILENAME>

    For more information try --help`.replace(/^ {4}/, ""));
  Deno.exit(1);
}

const {
  "_": args,
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
      c: "clear",
      h: "help",
      q: "quiet",
      v: "version",
      w: "watch",
    },
    unknown: (arg: string, key?: string) => {
      if (key) {
        cliError(`Found argument '${arg}' which wasn't expected`);
      }
    },
  },
);

const debugLog = debug
  ? (...args: unknown[]) => console.debug(brightGreen("Debug"), ...args)
  : () => {};

debugLog({
  args,
  clear,
  debug,
  help,
  quiet,
  version,
  watch,
});

if (!args[0]) {
  cliError("Filename is required as argument");
} else if (args.length > 1) {
  cliError("Too many arguments found");
}

if (version) {
  console.log(versionInfo);
  Deno.exit(0);
}
if (help) {
  console.log(helpMsg);
  Deno.exit(0);
}

const fileFullPath = resolve(Deno.cwd(), `${args[0]}`);

const options = [
  "--allow-all",
  "--no-check",
  "--unstable",
  "--watch",
];
if (quiet) {
  options.push("--quiet");
}
const dexScript = (clear ? "console.clear();" : "") +
  `import("${fileFullPath}")`;

await ensureDir(dirname(DEX_SCRIPT_PATH));
await Deno.writeTextFile(DEX_SCRIPT_PATH, dexScript);
debugLog({ dexScript });

const cmd = [
  "deno",
  /^(.*[._])?test\.m?[tj]sx?$/.test(basename(fileFullPath)) ? "test" : "run",
  ...options,
  DEX_SCRIPT_PATH,
];
debugLog({ cmd });

let process = Deno.run({ cmd });
process.status();

// [Build a live reloader and explore Deno! 🦕 - DEV Community](https://dev.to/otanriverdi/let-s-explore-deno-by-building-a-live-reloader-j47)
if (watch) {
  // https://github.com/denoland/deno/blob/0ec151b8cb2a92bb1765672fa15de23e6c8842d4/cli/file_watcher.rs#L32
  const DEBOUNCE_INTERVAL = 200;

  let reloading = false;
  for await (const event of Deno.watchFs(watch.split(","))) {
    if (event.kind !== "modify" || reloading) {
      continue;
    }
    reloading = true;

    if (!quiet) {
      console.log(brightBlue("Watcher"), "File change detected! Restarting!");
    }

    try {
      process.kill("SIGTERM");
    } catch (error) {
      if (error.message !== "ESRCH: No such process") {
        throw error;
      }
    }

    process.close();
    process = Deno.run({ cmd });
    process.status();

    setTimeout(() => (reloading = false), DEBOUNCE_INTERVAL);
  }
}
