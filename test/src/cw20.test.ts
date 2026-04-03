import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing'
import { GasPrice } from '@cosmjs/stargate'
import { createTypedContract } from 'schemos'
import { cw20 } from 'schemos/schemas'
import { describe, expect, inject, it } from 'vitest'

const rpcUrl = inject('rpcUrl')
const mnemonic = inject('mnemonic')
const address = inject('address')
const recipientAddress = inject('recipientAddress')
const cw20CodeId = inject('cw20CodeId')

describe('schemos e2e: cw20 on local wasmd', () => {
  let client: SigningCosmWasmClient
  let contractAddress: string

  it('instantiates cw20 contract', async () => {
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: 'wasm',
    })
    client = await SigningCosmWasmClient.connectWithSigner(rpcUrl, wallet, {
      gasPrice: GasPrice.fromString('0stake'),
    })

    const result = await client.instantiate(
      address,
      cw20CodeId,
      {
        name: 'Test Token',
        symbol: 'TEST',
        decimals: 6,
        initial_balances: [{ address, amount: '1000000' }],
        mint: { minter: address },
      },
      'cw20-test',
      'auto',
    )
    contractAddress = result.contractAddress
    expect(contractAddress).toBeTruthy()
  })

  it('queries balance via schemos typed contract', async () => {
    const token = createTypedContract(client, contractAddress, cw20)
    const result = await token.query('balance', { address })
    expect(result).toEqual({ balance: '1000000' })
  })

  it('queries token_info via schemos typed contract', async () => {
    const token = createTypedContract(client, contractAddress, cw20)
    const result = await token.query('token_info', {})
    expect(result).toMatchObject({
      name: 'Test Token',
      symbol: 'TEST',
      decimals: 6,
    })
  })

  it('executes transfer via schemos typed contract', async () => {
    const token = createTypedContract(client, contractAddress, cw20)

    await token.execute(
      address,
      'transfer',
      { recipient: recipientAddress, amount: '500' },
      'auto',
    )

    const senderBalance = await token.query('balance', { address })
    expect(senderBalance).toEqual({ balance: '999500' })

    const recipientBalance = await token.query('balance', {
      address: recipientAddress,
    })
    expect(recipientBalance).toEqual({ balance: '500' })
  })

  it('executes mint via schemos typed contract', async () => {
    const token = createTypedContract(client, contractAddress, cw20)

    const before = (await token.query('balance', { address })) as {
      balance: string
    }
    const balanceBefore = BigInt(before.balance)

    await token.execute(
      address,
      'mint',
      { recipient: address, amount: '5000' },
      'auto',
    )

    const after = (await token.query('balance', { address })) as {
      balance: string
    }
    expect(BigInt(after.balance)).toBe(balanceBefore + 5000n)
  })

  it('rejects invalid args at runtime before tx', async () => {
    const token = createTypedContract(client, contractAddress, cw20)

    await expect(
      token.execute(
        address,
        'transfer',
        // @ts-expect-error - amount should be string
        { recipient: recipientAddress, amount: 500 },
        'auto',
      ),
    ).rejects.toThrow('Execute validation failed')
  })
}, 60_000)
