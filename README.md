# schemos

Type-safe CosmWasm contract interactions, zero codegen.

schemos infers TypeScript types from JSON Schema (`cargo schema` output) at compile time and validates messages at runtime — no generated code, no client lock-in.

## Install

```bash
pnpm add schemos
```

## Quick Start

```ts
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { createTypedContract } from 'schemos'
import { cw20 } from 'schemos/schemas'

const client = await SigningCosmWasmClient.connectWithSigner(rpcEndpoint, signer)
const token = createTypedContract(client, 'osmo1...', cw20)

// Execute — message names autocomplete, fields are type-checked
await token.execute(
  senderAddress,
  'transfer',
  { recipient: 'osmo1...', amount: '1000' },
  'auto',
)

// Query — return type inferred from response schema
const { balance } = await token.query('balance', { address: 'osmo1...' })
// balance: string
```

Typo? Compile error. Missing field? Compile error. Wrong type at runtime? Error thrown before gas is spent.

## Entrypoints

| Import | Description |
|--------|-------------|
| `schemos` | `createTypedContract`, `createMsgBuilder`, `createMsgValidator`, `Json`, types |
| `schemos/schemas` | Bundled cw20, cw721 schemas |
| `schemos/telescope` | Adapter for telescope-generated SDKs (xplajs, osmojs, neutronj, ...) |

## Documentation

Full API reference, guides, and integration examples: **https://schemos.vercel.app**

## License

MIT
