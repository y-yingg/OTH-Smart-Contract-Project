# Hedera Testnet Contract Deployer

Deploys a **compiled** smart contract (solc / Hardhat / Foundry bytecode) to the
**Hedera Testnet** using the official [`@hashgraph/sdk`](https://www.npmjs.com/package/@hashgraph/sdk).

It uses `ContractCreateFlow`, which automatically uploads the bytecode to a
Hedera file (chunked for large contracts) and creates the contract in one step —
so you don't need separate `FileCreateTransaction` / `FileAppendTransaction`
calls.

## 1. Setup

```bash
npm install
cp .env.example .env      # then fill in your Testnet operator ID + key
```

Get free Testnet credentials at the [Hedera Portal](https://portal.hedera.com/).

## 2. Deploy

Point the script at either a compiler **artifact JSON** or a raw **`.bin`** file:

```bash
# Hardhat / Foundry / solc artifact JSON
node deploy.js ./artifacts/MyContract.json

# raw bytecode file
node deploy.js ./build/MyContract.bin --gas 300000
```

### Constructor arguments

Pass typed arguments in the order the constructor expects them:

```bash
node deploy.js ./artifacts/MyToken.json \
  --arg-string  "MyToken" \
  --arg-string  "MTK" \
  --arg-uint256 1000000
```

Supported flags: `--arg-string`, `--arg-address` (accepts `0.0.x` or `0x…`),
`--arg-uint256`, `--arg-bool`. Extend `parseArgs`/`buildConstructorParams` in
`deploy.js` for further Solidity types.

### Options

| Flag     | Default  | Description                          |
|----------|----------|--------------------------------------|
| `--gas`  | `200000` | Gas limit for contract creation      |
| `--memo` | *(none)* | Optional contract memo               |

## 3. Call a method (`call.js`)

`call.js` is a **template** for invoking a method on an already-deployed
contract. Open the file and fill in the `CONFIG` block:

- `CONTRACT_ID` – the contract to call
- `MODE` – `"query"` for view/pure functions (free), `"execute"` for
  state-changing ones (costs gas, returns a receipt status)
- `METHOD_NAME` – the Solidity function name
- `buildParams()` – add the call arguments in order
- `RETURN_TYPE` – the single return type to decode (**multiple return values
  are not supported**); set to `null` if the method returns nothing

Then run:

```bash
node call.js
```

It prints the decoded return value, its type, and the call status:

```
Result
  Return value : Hello Hedera
  Return type  : string
  Call status  : SUCCESS
```

Supported return types: `string`, `bool`, `address`, `uint256`, `int256`,
`uint64`, `int64`, `uint32`, `int32`, `bytes`, `bytes32`.

## 4. Deploy output

On success you get the Hedera Contract ID, the EVM address, and a HashScan link:

```
✅ Contract deployed successfully
  Contract ID : 0.0.1234567
  EVM address : 0x0000000000000000000000000000000000012d687
  HashScan    : https://hashscan.io/testnet/contract/0.0.1234567
```
