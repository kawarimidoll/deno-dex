const filename = `${Deno.args[0]}`;

const cmd = [
  "deno",
  /^(.*[._])?test\.m?[tj]sx?$/.test(filename) ? "test" : "run",
  "--allow-all",
  "--no-check",
  "--unstable",
  "--watch",
  filename,
];

const process = Deno.run({ cmd });
process.status();
