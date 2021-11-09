import { basename, parseCliArgs, resolve } from "./deps.ts";

const VERSION = "0.1.0";
const versionInfo = `dex ${VERSION}`;

const helpMsg = `${versionInfo}
An easy deno runner for development.`;

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
