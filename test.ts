import { assert, assertEquals } from "./dev_deps.ts";
import { NEED_EQUALS, parseCliArgs } from "./main.ts";
import { ensureOptsArgs, isDenoTest } from "./utils.ts";
// import { isDenoTest, runProcess, watchChanges } from "./utils.ts";

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

Deno.test("[ensureOptsArgs] update args", () => {
  assertEquals(
    ensureOptsArgs(
      ["--allow-read", "a.ts", "--allow-write", "b.ts"],
      NEED_EQUALS,
    ),
    [
      "--allow-read",
      "--",
      "a.ts",
      "--allow-write",
      "b.ts",
    ],
  );
  assertEquals(
    ensureOptsArgs(["--allow-read=a.ts", "--allow-write", "b.ts"], NEED_EQUALS),
    [
      "--allow-read=a.ts",
      "--allow-write",
      "--",
      "b.ts",
    ],
  );
  assertEquals(
    ensureOptsArgs(
      ["--allow-read", "--allow-write", "a.ts", "b.ts"],
      NEED_EQUALS,
    ),
    [
      "--allow-read",
      "--allow-write",
      "--",
      "a.ts",
      "b.ts",
    ],
  );
});

Deno.test("isDenoTest", () => {
  assertEquals(isDenoTest("main.ts"), false);
  assertEquals(isDenoTest("test.ts"), true);
  assertEquals(isDenoTest("main.test.ts"), true);
  assertEquals(isDenoTest("main_test.ts"), true);
  assertEquals(isDenoTest("maintest.ts"), false);

  assertEquals(isDenoTest("path/to/main.ts"), false);
  assertEquals(isDenoTest("path/to/test.ts"), true);

  assertEquals(isDenoTest("main.js"), false);
  assertEquals(isDenoTest("main.test.js"), true);
  assertEquals(isDenoTest("main.jsx"), false);
  assertEquals(isDenoTest("main.test.jsx"), true);
  assertEquals(isDenoTest("main.tsx"), false);
  assertEquals(isDenoTest("main.test.tsx"), true);
  assertEquals(isDenoTest("main.mjs"), false);
  assertEquals(isDenoTest("main.test.mjs"), true);
});
