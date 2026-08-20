import "dotenv/config";
import { AccountId, Client, Hbar, PrivateKey } from "@hashgraph/sdk";

function parsePrivateKey(raw) {
  try { return PrivateKey.fromStringDer(raw); }
  catch { return PrivateKey.fromStringECDSA(raw); }
}

export function clientFor(prefix = "HEDERA_OPERATOR") {
  const accountId = process.env[`${prefix}_ID`];
  const key = process.env[`${prefix}_KEY`];
  if (!accountId || !key) throw new Error(`Set ${prefix}_ID and ${prefix}_KEY in .env.`);
  const client = Client.forTestnet();
  client.setOperator(AccountId.fromString(accountId), parsePrivateKey(key));
  client.setDefaultMaxTransactionFee(new Hbar(20));
  return client;
}
