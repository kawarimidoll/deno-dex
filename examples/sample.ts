import { name, sayHello } from "./resources.ts";

console.log(Deno.args);
console.log(sayHello(name));

for (let i = 1; i < 11; i++) {
  setTimeout(() => {
    console.log(`${i}...`);
  }, i * 1000);
}

// setTimeout(() => {
//   throw new Error("error!");
// }, 3000);
