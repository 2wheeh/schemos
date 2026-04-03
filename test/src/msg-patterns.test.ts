/**
 * E2E tests for Level 2 (createMsgBuilder) real-world patterns.
 *
 * Verifies that Level 2 output plugs directly into SDK APIs:
 *
 * cosmjs path:
 *   - executeMultiple (batch)
 *   - signAndBroadcast with EncodeObject (plain object value)
 *   - simulate → signAndBroadcast (gas estimation)
 *
 * telescope (interchainjs) path:
 *   - DirectSigner.signAndBroadcast with xplajs encoder
 */
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing'
import { GasPrice } from '@cosmjs/stargate'
import { CosmosClientFactory } from '@interchainjs/cosmos/client-factory'
import { DirectSigner } from '@interchainjs/cosmos/signers/direct-signer'
import { Secp256k1HDWallet } from '@interchainjs/cosmos/wallets/secp256k1hd'
import { MsgExecuteContract as TelescopeMsgExecuteContract } from '@xpla/xplajs/cosmwasm/wasm/v1/tx.js'
import { MessageComposer } from '@xpla/xplajs/cosmwasm/wasm/v1/tx.registry.js'
import { MsgExecuteContract as CosmjsMsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'
import { createMsgBuilder, Json } from 'schemos'
import { cw20 } from 'schemos/schemas'
import { describe, expect, inject, it } from 'vitest'

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

async function createCosmjsClient() {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
    prefix: 'wasm',
  })
  return SigningCosmWasmClient.connectWithSigner(rpcUrl, wallet, {
    gasPrice: GasPrice.fromString('0stake'),
  })
}

// ---------------------------------------------------------------------------
// cosmjs patterns
// ---------------------------------------------------------------------------
describe('cosmjs: executeMultiple with Level 2 envelopes', () => {
  let client: SigningCosmWasmClient
  let contractAddress: string

  it('setup', async () => {
    client = await createCosmjsClient()
    contractAddress = await instantiateCw20(client, 'cw20-cosmjs-batch')
  })

  it('batch transfer via executeMultiple', async () => {
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

  it('mint + transfer in one tx via executeMultiple', async () => {
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
    // 1000000 initial + 5000 minted - 1000 transferred - 300 from prev test
    expect(senderBalance).toEqual({ balance: '1003700' })

    const recipientBalance = await client.queryContractSmart(contractAddress, {
      balance: { address: recipientAddress },
    })
    // 300 from prev test + 1000 from this test
    expect(recipientBalance).toEqual({ balance: '1300' })
  })
})

describe('cosmjs: signAndBroadcast with EncodeObject', () => {
  let client: SigningCosmWasmClient
  let contractAddress: string

  it('setup', async () => {
    client = await createCosmjsClient()
    contractAddress = await instantiateCw20(client, 'cw20-cosmjs-broadcast')
  })

  it('batch transfer via signAndBroadcast', async () => {
    const cw20Msg = createMsgBuilder(cw20.execute)

    // cosmjs-types provides MsgExecuteContract.fromPartial() for type-safe
    // message construction. typeUrl must be set manually.
    const messages = [
      {
        typeUrl: CosmjsMsgExecuteContract.typeUrl,
        value: CosmjsMsgExecuteContract.fromPartial({
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
      },
      {
        typeUrl: CosmjsMsgExecuteContract.typeUrl,
        value: CosmjsMsgExecuteContract.fromPartial({
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
      },
    ]

    await client.signAndBroadcast(address, messages, 'auto')

    const result = await client.queryContractSmart(contractAddress, {
      balance: { address: recipientAddress },
    })
    expect(result).toEqual({ balance: '100' })
  })

  it('simulate then execute', async () => {
    const cw20Msg = createMsgBuilder(cw20.execute)
    const envelope = cw20Msg('transfer', {
      recipient: recipientAddress,
      amount: '500',
    })

    const message = {
      typeUrl: CosmjsMsgExecuteContract.typeUrl,
      value: CosmjsMsgExecuteContract.fromPartial({
        sender: address,
        contract: contractAddress,
        msg: Json.toBytes(envelope),
        funds: [],
      }),
    }

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
    // 100 from prev test + 500 from this test
    expect(result).toEqual({ balance: '600' })
  })
})

// ---------------------------------------------------------------------------
// telescope (interchainjs) patterns
// ---------------------------------------------------------------------------
describe('telescope: DirectSigner.signAndBroadcast with xplajs encoder', () => {
  let cosmjsClient: SigningCosmWasmClient
  let contractAddress: string

  it('setup', async () => {
    // instantiate via cosmjs (cosmock compatible)
    cosmjsClient = await createCosmjsClient()
    contractAddress = await instantiateCw20(
      cosmjsClient,
      'cw20-telescope-broadcast',
    )
  })

  it('batch transfer via DirectSigner', async () => {
    const queryClient = await CosmosClientFactory.createQueryClient(rpcUrl)
    const wallet = await Secp256k1HDWallet.fromMnemonic(mnemonic, {
      derivations: [{ hdPath: "m/44'/118'/0'/0/0", prefix: 'wasm' }],
    })
    const signer = new DirectSigner(wallet, { queryClient })
    signer.addEncoders([TelescopeMsgExecuteContract])

    // Verify interchainjs derives the same address as cosmjs
    const accounts = await signer.getAccounts()
    const signerAddress = accounts[0]!.address
    expect(signerAddress).toBe(address)

    const cw20Msg = createMsgBuilder(cw20.execute)

    // MessageComposer.fromPartial builds { typeUrl, value } from partial input.
    // The registered encoder (MsgExecuteContract) encodes the value internally.
    const messages = [
      MessageComposer.fromPartial.executeContract({
        sender: signerAddress,
        contract: contractAddress,
        msg: Json.toBytes(
          cw20Msg('transfer', {
            recipient: recipientAddress,
            amount: '50',
          }),
        ),
        funds: [],
      }),
      MessageComposer.fromPartial.executeContract({
        sender: signerAddress,
        contract: contractAddress,
        msg: Json.toBytes(
          cw20Msg('transfer', {
            recipient: recipientAddress,
            amount: '50',
          }),
        ),
        funds: [],
      }),
    ]

    await signer.signAndBroadcast(signerAddress, messages, {
      amount: [],
      gas: '500000',
    })

    // interchainjs uses BroadcastTxSync — wait for block inclusion
    await new Promise((r) => setTimeout(r, 1500))

    const balance = await cosmjsClient.queryContractSmart(contractAddress, {
      balance: { address: recipientAddress },
    })
    expect(balance).toEqual({ balance: '100' })
  })
})
