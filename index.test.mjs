import test from "node:test";
import assert from "node:assert";
import { tokenize } from "./index.mjs";

test.describe("tokenize", () => {
  for (let [input, output] of [
    ["function x() { return 10; }", ["x"]],
    ["const x = 10;", ["x"]],
    ["let x = 10;", ["x"]],
    ["var x = 10;", ["x"]],
    ["class x {}", ["x"]],
    ["class x { Y() {} }", ["x", "Y"]],
    ["type x = number;", ["x"]],
    ["interface x {}", ["x"]],
    ["new x()", ["x"]],
    ["x()", ["x"]],
    ["'x'", ["x"]],
    ["'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'", []],
    ["'https://google.com/'", ["https://google.com/"]],
    ["const { x } = 10;", ["x"]],
    ["import { x } from 'npm:foo'", ["x", "npm", "foo"]],
    ["import x from 'npm:foo'", ["x", "npm", "foo"]],
    ["const { x: y } = {}", ["x", "y"]],
    ["x.y", ["x", "y"]],
    ["x, y", ["x", "y"]],
    ["x(y)", ["x", "y"]],
    ["let x = 100;", ["x"]],
    ["'hello world'", ["hello", "world"]],
    ["`hello world`", ["hello", "world"]],
    ["// hello world", ["hello", "world"]],
    // Why does lazy become lazi?
    ["// the dog jumps over the lazy fox", ["dog", "jump", "lazi", "fox"]],
    ["/* hello world */", ["hello", "world"]],
  ]) {
    test.it(`converts ${input}`, () => {
      assert.deepEqual(simplify(tokenize(input)), output);
    });
  }
});

function simplify(matches) {
  return matches.map((m) => m[0]);
}
