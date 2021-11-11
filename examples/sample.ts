import { name, sayHello } from "./resources.ts";

console.log(sayHello(name));
console.log({ sample_args: Deno.args });

for (let i = 1; i < 11; i++) {
  setTimeout(() => {
    console.log(`${i}...`);
  }, i * 1000);
}

// setTimeout(() => {
//   throw new Error("error!");
// }, 3000);
