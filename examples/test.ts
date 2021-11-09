import { assertEquals } from "../deps.ts";
import { sayHello } from "./resources.ts";

Deno.test("sayHello", () => {
  assertEquals(
    sayHello("deno"),
    "Hello, deno",
  );
});
