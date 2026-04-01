import fs from 'node:fs'
import path from 'node:path'
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing'
import { GasPrice } from '@cosmjs/stargate'
import { describe, expect, inject, it } from 'vitest'
import type { CosmWasmExecuteClient } from '../../src/client.js'
import { createTypedContract } from '../../src/contract.js'
import { cw20 } from '../../src/schemas/index.js'

const rpcUrl = inject('rpcUrl')
const mnemonic = inject('mnemonic')

const RECIPIENT_MNEMONIC = 'zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo wrong'

describe('cosmore e2e: cw20 on local wasmd', () => {
  let client: SigningCosmWasmClient
  let address: string
  let recipientAddress: string
  let contractAddress: string

  it('connects and deploys cw20 contract', async () => {
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: 'wasm',
    })
    const accounts = await wallet.getAccounts()
    address = accounts[0]!.address

    const recipientWallet = await DirectSecp256k1HdWallet.fromMnemonic(
      RECIPIENT_MNEMONIC,
      { prefix: 'wasm' },
    )
    const recipientAccounts = await recipientWallet.getAccounts()
    recipientAddress = recipientAccounts[0]!.address

    client = await SigningCosmWasmClient.connectWithSigner(rpcUrl, wallet, {
      gasPrice: GasPrice.fromString('0stake'),
    })

    // Upload cw20_base.wasm
    const wasmPath = path.join(
      import.meta.dirname,
      '..',
      'testdata',
      'cw20_base.wasm',
    )
    const wasmCode = fs.readFileSync(wasmPath)
    const { codeId } = await client.upload(address, wasmCode, 'auto')
    expect(codeId).toBeGreaterThan(0)

    // Instantiate cw20 token
    const result = await client.instantiate(
      address,
      codeId,
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

  it('queries balance via cosmore typed contract', async () => {
    const token = createTypedContract(client, contractAddress, cw20)
    const result = await token.query('balance', { address })
    expect(result).toEqual({ balance: '1000000' })
  })

  it('queries token_info via cosmore typed contract', async () => {
    const token = createTypedContract(client, contractAddress, cw20)
    const result = await token.query('token_info', {})
    expect(result).toMatchObject({
      name: 'Test Token',
      symbol: 'TEST',
      decimals: 6,
    })
  })

  it('executes transfer via cosmore typed contract', async () => {
    const token = createTypedContract(
      client as CosmWasmExecuteClient,
      contractAddress,
      cw20,
    )

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

  it('executes mint via cosmore typed contract', async () => {
    const token = createTypedContract(
      client as CosmWasmExecuteClient,
      contractAddress,
      cw20,
    )

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
    const token = createTypedContract(
      client as CosmWasmExecuteClient,
      contractAddress,
      cw20,
    )

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
