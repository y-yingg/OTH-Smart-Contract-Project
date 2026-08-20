import { ContractCallQuery, ContractFunctionParameters, ContractId } from "@hashgraph/sdk";
import { clientFor } from "./hedera-client.js";

const [contractIdText] = process.argv.slice(2);
if (!contractIdText) { console.error("Usage: node results.js <contract-id>"); process.exit(1); }
const client = clientFor();
const contractId = ContractId.fromString(contractIdText);
async function query(method, params = new ContractFunctionParameters()) {
  return new ContractCallQuery().setContractId(contractId).setGas(100_000).setFunction(method, params).execute(client);
}
try {
  const count = Number((await query("topicCount")).getUint256(0).toString());
  console.log("Voting results");
  for (let index = 0; index < count; index++) {
    const makeParams = () => new ContractFunctionParameters().addUint256(index);
    const name = (await query("topicName", makeParams())).getString(0);
    const votes = (await query("voteCount", makeParams())).getUint256(0).toString();
    console.log(`  ${index}: ${name} — ${votes} vote(s)`);
  }
} finally { client.close(); }
