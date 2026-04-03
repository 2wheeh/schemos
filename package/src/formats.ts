/**
 * Custom Ajv format validators for CosmWasm-specific integer formats.
 *
 * The `cosmwasm-schema` Rust crate emits JSON Schemas with format annotations
 * like `"format": "uint64"` on `type: "integer"` fields. Ajv validates these
 * as strings by default; we register numeric validators instead.
 *
 * Formats covered: uint8, uint32, uint64
 * (These are the only formats appearing in the bundled cw20/cw721 schemas.)
 */

export interface FormatDefinition {
  type: 'number'
  validate: (value: number) => boolean
}

/** uint8: integer in [0, 255] */
export const uint8Format: FormatDefinition = {
  type: 'number',
  validate: (v: number) => Number.isInteger(v) && v >= 0 && v <= 255,
}

/** uint32: integer in [0, 4294967295] */
export const uint32Format: FormatDefinition = {
  type: 'number',
  validate: (v: number) => Number.isInteger(v) && v >= 0 && v <= 4_294_967_295,
}

/**
 * uint64: integer in [0, 2^64 - 1].
 *
 * JavaScript numbers cannot represent the full uint64 range exactly (max safe
 * integer is 2^53 - 1). We accept any non-negative safe integer here, which
 * matches what JSON parsers can round-trip without loss. Values above
 * Number.MAX_SAFE_INTEGER must be handled via BigInt at the application layer.
 */
export const uint64Format: FormatDefinition = {
  type: 'number',
  validate: (v: number) =>
    Number.isInteger(v) && v >= 0 && v <= Number.MAX_SAFE_INTEGER,
}

export const cosmwasmFormats = {
  uint8: uint8Format,
  uint32: uint32Format,
  uint64: uint64Format,
} as const
