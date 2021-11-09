import { basename, resolve } from "https://deno.land/std@0.113.0/path/mod.ts";

const fileFullPath = resolve(Deno.cwd(), `${Deno.args[0]}`);
const filename = basename(fileFullPath);

const cmd = [
  "deno",
  /^(.*[._])?test\.m?[tj]sx?$/.test(filename) ? "test" : "run",
  "--allow-all",
  "--no-check",
  "--unstable",
  "--watch",
  fileFullPath,
];

const process = Deno.run({ cmd });
process.status();
