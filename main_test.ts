import { assert, assertEquals } from "./dev_deps.ts";
import { parseCliArgs } from "./main.ts";

Deno.test("[parseCliArgs] pattern 1", () => {
  const {
    args,
    clear,
    debug,
    help,
    quiet,
    version,
    watch,
    runOptions,
  } = parseCliArgs([
    "--allow-all",
    "-q",
    "main.ts",
    "--script-flag",
    "script-arg",
  ]);

  assertEquals(args, ["main.ts", "--script-flag", "script-arg"]);
  assert([clear, debug, help, version].every((flag) => flag === false));
  assert(quiet);
  assertEquals(watch, []);
  assertEquals(runOptions, [
    "--allow-all",
    "--no-check",
    "--unstable",
    "--watch",
    "--quiet",
  ]);
});

Deno.test("[parseCliArgs] pattern 2", () => {
  const {
    args,
    clear,
    debug,
    help,
    quiet,
    version,
    watch,
    runOptions,
  } = parseCliArgs([
    "--watch=a.txt,b.txt",
    "--no-check",
    "--unstable",
    "--compat",
    "--clear",
    "main.ts",
  ]);

  assertEquals(args, ["main.ts"]);
  assert([debug, help, quiet, version].every((flag) => flag === false));
  assert(clear);
  assertEquals(watch, ["a.txt", "b.txt"]);
  assertEquals(runOptions, [
    "--allow-all",
    "--no-check",
    "--unstable",
    "--watch",
    "--compat",
  ]);
});

Deno.test("[parseCliArgs] pattern 3", () => {
  const {
    args,
    clear,
    debug,
    help,
    quiet,
    version,
    watch,
    runOptions,
  } = parseCliArgs([
    "-Aqfc",
    "deno.json",
    "main.ts",
  ]);

  assertEquals(args, ["main.ts"]);
  assert([clear, debug, help, version].every((flag) => flag === false));
  assert(quiet);
  assertEquals(watch, []);
  assertEquals(runOptions, [
    "--allow-all",
    "--no-check",
    "--unstable",
    "--watch",
    "-f",
    "-c=deno.json",
    "--quiet",
  ]);
});

Deno.test("[parseCliArgs] pattern 4", () => {
  const { args, runOptions } = parseCliArgs(["--shuffle", "test.ts"]);

  assertEquals(args, ["test.ts"]);
  assertEquals(runOptions, [
    "--allow-all",
    "--no-check",
    "--unstable",
    "--watch",
    "--shuffle",
  ]);
});

Deno.test("[parseCliArgs] pattern 5", () => {
  assert(parseCliArgs(["--help"]).help);
  assert(parseCliArgs(["-h"]).help);
  assert(parseCliArgs(["--version"]).version);
  assert(parseCliArgs(["-v"]).version);
});
