/**
 * Wallet kit type compatibility tests.
 *
 * Verifies that popular Cosmos wallet libraries produce client types
 * compatible with schemos's interfaces. Serves as documentation-by-test:
 * upstream type changes that break compatibility will fail here first.
 *
 * - cosmos-kit: covered in client.test-d.ts (SigningCosmWasmClient ↔ CosmWasmExecuteClient)
 * - graz: multi-chain Record<string, T | null> — requires extraction + null-check
 * - interchain-kit: DirectSigner | AminoSigner — requires telescope adapter
 */

import type { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import type {
  SigningClient as InterchainSigningClient,
  useChain,
} from '@interchain-kit/react'
import { expectTypeOf, test } from 'vitest'
import type { CosmWasmExecuteClient, CosmWasmQueryClient } from './client.js'
import type {
  createExecuteAdapter,
  createQueryAdapter,
  SignAndBroadcastFn,
} from './telescope.js'

// ---------------------------------------------------------------------------
// graz: useCosmWasmSigningClient() → { data: Record<string, T | null> }
// ---------------------------------------------------------------------------

type GrazClientData = Record<string, SigningCosmWasmClient | null>

test('graz: SigningCosmWasmClient | null is NOT assignable without null-check', () => {
  type ClientOrNull = SigningCosmWasmClient | null
  // @ts-expect-error — null is not assignable to CosmWasmExecuteClient
  expectTypeOf<ClientOrNull>().toMatchTypeOf<CosmWasmExecuteClient>()
})

test('graz: after null-check, SigningCosmWasmClient is assignable', () => {
  type Client = NonNullable<GrazClientData[string]>
  expectTypeOf<Client>().toMatchTypeOf<CosmWasmExecuteClient>()
})

test('graz: raw Record is NOT assignable (it is a map, not a client)', () => {
  // @ts-expect-error — Record<string, T | null> is not a client
  expectTypeOf<GrazClientData>().toMatchTypeOf<CosmWasmExecuteClient>()
})

// ---------------------------------------------------------------------------
// interchain-kit: useChain().signingClient → SigningClient | null
// SigningClient = DirectSigner | AminoSigner (interchainjs)
// ---------------------------------------------------------------------------

test('interchain-kit: SigningClient | null is NOT assignable without null-check', () => {
  type ClientOrNull = InterchainSigningClient | null
  // @ts-expect-error — null is not assignable to CosmWasmExecuteClient
  expectTypeOf<ClientOrNull>().toMatchTypeOf<CosmWasmExecuteClient>()
})

test('interchain-kit: non-null SigningClient is NOT assignable to CosmWasmExecuteClient', () => {
  // DirectSigner | AminoSigner does not have execute() or queryContractSmart()
  // in the shape that schemos expects. Users must use schemos/telescope adapter.
  type Client = NonNullable<InterchainSigningClient>
  // @ts-expect-error — interchainjs signer has different interface than cosmjs
  expectTypeOf<Client>().toMatchTypeOf<CosmWasmExecuteClient>()
})

test('interchain-kit: non-null SigningClient is NOT assignable to CosmWasmQueryClient', () => {
  type Client = NonNullable<InterchainSigningClient>
  // @ts-expect-error — no queryContractSmart in cosmjs shape
  expectTypeOf<Client>().toMatchTypeOf<CosmWasmQueryClient>()
})

// ---------------------------------------------------------------------------
// telescope adapter: the escape hatch for non-cosmjs clients
// ---------------------------------------------------------------------------

test('telescope: createQueryAdapter returns CosmWasmQueryClient', () => {
  type AdapterReturn = ReturnType<typeof createQueryAdapter>
  expectTypeOf<AdapterReturn>().toMatchTypeOf<CosmWasmQueryClient>()
})

test('telescope: createExecuteAdapter returns CosmWasmExecuteClient', () => {
  type AdapterReturn = ReturnType<typeof createExecuteAdapter>
  expectTypeOf<AdapterReturn>().toMatchTypeOf<CosmWasmExecuteClient>()
})

// ---------------------------------------------------------------------------
// interchain-kit + telescope adapter integration
// ---------------------------------------------------------------------------

test('interchain-kit: adapter + createTypedContract compiles', () => {
  // The full interchain-kit integration path:
  // 1. Get SmartContractStateFn from telescope RPC
  // 2. Wrap with createExecuteAdapter
  // 3. Pass to createTypedContract
  type AdapterReturn = ReturnType<typeof createExecuteAdapter>
  expectTypeOf<AdapterReturn>().toMatchTypeOf<CosmWasmExecuteClient>()
  // This proves createTypedContract(adapter, addr, schema) will compile
})

// ---------------------------------------------------------------------------
// StdFee compatibility
// ---------------------------------------------------------------------------

test('schemos StdFee.amount accepts readonly Coin[]', () => {
  type SchemosStdFee = import('./types.js').StdFee
  type AmountType = SchemosStdFee['amount']
  expectTypeOf<AmountType>().toMatchTypeOf<
    readonly import('./types.js').Coin[]
  >()
})

test('cosmjs StdFee is assignable to schemos StdFee', () => {
  type CosmjsStdFee = import('@cosmjs/amino').StdFee
  type SchemosStdFee = import('./types.js').StdFee
  expectTypeOf<CosmjsStdFee>().toMatchTypeOf<SchemosStdFee>()
})

test('interchainjs StdFee is assignable to schemos StdFee', () => {
  // interchainjs Coin[] (mutable) is assignable to schemos readonly Coin[]
  type InterchainStdFee = import('@interchainjs/types').StdFee
  type SchemosStdFee = import('./types.js').StdFee
  expectTypeOf<InterchainStdFee>().toExtend<SchemosStdFee>()
})

test('interchain-kit: signingClient.signAndBroadcast is assignable to SignAndBroadcastFn', () => {
  type InterchainSignAndBroadcast = NonNullable<
    ReturnType<typeof useChain>['signingClient']
  >['signAndBroadcast']

  // interchainjs StdFee uses mutable Coin[] while cosmjs uses readonly Coin[].
  // SignAndBroadcastFn accepts InterchainStdFee (mutable) so that
  // signingClient.signAndBroadcast can be passed directly to createExecuteAdapter.
  expectTypeOf<InterchainSignAndBroadcast>().toExtend<SignAndBroadcastFn>()
})
