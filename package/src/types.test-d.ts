import { assertType, expectTypeOf, test } from 'vitest'
import type { Coin, StdFee } from './types.js'

test('Coin has denom and amount as string', () => {
  expectTypeOf<Coin['denom']>().toEqualTypeOf<string>()
  expectTypeOf<Coin['amount']>().toEqualTypeOf<string>()

  assertType<Coin>({ denom: 'uosmo', amount: '1000' })

  // @ts-expect-error - amount must be string, not number
  assertType<Coin>({ denom: 'uosmo', amount: 1000 })
})

test('Coin is readonly', () => {
  expectTypeOf<Coin['denom']>().toBeString()
  expectTypeOf<Coin['amount']>().toBeString()
})

test('StdFee has readonly Coin[] amount and string gas', () => {
  expectTypeOf<StdFee['amount']>().toEqualTypeOf<readonly Coin[]>()
  expectTypeOf<StdFee['gas']>().toEqualTypeOf<string>()

  assertType<StdFee>({
    amount: [{ denom: 'uosmo', amount: '500' }],
    gas: '200000',
  })

  // @ts-expect-error - gas must be string, not number
  assertType<StdFee>({ amount: [], gas: 200000 })
})

test('StdFee.amount is readonly', () => {
  const fee: StdFee = { amount: [{ denom: 'uosmo', amount: '1' }], gas: '1' }
  // @ts-expect-error - readonly array, push does not exist
  fee.amount.push({ denom: 'uatom', amount: '1' })
})
