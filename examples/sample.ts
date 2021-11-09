import { name, sayHello } from "./resources.ts";

sayHello(name);

for (let i = 1; i < 11; i++) {
  setTimeout(() => {
    console.log(`${i}...`);
  }, i * 1000);
}
