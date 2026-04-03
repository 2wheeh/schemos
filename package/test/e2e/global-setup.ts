import fs from 'node:fs'
import path from 'node:path'
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing'
import { GasPrice } from '@cosmjs/stargate'
import { Instance } from 'cosmock'
import type { TestProject } from 'vitest/node'

const TEST_MNEMONIC =
  'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
const RECIPIENT_MNEMONIC = 'zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo wrong'

export default async function setup({ provide }: TestProject) {
  const wasmd = Instance.wasmd({
    chainId: 'schemos-test-1',
    prefix: 'wasm',
    accounts: [
      {
        mnemonic: TEST_MNEMONIC,
        coins: '1000000000stake',
        name: 'alice',
      },
    ],
  })

  console.log('[schemos-e2e] starting wasmd...')
  await wasmd.start()
  console.log('[schemos-e2e] wasmd started')

  const rpcUrl = `http://${wasmd.host}:${wasmd.port}`

  // Upload cw20_base.wasm once
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(TEST_MNEMONIC, {
    prefix: 'wasm',
  })
  const accounts = await wallet.getAccounts()
  // biome-ignore lint/style/noNonNullAssertion: Test setup will fail if account doesn't exist, so non-null assertion is fine here
  const address = accounts[0]!.address

  const recipientWallet = await DirectSecp256k1HdWallet.fromMnemonic(
    RECIPIENT_MNEMONIC,
    { prefix: 'wasm' },
  )
  const recipientAccounts = await recipientWallet.getAccounts()
  // biome-ignore lint/style/noNonNullAssertion: Test setup will fail if account doesn't exist, so non-null assertion is fine here
  const recipientAddress = recipientAccounts[0]!.address

  const client = await SigningCosmWasmClient.connectWithSigner(rpcUrl, wallet, {
    gasPrice: GasPrice.fromString('0stake'),
  })

  const wasmPath = path.join(
    path.dirname(new URL(import.meta.url).pathname),
    '..',
    'testdata',
    'cw20_base.wasm',
  )
  const wasmCode = fs.readFileSync(wasmPath)
  const { codeId } = await client.upload(address, wasmCode, 'auto')
  console.log(`[schemos-e2e] cw20 uploaded, codeId: ${codeId}`)

  provide('rpcUrl', rpcUrl)
  provide('mnemonic', TEST_MNEMONIC)
  provide('recipientMnemonic', RECIPIENT_MNEMONIC)
  provide('address', address)
  provide('recipientAddress', recipientAddress)
  provide('cw20CodeId', codeId)

  return () => wasmd.stop()
}

declare module 'vitest' {
  export interface ProvidedContext {
    rpcUrl: string
    mnemonic: string
    recipientMnemonic: string
    address: string
    recipientAddress: string
    cw20CodeId: number
  }
}
