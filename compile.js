import fs from "node:fs";
import path from "node:path";
import solc from "solc";

const input = {
  language: "Solidity",
  sources: { "Voting.sol": { content: fs.readFileSync("contracts/Voting.sol", "utf8") } },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } },
  },
};
const output = JSON.parse(solc.compile(JSON.stringify(input)));
for (const diagnostic of output.errors ?? []) console.error(diagnostic.formattedMessage);
if ((output.errors ?? []).some((item) => item.severity === "error")) process.exit(1);
const compiled = output.contracts["Voting.sol"].Voting;
const artifact = { contractName: "Voting", abi: compiled.abi, bytecode: compiled.evm.bytecode.object };
fs.mkdirSync(path.resolve("artifacts"), { recursive: true });
fs.writeFileSync(path.resolve("artifacts/Voting.json"), JSON.stringify(artifact, null, 2) + "\n");
console.log("Compiled contracts/Voting.sol -> artifacts/Voting.json");
