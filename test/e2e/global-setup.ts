import { Instance } from 'cosmock'
import type { TestProject } from 'vitest/node'

const TEST_MNEMONIC =
  'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

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

  provide('rpcUrl', `http://${wasmd.host}:${wasmd.port}`)
  provide('mnemonic', TEST_MNEMONIC)

  return () => wasmd.stop()
}

declare module 'vitest' {
  export interface ProvidedContext {
    rpcUrl: string
    mnemonic: string
  }
}
