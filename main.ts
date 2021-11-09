import { basename, bold, parseCliArgs, red, resolve } from "./deps.ts";

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
  -q, --quiet             Suppress console messages of dex.

ARGS:
  <FILENAME>              The file to run or test.`;

const {
  "_": args,
  help,
  quiet,
  version,
} = parseCliArgs(
  Deno.args,
  {
    boolean: [
      "help",
      "quiet",
      "version",
    ],
    alias: {
      h: "help",
      q: "quiet",
      v: "version",
    },
  },
);

function cliError(message: string) {
  const errorMsg = `${message}

USAGE:
  dex [OPTIONS] <FILENAME>

For more information try --help`;

  console.error(bold(red("error")) + ":", errorMsg);
}

if (!args[0]) {
  cliError("Filename is required as argument.");
  Deno.exit(1);
} else if (args.length > 1) {
  cliError("Too many arguments found.");
  Deno.exit(1);
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
const filename = basename(fileFullPath);

const options = [
  "--allow-all",
  "--no-check",
  "--unstable",
  "--watch",
];
if (quiet) {
  options.push("--quiet");
}

const cmd = [
  "deno",
  /^(.*[._])?test\.m?[tj]sx?$/.test(filename) ? "test" : "run",
  ...options,
  fileFullPath,
];

const process = Deno.run({ cmd });
process.status();
