import type { FromSchema } from 'json-schema-to-ts'
import { assertType, test } from 'vitest'
import type { cw20ExecuteSchema } from './cw20/execute.js'
import type { cw20QuerySchema } from './cw20/query.js'
import type { cw721ExecuteSchema } from './cw721/execute.js'
import type { cw721QuerySchema } from './cw721/query.js'

// ---------------------------------------------------------------------------
// CW20 Execute
// ---------------------------------------------------------------------------
type Cw20Execute = FromSchema<typeof cw20ExecuteSchema>

test('cw20 transfer has amount (Uint128 -> string) and recipient', () => {
  assertType<Cw20Execute>({
    transfer: { amount: '1000', recipient: 'osmo1abc' },
  })
})

test('cw20 send has amount, contract, msg', () => {
  assertType<Cw20Execute>({
    send: { amount: '100', contract: 'osmo1xyz', msg: 'base64data' },
  })
})

test('cw20 increase_allowance has amount and spender', () => {
  assertType<Cw20Execute>({
    increase_allowance: { amount: '500', spender: 'osmo1abc' },
  })
})

test('cw20 transfer_from has amount, owner, recipient', () => {
  assertType<Cw20Execute>({
    transfer_from: {
      amount: '100',
      owner: 'osmo1abc',
      recipient: 'osmo1def',
    },
  })
})

test('cw20 execute rejects invalid message', () => {
  // @ts-expect-error - 'approve' is not a cw20 execute message
  assertType<Cw20Execute>({ approve: {} })
})

// ---------------------------------------------------------------------------
// CW20 Query
// ---------------------------------------------------------------------------
type Cw20Query = FromSchema<typeof cw20QuerySchema>

test('cw20 balance query has address', () => {
  assertType<Cw20Query>({ balance: { address: 'osmo1abc' } })
})

test('cw20 token_info query is empty', () => {
  assertType<Cw20Query>({ token_info: {} })
})

test('cw20 allowance query has owner and spender', () => {
  assertType<Cw20Query>({
    allowance: { owner: 'osmo1abc', spender: 'osmo1def' },
  })
})

test('cw20 all_allowances query has owner with optional pagination', () => {
  assertType<Cw20Query>({ all_allowances: { owner: 'osmo1abc' } })
  assertType<Cw20Query>({
    all_allowances: { owner: 'osmo1abc', limit: 10, start_after: 'osmo1xyz' },
  })
})

// ---------------------------------------------------------------------------
// CW721 Execute
// ---------------------------------------------------------------------------
type Cw721Execute = FromSchema<typeof cw721ExecuteSchema>

test('cw721 transfer_nft has recipient and token_id', () => {
  assertType<Cw721Execute>({
    transfer_nft: { recipient: 'osmo1abc', token_id: '1' },
  })
})

test('cw721 send_nft has contract, msg, token_id', () => {
  assertType<Cw721Execute>({
    send_nft: { contract: 'osmo1xyz', msg: 'base64', token_id: '1' },
  })
})

test('cw721 approve has spender and token_id', () => {
  assertType<Cw721Execute>({
    approve: { spender: 'osmo1abc', token_id: '1' },
  })
})

test('cw721 mint has owner and token_id', () => {
  assertType<Cw721Execute>({
    mint: { owner: 'osmo1abc', token_id: '42' },
  })
})

test('cw721 burn has token_id', () => {
  assertType<Cw721Execute>({ burn: { token_id: '1' } })
})

test('cw721 execute rejects invalid message', () => {
  // @ts-expect-error - 'transfer' is cw20, not cw721
  assertType<Cw721Execute>({ transfer: { amount: '100' } })
})

// ---------------------------------------------------------------------------
// CW721 Query
// ---------------------------------------------------------------------------
type Cw721Query = FromSchema<typeof cw721QuerySchema>

test('cw721 owner_of has token_id', () => {
  assertType<Cw721Query>({ owner_of: { token_id: '1' } })
})

test('cw721 nft_info has token_id', () => {
  assertType<Cw721Query>({ nft_info: { token_id: '1' } })
})

test('cw721 tokens has owner with optional pagination', () => {
  assertType<Cw721Query>({ tokens: { owner: 'osmo1abc' } })
  assertType<Cw721Query>({
    tokens: { owner: 'osmo1abc', limit: 20, start_after: '5' },
  })
})

test('cw721 num_tokens is empty', () => {
  assertType<Cw721Query>({ num_tokens: {} })
})

test('cw721 contract_info is empty', () => {
  assertType<Cw721Query>({ contract_info: {} })
})
