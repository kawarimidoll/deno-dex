import { serve } from "https://deno.land/std@0.114.0/http/server.ts";

const addr = ":8080";
console.log(`HTTP server listening on http://localhost${addr}`);

serve(async (request: Request) => {
  const { href, origin, host, pathname, hash, search } = new URL(request.url);
  console.log({ href, origin, host, pathname, hash, search });
  console.log(import.meta);
  console.log(Deno.cwd());

  // const readme = await Deno.readTextFile("./README.md");
  // return new Response(readme);

  const resp = await fetch(new URL("../README.md", import.meta.url));
  return new Response(resp.body);
}, { addr });
