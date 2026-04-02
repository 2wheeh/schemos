# cosmore

Type-safe CosmWasm contract interactions, zero codegen.

cosmore infers TypeScript types from JSON Schema (`cargo schema` output) at compile time and validates messages at runtime — no generated code, no client lock-in.

## Install

```bash
pnpm add cosmore
```

## Quick Start

```typescript
import { createTypedContract } from 'cosmore'
import { cw20 } from 'cosmore/schemas'

// Works with any CosmWasm client (cosmjs, interchainjs, graz, etc.)
const token = createTypedContract(client, 'osmo1...', cw20)

// Execute — message names autocomplete, fields are type-checked
await token.execute(
  senderAddress,
  'transfer',
  { recipient: 'osmo1...', amount: '1000' },
  fee,
)

// Query — return type inferred from response schema
const { balance } = await token.query('balance', { address: 'osmo1...' })
// balance: string
```

Typo? Compile error. Missing field? Compile error. Wrong type at runtime? Error thrown before gas is spent.

## How It Works

```
cargo schema → JSON Schema (as const) → cosmore
                                          ├─ compile time: json-schema-to-ts infers TypeScript types
                                          └─ runtime: Ajv validates before tx broadcast
```

Single source of truth. The same JSON Schema drives both type inference and runtime validation.

## Usage with cosmjs

`SigningCosmWasmClient` works directly — no adapter needed:

```typescript
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { createTypedContract } from 'cosmore'
import { cw20 } from 'cosmore/schemas'

const client = await SigningCosmWasmClient.connectWithSigner(rpcEndpoint, signer)
const token = createTypedContract(client, contractAddress, cw20)

await token.execute(sender, 'transfer', { recipient: '...', amount: '1000' }, 'auto')
const { balance } = await token.query('balance', { address: '...' })
```

Query-only (no signing):

```typescript
import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'

const client = await CosmWasmClient.connect(rpcEndpoint)
const token = createTypedContract(client, contractAddress, {
  query: cw20.query,
  responses: cw20.responses,
})
// token.query() available with typed responses, token.execute() does not exist
const { balance } = await token.query('balance', { address: '...' })
// balance: string — inferred from response schema
```

## Usage with telescope SDKs (interchainjs / xplajs / osmojs)

Telescope-generated SDKs use protobuf RPCs instead of cosmjs's JSON API. cosmore provides a generic adapter via `cosmore/interchain`:

```typescript
import { createExecuteAdapter } from 'cosmore/interchain'
import { createTypedContract } from 'cosmore'
import { cw20 } from 'cosmore/schemas'

// Each chain's telescope package provides MsgExecuteContract
import { MsgExecuteContract } from '@xpla/xplajs/cosmwasm/wasm/v1/tx'
// or: import { MsgExecuteContract } from 'osmojs/cosmwasm/wasm/v1/tx'

// Query: telescope RPC function
import { createGetSmartContractState } from '@xpla/xplajs/cosmwasm/wasm/v1/query.rpc.func'
const smartContractState = createGetSmartContractState(rpcEndpoint)

const adapter = createExecuteAdapter(
  smartContractState,
  (sender, msgs, fee, memo) => signingClient.signAndBroadcast(sender, msgs, fee, memo),
  (p) => MsgExecuteContract.encode(MsgExecuteContract.fromPartial({ ...p, funds: [...p.funds] })).finish(),
)

const token = createTypedContract(adapter, contractAddress, cw20)
await token.execute(sender, 'transfer', { recipient: '...', amount: '1000' }, 'auto')
```

> **Why callbacks?** CosmWasm is an opt-in module — `MsgExecuteContract` lives in each chain's telescope package (`@xpla/xplajs`, `osmojs`, `neutronjs`), not in a shared package. The adapter accepts callbacks so cosmore doesn't depend on any specific chain SDK.

## Usage with interchain-kit (React)

