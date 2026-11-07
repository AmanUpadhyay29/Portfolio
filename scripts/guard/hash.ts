// Prints the hash a hashed guard rule stores for a phrase: pnpm guard:hash "some phrase"
import { hashTerm } from "./rules";

const phrase = process.argv.slice(2).join(" ");
try {
  console.log(hashTerm(phrase));
} catch (e) {
  console.error(`guard:hash: ${(e as Error).message}`);
  process.exit(1);
}
