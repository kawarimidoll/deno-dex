import { assertEquals } from "./deps.ts";
import { isDenoTest } from "./utils.ts";
// import { isDenoTest, runProcess, watchChanges } from "./utils.ts";

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
