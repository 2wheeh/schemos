# Wallet Integration

cosmore is client-agnostic — it wraps any signing client through a minimal interface. This document shows how to integrate with popular Cosmos wallet libraries.

## interchain-kit

[interchain-kit](https://github.com/cosmology-tech/interchain-kit) provides React hooks for wallet connection with interchainjs signing clients.

```typescript
import { useMemo } from 'react'
import { useWalletManager } from '@interchain-kit/react'
import { toEncoders } from '@interchainjs/cosmos/utils'
import { MsgExecuteContract } from '@xpla/xplajs/cosmwasm/wasm/v1/tx'
import { createGetSmartContractState } from '@xpla/xplajs/cosmwasm/wasm/v1/query.rpc.func'
import { createExecuteAdapter } from 'cosmore/telescope'
import { createTypedContract } from 'cosmore'
import { cw20 } from 'cosmore/schemas'

/**
 * Hook: create a typed CW20 contract from interchain-kit wallet.
 *
 * The telescope adapter bridges interchainjs signing clients to cosmore.
 * MsgExecuteContract comes from the chain's telescope package (xplajs, osmojs, etc.)
 * because CosmWasm types are not in @interchainjs/cosmos-types.
 */
function useCw20(contractAddress: string, rpcEndpoint: string) {
  const wm = useWalletManager()
  const { currentWalletName } = wm
  const chainName = 'xpla' // or 'osmosis', etc.

  return useMemo(() => {
    const signingClient = wm.getSigningClient(currentWalletName, chainName)
    if (!signingClient) return null

    // Register the MsgExecuteContract encoder
    signingClient.addEncoders(toEncoders(MsgExecuteContract))

    // Create telescope query function
    const smartContractState = createGetSmartContractState(rpcEndpoint)

    // Build cosmore adapter
    const adapter = createExecuteAdapter(
      smartContractState,
      (sender, msgs, fee, memo) =>
        signingClient.signAndBroadcast(sender, msgs, fee, memo),
      (p) =>
        MsgExecuteContract.encode(
          MsgExecuteContract.fromPartial({ ...p, funds: [...p.funds] }),
        ).finish(),
    )

    return createTypedContract(adapter, contractAddress, cw20)
  }, [wm, currentWalletName, contractAddress, rpcEndpoint])
}

// Usage in component
function TransferButton() {
  const token = useCw20('xpla1contract...', 'https://rpc.xpla.io')
  const { address } = useWalletManager() // sender address

  const handleTransfer = async () => {
    await token?.execute(
      address,
      'transfer',
      { recipient: 'xpla1...', amount: '1000' },
      'auto',
    )
  }

  return <button onClick={handleTransfer}>Transfer</button>
}
```

### Query-only (no wallet required)

```typescript
import { createGetSmartContractState } from '@xpla/xplajs/cosmwasm/wasm/v1/query.rpc.func'
import { createQueryAdapter } from 'cosmore/telescope'
import { createTypedContract } from 'cosmore'
import { cw20 } from 'cosmore/schemas'

function useTokenBalance(contractAddress: string, rpcEndpoint: string) {
  const smartContractState = createGetSmartContractState(rpcEndpoint)
  const adapter = createQueryAdapter(smartContractState)
  const token = createTypedContract(adapter, contractAddress, {
    query: cw20.query,
    responses: cw20.responses,
  })

  // No wallet needed — read-only
  return useQuery({
    queryKey: ['balance', contractAddress, address],
    queryFn: () => token.query('balance', { address }),
  })
}
```

## cosmos-kit

[cosmos-kit](https://github.com/cosmology-tech/cosmos-kit) provides React hooks with cosmjs signing clients.

Since cosmjs's `SigningCosmWasmClient` is directly compatible with cosmore, **no adapter is needed**:

```typescript
import { useMemo } from 'react'
import { useChain } from '@cosmos-kit/react'
import { createTypedContract } from 'cosmore'
import { cw20 } from 'cosmore/schemas'

/**
 * Hook: create a typed CW20 contract from cosmos-kit wallet.
 *
 * cosmos-kit returns a cosmjs SigningCosmWasmClient which cosmore
 * accepts directly — no telescope adapter needed.
 */
function useCw20(contractAddress: string) {
  const { getSigningCosmWasmClient } = useChain('osmosis')

  return useMemo(async () => {
    const client = await getSigningCosmWasmClient()
    if (!client) return null

    // cosmjs client works directly with cosmore — no adapter
    return createTypedContract(client, contractAddress, cw20)
  }, [getSigningCosmWasmClient, contractAddress])
}

// Usage in component
function MintButton() {
  const token = useCw20('osmo1contract...')
  const { address } = useChain('osmosis')

  const handleMint = async () => {
    const contract = await token
    await contract?.execute(
      address,
      'mint',
      { recipient: address, amount: '5000' },
      'auto',
    )
  }

  return <button onClick={handleMint}>Mint</button>
}
```

### Query-only with cosmos-kit

```typescript
import { useChain } from '@cosmos-kit/react'
import { createTypedContract } from 'cosmore'
import { cw20 } from 'cosmore/schemas'

function useTokenInfo(contractAddress: string) {
  const { getCosmWasmClient } = useChain('osmosis')

  return useQuery({
    queryKey: ['token-info', contractAddress],
    queryFn: async () => {
      const client = await getCosmWasmClient()
      const token = createTypedContract(client, contractAddress, {
        query: cw20.query,
        responses: cw20.responses,
      })
      return token.query('token_info', {})
      // Returns: { name: string, symbol: string, decimals: number, total_supply: string }
    },
  })
}
```

## graz

[graz](https://github.com/graz-sh/graz) provides lightweight React hooks for Cosmos with cosmjs signing clients.

Like cosmos-kit, cosmjs clients work directly with cosmore — **no adapter needed**:

```typescript
import { useMemo } from 'react'
import { useAccount, useCosmWasmSigningClient } from 'graz'
import { createTypedContract } from 'cosmore'
import { cw20 } from 'cosmore/schemas'

function useCw20(contractAddress: string) {
  const { data: client } = useCosmWasmSigningClient()

  return useMemo(() => {
    if (!client) return null
    return createTypedContract(client, contractAddress, cw20)
  }, [client, contractAddress])
}

// Usage in component
function TransferForm() {
  const token = useCw20('osmo1contract...')
  const { data: account } = useAccount()

  const handleTransfer = async () => {
    await token?.execute(
      account!.bech32Address,
      'transfer',
      { recipient: 'osmo1...', amount: '1000' },
      'auto',
    )
  }

  return <button onClick={handleTransfer}>Transfer</button>
}
```

### Query-only with graz

```typescript
import { useCosmWasmClient } from 'graz'
import { createTypedContract } from 'cosmore'
import { cw20 } from 'cosmore/schemas'

function useTokenBalance(contractAddress: string, address: string) {
  const { data: client } = useCosmWasmClient()

  return useQuery({
    queryKey: ['balance', contractAddress, address],
    queryFn: async () => {
      if (!client) throw new Error('Client not ready')
      const token = createTypedContract(client, contractAddress, {
        query: cw20.query,
        responses: cw20.responses,
      })
      return token.query('balance', { address })
      // Returns: { balance: string }
    },
    enabled: !!client,
  })
}
```

## Comparison

| | interchain-kit | cosmos-kit | graz |
|---|---|---|---|
| Signing client | interchainjs | cosmjs | cosmjs |
| Adapter needed | Yes (`cosmore/telescope`) | No (direct) | No (direct) |
| MsgExecuteContract source | Chain telescope package | Built into cosmjs | Built into cosmjs |
| Wallet support | Keplr, Cosmostation, WalletConnect | Keplr, Leap, Cosmostation, +20 more | Keplr, Leap, Cosmostation, WalletConnect, +more |
| React hooks | `useWalletManager()` | `useChain()` | `useCosmWasmSigningClient()` |
| Bundle size | Larger (interchainjs) | Medium | Lightweight |

All approaches give you the same cosmore DX — type-safe execute/query with autocomplete and runtime validation. The difference is only in how the signing client is obtained and whether an adapter is needed.
