export interface Coin {
  readonly denom: string
  readonly amount: string
}

export interface StdFee {
  amount: readonly Coin[]
  gas: string
}
