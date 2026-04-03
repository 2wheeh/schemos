/**
 * E2E tests for schemos/interchain adapter with real telescope packages.
 *
 * Uses cosmock local wasmd for the chain. Contract deploy via global-setup,
 * then schemos interchain adapter with REAL telescope RPC clients and
 * MsgExecuteContract encoders.
 *
 * Query: xplajs createGetSmartContractState (real telescope RPC)
 * Execute: cosmjs signAndBroadcast (cosmock compatible) + telescope encode
 */
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing'
import { GasPrice } from '@cosmjs/stargate'
import { createGetSmartContractState as createXplaQuery } from '@xpla/xplajs/cosmwasm/wasm/v1/query.rpc.func.js'
import { MsgExecuteContract as XplaMsgExecuteContract } from '@xpla/xplajs/cosmwasm/wasm/v1/tx.js'
import { MsgExecuteContract as OsmoMsgExecuteContract } from 'osmojs/cosmwasm/wasm/v1/tx.js'
import { describe, expect, inject, it } from 'vitest'
import {
  createExecuteAdapter,
  createQueryAdapter,
} from '../../src/adapters/telescope.js'
import { createTypedContract } from '../../src/contract.js'
import { Json } from '../../src/encoding/index.js'
import { cw20 } from '../../src/schemas/index.js'

const rpcUrl = inject('rpcUrl')
const mnemonic = inject('mnemonic')
const address = inject('address')
const cw20CodeId = inject('cw20CodeId')

async function instantiateCw20(label: string) {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
    prefix: 'wasm',
  })
  const client = await SigningCosmWasmClient.connectWithSigner(rpcUrl, wallet, {
    gasPrice: GasPrice.fromString('0stake'),
  })

  const { contractAddress } = await client.instantiate(
    address,
    cw20CodeId,
    {
      name: 'Interchain Test Token',
      symbol: 'ICT',
      decimals: 6,
      initial_balances: [{ address, amount: '1000000' }],
      mint: { minter: address },
    },
    label,
    'auto',
  )

  return { client, contractAddress }
}

describe('schemos/interchain with real xplajs telescope RPC', () => {
  let cosmjsClient: SigningCosmWasmClient
  let contractAddress: string

  it('instantiates cw20 contract', async () => {
    const deployed = await instantiateCw20('cw20-interchain-test')
    cosmjsClient = deployed.client
    contractAddress = deployed.contractAddress
    expect(contractAddress).toBeTruthy()
  })

  it('query via real xplajs createGetSmartContractState', async () => {
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
        for (const message of messages) {
          const decoded = XplaMsgExecuteContract.decode(message.value)
          await cosmjsClient.execute(
            sender,
            decoded.contract,
            Json.fromBytes(decoded.msg),
            'auto',
            memo ?? '',
            decoded.funds,
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

    const result = await token.query('balance', { address })
    expect(result).toEqual({ balance: '1000000' })
  })
})

describe('schemos/interchain with osmojs MsgExecuteContract', () => {
  let cosmjsClient: SigningCosmWasmClient
  let contractAddress: string

  it('instantiates cw20 contract', async () => {
    const deployed = await instantiateCw20('cw20-osmo-test')
    cosmjsClient = deployed.client
    contractAddress = deployed.contractAddress
    expect(contractAddress).toBeTruthy()
  })

  it('execute via osmojs encode + cosmjs broadcast', async () => {
    const smartContractState = createXplaQuery(rpcUrl)

    const adapter = createExecuteAdapter(
      smartContractState,
      async (sender, messages, _fee, memo) => {
        for (const message of messages) {
          const decoded = OsmoMsgExecuteContract.decode(message.value)
          await cosmjsClient.execute(
            sender,
            decoded.contract,
            Json.fromBytes(decoded.msg),
            'auto',
            memo ?? '',
            decoded.funds,
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

    const result = await token.query('balance', { address })
    expect(result).toEqual({ balance: '1005000' })
  })

  it('xplajs and osmojs encode to identical protobuf bytes', () => {
    const params = {
      sender: 'wasm1abc',
      contract: 'wasm1def',
      msg: Json.toBytes({
        transfer: { recipient: 'wasm1xyz', amount: '100' },
      }),
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
