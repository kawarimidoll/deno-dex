import {
  basename,
  bold,
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
  help,
  quiet,
  version,
} = parseCliArgs(
  Deno.args,
  {
    boolean: [
      "clear",
      "help",
      "quiet",
      "version",
    ],
    alias: {
      c: "clear",
      h: "help",
      q: "quiet",
      v: "version",
    },
    unknown: (arg: string, key?: string) => {
      if (key) {
        cliError(`Found argument '${arg}' which wasn't expected`);
      }
    },
  },
);

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

await ensureDir(dirname(DEX_SCRIPT_PATH));
await Deno.writeTextFile(
  DEX_SCRIPT_PATH,
  (clear ? "console.clear();" : "") + `import("${fileFullPath}")`,
);

const cmd = [
  "deno",
  /^(.*[._])?test\.m?[tj]sx?$/.test(basename(fileFullPath)) ? "test" : "run",
  ...options,
  DEX_SCRIPT_PATH,
];

const process = Deno.run({ cmd });
process.status();
