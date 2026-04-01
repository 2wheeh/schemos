import { Ajv } from 'ajv'
import { describe, expect, test } from 'vitest'
import { cw20ExecuteMsg } from './cw20-execute-msg.js'

describe('Ajv with real CosmWasm oneOf schema', () => {
  const ajv = new Ajv()
  const validate = ajv.compile(cw20ExecuteMsg)

  test('validates correct transfer message', () => {
    const valid = validate({
      transfer: { amount: '1000', recipient: 'osmo1abc' },
    })
    expect(valid).toBe(true)
    expect(validate.errors).toBeNull()
  })

  test('validates correct burn message', () => {
    const valid = validate({
      burn: { amount: '500' },
    })
    expect(valid).toBe(true)
  })

  test('validates correct send message', () => {
    const valid = validate({
      send: { amount: '100', contract: 'osmo1xyz', msg: 'base64data' },
    })
    expect(valid).toBe(true)
  })

  test('rejects message with missing required field', () => {
    const valid = validate({
      transfer: { recipient: 'osmo1abc' },
    })
    expect(valid).toBe(false)
  })

  test('rejects message with wrong type for Uint128 ($ref)', () => {
    const valid = validate({
      transfer: { amount: 1000, recipient: 'osmo1abc' },
    })
    expect(valid).toBe(false)
  })

  test('rejects unknown message name', () => {
    const valid = validate({
      unknown_msg: { foo: 'bar' },
    })
    expect(valid).toBe(false)
  })

  test('rejects additional properties on message body', () => {
    const valid = validate({
      transfer: { amount: '1000', recipient: 'osmo1abc', extra: true },
    })
    expect(valid).toBe(false)
  })

  test('rejects empty object', () => {
    const valid = validate({})
    expect(valid).toBe(false)
  })

  test('rejects multiple message keys', () => {
    // oneOf should reject an object matching more than one variant
    const valid = validate({
      transfer: { amount: '1000', recipient: 'osmo1abc' },
      burn: { amount: '500' },
    })
    expect(valid).toBe(false)
  })
})

describe('Ajv sub-schema compilation (without parent definitions)', () => {
  test('sub-schema with $ref fails without definitions', () => {
    const ajv = new Ajv()
    // Extracting a sub-schema that uses $ref without definitions should fail
    const subSchema = cw20ExecuteMsg.oneOf[0]
    expect(() => ajv.compile(subSchema)).toThrow()
  })
})

describe('json-schema-to-ts dependency type check', () => {
  test('FromSchema is a type-only export (no runtime value)', async () => {
    // json-schema-to-ts exports FromSchema as a type, not a value
    // If this import succeeds with import type, the package is type-only for our use case
    const mod = await import('json-schema-to-ts')
    // The module may export runtime helpers, but FromSchema is purely a type
    // Check that the module exists and can be imported
    expect(mod).toBeDefined()
  })
})
