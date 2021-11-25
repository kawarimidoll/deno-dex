import { serve } from "../dev_deps.ts";

const addr = ":8080";
console.log(`HTTP server listening on http://localhost${addr}`);

serve(async (request: Request) => {
  const { href, origin, host, pathname, hash, search } = new URL(request.url);
  console.log({ href, origin, host, pathname, hash, search });
  console.log({ ...import.meta, cwd: Deno.cwd() });

  // const readme = await Deno.readTextFile("./README.md");
  const readme = (await fetch(new URL("../README.md", import.meta.url))).body;
  return new Response(readme);
}, { addr });
