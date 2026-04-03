/**
 * E2E tests for Level 2 (createMsgBuilder) real-world patterns.
 *
 * Verifies that Level 2 output plugs directly into SDK APIs for:
 * 1. Batch transactions (multiple messages in one tx)
 * 2. Simulate-then-execute (gas estimation before broadcast)
 * 3. Multi-operation batching (mint + transfer in one tx)
 *
 * Tests both cosmjs and telescope paths.
 */
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing'
import { GasPrice } from '@cosmjs/stargate'
import { MsgExecuteContract } from '@xpla/xplajs/cosmwasm/wasm/v1/tx.js'
import { describe, expect, inject, it } from 'vitest'
import { Json } from '../../src/encoding/index.js'
import { createMsgBuilder } from '../../src/msg.js'
import { cw20 } from '../../src/schemas/index.js'

const rpcUrl = inject('rpcUrl')
const mnemonic = inject('mnemonic')
const address = inject('address')
const recipientAddress = inject('recipientAddress')
const cw20CodeId = inject('cw20CodeId')

async function instantiateCw20(client: SigningCosmWasmClient, label: string) {
  const { contractAddress } = await client.instantiate(
    address,
    cw20CodeId,
    {
      name: 'Pattern Test Token',
      symbol: 'PTT',
      decimals: 6,
      initial_balances: [{ address, amount: '1000000' }],
      mint: { minter: address },
    },
    label,
    'auto',
  )
  return contractAddress
}

async function createClient() {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
    prefix: 'wasm',
  })
  return SigningCosmWasmClient.connectWithSigner(rpcUrl, wallet, {
    gasPrice: GasPrice.fromString('0stake'),
  })
}

// ---------------------------------------------------------------------------
// Pattern 1: Batch — cosmjs executeMultiple with Level 2 output
// ---------------------------------------------------------------------------
describe('Pattern 1: Batch transactions', () => {
  let client: SigningCosmWasmClient
  let contractAddress: string

  it('setup', async () => {
    client = await createClient()
    contractAddress = await instantiateCw20(client, 'cw20-batch')
  })

  it('cosmjs: batch via executeMultiple with Level 2 envelopes', async () => {
    const cw20Msg = createMsgBuilder(cw20.execute)

    await client.executeMultiple(
      address,
      [
        {
          contractAddress,
          msg: cw20Msg('transfer', {
            recipient: recipientAddress,
            amount: '100',
          }),
          funds: [],
        },
        {
          contractAddress,
          msg: cw20Msg('transfer', {
            recipient: recipientAddress,
            amount: '200',
          }),
          funds: [],
        },
      ],
      'auto',
    )

    const result = await client.queryContractSmart(contractAddress, {
      balance: { address: recipientAddress },
    })
    expect(result).toEqual({ balance: '300' })
  })

  it('telescope: batch via signAndBroadcast with Level 2 + Json.toBytes', async () => {
    const cw20Msg = createMsgBuilder(cw20.execute)

    const messages = [
      MsgExecuteContract.toProtoMsg(
        MsgExecuteContract.fromPartial({
          sender: address,
          contract: contractAddress,
          msg: Json.toBytes(
            cw20Msg('transfer', {
              recipient: recipientAddress,
              amount: '50',
            }),
          ),
          funds: [],
        }),
      ),
      MsgExecuteContract.toProtoMsg(
        MsgExecuteContract.fromPartial({
          sender: address,
          contract: contractAddress,
          msg: Json.toBytes(
            cw20Msg('transfer', {
              recipient: recipientAddress,
              amount: '50',
            }),
          ),
          funds: [],
        }),
      ),
    ]

    await client.signAndBroadcast(address, messages, 'auto')

    const result = await client.queryContractSmart(contractAddress, {
      balance: { address: recipientAddress },
    })
    // 300 from previous test + 100 from this test
    expect(result).toEqual({ balance: '400' })
  })
})

// ---------------------------------------------------------------------------
// Pattern 2: Simulate-then-execute
// ---------------------------------------------------------------------------
describe('Pattern 2: Simulate-then-execute', () => {
  let client: SigningCosmWasmClient
  let contractAddress: string

  it('setup', async () => {
    client = await createClient()
    contractAddress = await instantiateCw20(client, 'cw20-simulate')
  })

  it('cosmjs: simulate gas then execute with Level 2 envelope', async () => {
    const cw20Msg = createMsgBuilder(cw20.execute)
    const envelope = cw20Msg('transfer', {
      recipient: recipientAddress,
      amount: '500',
    })

    const message = MsgExecuteContract.toProtoMsg(
      MsgExecuteContract.fromPartial({
        sender: address,
        contract: contractAddress,
        msg: Json.toBytes(envelope),
        funds: [],
      }),
    )

    // Step 1: Simulate
    const gasEstimate = await client.simulate(address, [message], undefined)
    expect(gasEstimate).toBeGreaterThan(0)

    // Step 2: Execute with estimated gas
    const fee = {
      amount: [{ denom: 'stake', amount: '0' }],
      gas: Math.ceil(gasEstimate * 1.3).toString(),
    }
    await client.signAndBroadcast(address, [message], fee)

    const result = await client.queryContractSmart(contractAddress, {
      balance: { address: recipientAddress },
    })
    expect(result).toEqual({ balance: '500' })
  })
})

// ---------------------------------------------------------------------------
// Pattern 3: Multi-operation batch (mint + transfer in one tx)
// ---------------------------------------------------------------------------
describe('Pattern 3: Multi-operation batch', () => {
  let client: SigningCosmWasmClient
  let contractAddress: string

  it('setup', async () => {
    client = await createClient()
    contractAddress = await instantiateCw20(client, 'cw20-multi-op')
  })

  it('cosmjs: mint + transfer in one tx via executeMultiple', async () => {
    const cw20Msg = createMsgBuilder(cw20.execute)

    await client.executeMultiple(
      address,
      [
        {
          contractAddress,
          msg: cw20Msg('mint', { recipient: address, amount: '5000' }),
          funds: [],
        },
        {
          contractAddress,
          msg: cw20Msg('transfer', {
            recipient: recipientAddress,
            amount: '1000',
          }),
          funds: [],
        },
      ],
      'auto',
    )

    const senderBalance = await client.queryContractSmart(contractAddress, {
      balance: { address },
    })
    // 1000000 initial + 5000 minted - 1000 transferred = 1004000
    expect(senderBalance).toEqual({ balance: '1004000' })

    const recipientBalance = await client.queryContractSmart(contractAddress, {
      balance: { address: recipientAddress },
    })
    expect(recipientBalance).toEqual({ balance: '1000' })
  })
})