```typescript
import { useWalletManager } from '@interchain-kit/react'
import { toEncoders } from '@interchainjs/cosmos/utils'
import { MsgExecuteContract } from '@xpla/xplajs/cosmwasm/wasm/v1/tx'
import { createGetSmartContractState } from '@xpla/xplajs/cosmwasm/wasm/v1/query.rpc.func'
import { createExecuteAdapter } from 'cosmore/interchain'
import { createTypedContract } from 'cosmore'
import { cw20 } from 'cosmore/schemas'

function useCw20(contractAddress: string) {
  const wm = useWalletManager()
  const { currentWalletName } = wm
  const chainName = 'xpla'

  return useMemo(() => {
    const signingClient = wm.getSigningClient(currentWalletName, chainName)
    if (!signingClient) return null

    signingClient.addEncoders(toEncoders(MsgExecuteContract))

    const smartContractState = createGetSmartContractState(rpcEndpoint)

    const adapter = createExecuteAdapter(
      smartContractState,
      (sender, msgs, fee, memo) =>
        signingClient.signAndBroadcast(sender, msgs, fee, memo),
      (p) =>
        MsgExecuteContract.encode(
          MsgExecuteContract.fromPartial({ ...p, funds: [...p.funds] }),
        ).finish(),
    )

    return createTypedContract(adapter, contractAddress, cw20)
  }, [wm, currentWalletName, contractAddress])
}

// In component:
const token = useCw20('xpla1...')
await token?.execute(sender, 'transfer', { recipient: '...', amount: '1000' }, 'auto')
```

## Custom Contracts

Run `cargo schema` on your contract, import the JSON as `as const`:

```typescript
import { createTypedContract } from 'cosmore'

// Your contract's schema output
const myExecuteSchema = { /* cargo schema JSON */ } as const
const myQuerySchema = { /* cargo schema JSON */ } as const

const contract = createTypedContract(client, contractAddress, {
  execute: myExecuteSchema,
  query: myQuerySchema,
})

// Full autocomplete + type checking for your custom contract messages
await contract.execute(sender, 'your_msg', { /* typed fields */ }, 'auto')
```

With response typing:

```typescript
const myResponseSchemas = {
  get_state: { /* response_to_get_state.json */ } as const,
  get_config: { /* response_to_get_config.json */ } as const,
}

const contract = createTypedContract(client, contractAddress, {
  execute: myExecuteSchema,
  query: myQuerySchema,
  responses: myResponseSchemas,
})

// Return type inferred from response schema
const state = await contract.query('get_state', {})
```

## Bundled Schemas

```typescript
import { cw20, cw721 } from 'cosmore/schemas'

// cw20: transfer, burn, send, mint, allowances, etc.
const token = createTypedContract(client, addr, cw20)

// cw721: transfer_nft, send_nft, approve, mint, burn, etc.
const nft = createTypedContract(client, addr, cw721)
```

Individual schema imports also available:

```typescript
import { cw20ExecuteSchema, cw20QuerySchema, cw20ResponseSchemas } from 'cosmore/schemas'
```

## Comparison

|                    | @cosmwasm/ts-codegen | Manual typing   | **cosmore**              |
|--------------------|----------------------|-----------------|--------------------------|
| Approach           | Full codegen         | Hand-written    | JSON Schema → inference  |
| Generated code     | Hundreds of lines    | 0               | 0                        |
| Schema change      | Re-run + commit      | Manual update   | Replace JSON             |
| Compile-time types | Yes                  | If maintained   | Yes                      |
| Runtime validation | No                   | No              | Yes (Ajv)                |
| Client dependency  | cosmjs only          | Any             | Any                      |

## API

### `createTypedContract(client, contractAddress, schemas)`

Creates a typed contract instance.

- **client**: Any object matching `CosmWasmQueryClient` or `CosmWasmExecuteClient`
- **contractAddress**: Contract bech32 address
- **schemas**: `{ execute?, query, responses? }` — raw `cargo schema` JSON as `as const`

Returns `TypedContract` (with execute) or `TypedQueryContract` (query-only).

### `cosmore/interchain`

- **`createQueryAdapter(smartContractState)`** — Wraps a telescope RPC query function into `CosmWasmQueryClient`
- **`createExecuteAdapter(smartContractState, signAndBroadcast, encodeMsgExecuteContract)`** — Full adapter for telescope SDKs

### `cosmore/schemas`

- **`cw20`** — `{ execute, query, responses }` for CW20 fungible tokens
- **`cw721`** — `{ execute, query, responses }` for CW721 NFTs

## License

MIT
