export interface Coin {
  readonly denom: string
  readonly amount: string
}

export interface StdFee {
  readonly amount: readonly Coin[]
  readonly gas: string
}
