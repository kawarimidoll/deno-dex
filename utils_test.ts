import { assertEquals } from "./dev_deps.ts";
import { ensureOptsArgs, isDenoTest } from "./utils.ts";
import { NEED_EQUALS } from "./const.ts";

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
