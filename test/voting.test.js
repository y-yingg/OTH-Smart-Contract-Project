import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import solc from "solc";

test("Voting compiles and exposes the assignment interface", () => {
  const input = {
    language: "Solidity",
    sources: { "Voting.sol": { content: fs.readFileSync("contracts/Voting.sol", "utf8") } },
    settings: { outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } } },
  };
  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  assert.deepEqual((output.errors ?? []).filter((item) => item.severity === "error"), []);
  const compiled = output.contracts["Voting.sol"].Voting;
  assert.ok(compiled.evm.bytecode.object.length > 0);
  const names = compiled.abi.filter((item) => item.type === "function").map((item) => item.name).sort();
  assert.deepEqual(names, ["canVote", "hasVoted", "isDenied", "topicCount", "topicName", "vote", "voteCount"].sort());
});
