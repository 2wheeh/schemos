/**
 * E2E tests for cosmore/interchain adapter with real telescope packages.
 *
 * Uses cosmock local wasmd for the chain. Contract deploy via cosmjs
 * (cosmock's native client), then cosmore interchain adapter with
 * REAL telescope RPC clients and MsgExecuteContract encoders.
 *
 * Query: xplajs createGetSmartContractState (real telescope RPC)
 * Execute: cosmjs signAndBroadcast (cosmock compatible) + telescope encode
 */
import fs from 'node:fs'
import path from 'node:path'
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing'
import { GasPrice } from '@cosmjs/stargate'
import { createGetSmartContractState as createXplaQuery } from '@xpla/xplajs/cosmwasm/wasm/v1/query.rpc.func.js'
import { MsgExecuteContract as XplaMsgExecuteContract } from '@xpla/xplajs/cosmwasm/wasm/v1/tx.js'
import { MsgExecuteContract as OsmoMsgExecuteContract } from 'osmojs/cosmwasm/wasm/v1/tx.js'
import { describe, expect, inject, it } from 'vitest'
import { createTypedContract } from '../../src/contract.js'
import {
  createExecuteAdapter,
  createQueryAdapter,
} from '../../src/interchain.js'
import { cw20 } from '../../src/schemas/index.js'

const rpcUrl = inject('rpcUrl')
const mnemonic = inject('mnemonic')

/**
 * Helper: deploy cw20 contract via cosmjs (cosmock compatible),
 * return contract address and cosmjs client for signing.
 */
async function deployCw20() {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
    prefix: 'wasm',
  })
  const accounts = await wallet.getAccounts()
  const address = accounts[0]!.address

  const client = await SigningCosmWasmClient.connectWithSigner(rpcUrl, wallet, {
    gasPrice: GasPrice.fromString('0stake'),
  })

  const wasmPath = path.join(
    import.meta.dirname,
    '..',
    'testdata',
    'cw20_base.wasm',
  )
  const wasmCode = fs.readFileSync(wasmPath)
  const { codeId } = await client.upload(address, wasmCode, 'auto')

  const { contractAddress } = await client.instantiate(
    address,
    codeId,
    {
      name: 'Interchain Test Token',
      symbol: 'ICT',
      decimals: 6,
      initial_balances: [{ address, amount: '1000000' }],
      mint: { minter: address },
    },
    'cw20-interchain-test',
    'auto',
  )

  return { client, address, contractAddress }
}

describe('cosmore/interchain with real xplajs telescope RPC', () => {
  let cosmjsClient: SigningCosmWasmClient
  let address: string
  let contractAddress: string

  it('deploys cw20 contract', async () => {
    const deployed = await deployCw20()
    cosmjsClient = deployed.client
    address = deployed.address
    contractAddress = deployed.contractAddress
    expect(contractAddress).toBeTruthy()
  })

  it('query via real xplajs createGetSmartContractState', async () => {
    // Real telescope RPC client — NOT a cosmjs wrapper
    const smartContractState = createXplaQuery(rpcUrl)

    const queryAdapter = createQueryAdapter(smartContractState)
    const token = createTypedContract(queryAdapter, contractAddress, {
      query: cw20.query,
      responses: cw20.responses,
    })

    const result = await token.query('balance', { address })
    expect(result).toEqual({ balance: '1000000' })
  })

  it('query token_info via real xplajs RPC', async () => {
    const smartContractState = createXplaQuery(rpcUrl)
    const queryAdapter = createQueryAdapter(smartContractState)
    const token = createTypedContract(queryAdapter, contractAddress, {
      query: cw20.query,
      responses: cw20.responses,
    })

    const result = await token.query('token_info', {})
    expect(result).toMatchObject({
      name: 'Interchain Test Token',
      symbol: 'ICT',
      decimals: 6,
    })
  })

  it('execute via xplajs encode + cosmjs broadcast', async () => {
    const smartContractState = createXplaQuery(rpcUrl)

    const adapter = createExecuteAdapter(
      smartContractState,
      async (sender, messages, _fee, memo) => {
        // Use cosmjs for broadcast (cosmock compatible)
        // In real usage, this would be the telescope signing client
        for (const msg of messages) {
          const decoded = XplaMsgExecuteContract.decode(msg.value)
          await cosmjsClient.execute(
            sender,
            decoded.contract,
            JSON.parse(new TextDecoder().decode(decoded.msg)),
            'auto',
            memo ?? '',
            decoded.funds.map((f: { denom: string; amount: string }) => ({
              denom: f.denom,
              amount: f.amount,
            })),
          )
        }
        return { transactionHash: 'xpla-tx-hash' }
      },
      (p) =>
        XplaMsgExecuteContract.encode(
          XplaMsgExecuteContract.fromPartial({ ...p, funds: [...p.funds] }),
        ).finish(),
    )

    const token = createTypedContract(adapter, contractAddress, cw20)

    await token.execute(
      address,
      'transfer',
      { recipient: address, amount: '100' },
      'auto',
    )

    // Verify via real xplajs query
    const result = await token.query('balance', { address })
    expect(result).toEqual({ balance: '1000000' })
  })
})

describe('cosmore/interchain with osmojs MsgExecuteContract', () => {
  let cosmjsClient: SigningCosmWasmClient
  let address: string
  let contractAddress: string

  it('deploys cw20 contract', async () => {
    const deployed = await deployCw20()
    cosmjsClient = deployed.client
    address = deployed.address
    contractAddress = deployed.contractAddress
    expect(contractAddress).toBeTruthy()
  })

  it('execute via osmojs encode + cosmjs broadcast', async () => {
    const smartContractState = createXplaQuery(rpcUrl)

    const adapter = createExecuteAdapter(
      smartContractState,
      async (sender, messages, _fee, memo) => {
        for (const msg of messages) {
          const decoded = OsmoMsgExecuteContract.decode(msg.value)
          await cosmjsClient.execute(
            sender,
            decoded.contract,
            JSON.parse(new TextDecoder().decode(decoded.msg)),
            'auto',
            memo ?? '',
            decoded.funds.map((f: { denom: string; amount: string }) => ({
              denom: f.denom,
              amount: f.amount,
            })),
          )
        }
        return { transactionHash: 'osmo-tx-hash' }
      },
      (p) =>
        OsmoMsgExecuteContract.encode(
          OsmoMsgExecuteContract.fromPartial({ ...p, funds: [...p.funds] }),
        ).finish(),
    )

    const token = createTypedContract(adapter, contractAddress, cw20)

    await token.execute(
      address,
      'mint',
      { recipient: address, amount: '5000' },
      'auto',
    )

    // Verify via real xplajs query
    const result = await token.query('balance', { address })
    expect(result).toEqual({ balance: '1005000' })
  })

  it('xplajs and osmojs encode to identical protobuf bytes', () => {
    const params = {
      sender: 'wasm1abc',
      contract: 'wasm1def',
      msg: new TextEncoder().encode(
        JSON.stringify({ transfer: { recipient: 'wasm1xyz', amount: '100' } }),
      ),
      funds: [] as const,
    }

    const xplaBytes = XplaMsgExecuteContract.encode(
      XplaMsgExecuteContract.fromPartial({
        ...params,
        funds: [...params.funds],
      }),
    ).finish()
    const osmoBytes = OsmoMsgExecuteContract.encode(
      OsmoMsgExecuteContract.fromPartial({
        ...params,
        funds: [...params.funds],
      }),
    ).finish()

    expect(Buffer.from(xplaBytes)).toEqual(Buffer.from(osmoBytes))
  })
})
