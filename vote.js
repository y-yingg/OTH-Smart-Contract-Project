import {
  AccountId,
  ContractCallQuery,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  ContractId,
} from "@hashgraph/sdk";
import { clientFor } from "./hedera-client.js";

const [contractIdText, topicText, accountPrefix = "HEDERA_OPERATOR"] = process.argv.slice(2);
if (!contractIdText || topicText === undefined) {
  console.error("Usage: node vote.js <contract-id> <topic-index> [account-prefix]");
  process.exit(1);
}
const topicIndex = Number(topicText);
if (!Number.isSafeInteger(topicIndex) || topicIndex < 0) {
  console.error("Vote unsuccessful: topic index must be a non-negative integer.");
  process.exit(1);
}

async function query(client, contractId, method, params = new ContractFunctionParameters()) {
  return new ContractCallQuery()
    .setContractId(contractId)
    .setGas(100_000)
    .setFunction(method, params)
    .execute(client);
}

async function main() {
  const client = clientFor(accountPrefix);
  try {
    const contractId = ContractId.fromString(contractIdText);
    const accountId = process.env[`${accountPrefix}_ID`];
    const voterAddress = AccountId.fromString(accountId).toSolidityAddress();
    const addressParams = () => new ContractFunctionParameters().addAddress(voterAddress);

    // These queries also prevent an account ID from being mistaken for a contract ID.
    const topicCount = Number((await query(client, contractId, "topicCount")).getUint256(0).toString());
    if (topicIndex >= topicCount) {
      console.error(`Vote unsuccessful: topic ${topicIndex} does not exist. Choose 0-${topicCount - 1}.`);
      return 1;
    }
    if ((await query(client, contractId, "isDenied", addressParams())).getBool(0)) {
      console.error("Vote unsuccessful: this account is not allowed to vote.");
      return 1;
    }
    if ((await query(client, contractId, "hasVoted", addressParams())).getBool(0)) {
      console.error("Vote unsuccessful: this account has already voted once.");
      return 1;
    }

    const response = await new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(100_000)
      .setFunction("vote", new ContractFunctionParameters().addUint256(topicIndex))
      .execute(client);
    const receipt = await response.getReceipt(client);
    console.log(`Vote successful: ${accountPrefix} voted for topic ${topicIndex}.`);
    console.log(`Transaction: ${response.transactionId}`);
    return 0;
  } finally {
    client.close();
  }
}

main()
  .then((exitCode) => { process.exitCode = exitCode; })
  .catch((error) => {
    if (error?.status?.toString() === "INVALID_CONTRACT_ID") {
      console.error("Vote unsuccessful: the supplied ID is not a deployed contract ID.");
    } else {
      console.error(`Vote unsuccessful: ${error.message ?? error}`);
    }
    process.exitCode = 1;
  });
