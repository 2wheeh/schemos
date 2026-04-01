# Feasibility Spike Findings

Date: 2026-04-01

## Go/No-Go: GO

All critical assumptions validated. `FromSchema<T>` and `Ajv` work with real CosmWasm `cargo schema` output.

---

## 1. Does `FromSchema` handle raw oneOf envelopes?

**YES.** `FromSchema<typeof cw20ExecuteMsg>` correctly produces a discriminated union:

```typescript
type ExecuteMsg =
  | { transfer: { amount: string; recipient: string } }
  | { burn: { amount: string } }
  | { send: { amount: string; contract: string; msg: string } }
  | { mint: { amount: string; recipient: string } }
```

### Type-level extraction works:
- `Extract<ExecuteMsg, { transfer: unknown }>` extracts individual variants
- `keyof T & string` on the union extracts message names as `'transfer' | 'burn' | 'send' | 'mint'`
- `T extends Record<K, infer V> ? V : never` extracts args for a specific message name

### Implication:
**No `decomposeSchema()` utility needed.** `createTypedContract` can accept the raw oneOf schema directly. The API signature will use `FromSchema<T>` on the full schema and extract variants at the type level.

---

## 2. Does `$ref`/`definitions` resolve correctly?

**YES.** `FromSchema` resolves `$ref: '#/definitions/Uint128'` to `string` correctly in the `as const` context. Both `Uint128` and `Binary` definitions resolve as expected.

---

## 3. Is `json-schema-to-ts` a devDependency or dependency?

**devDependency.** cosmore only uses `import type { FromSchema }` — a type-only import. The package does export runtime values (`$Compiler`, `wrapCompilerAsTypeGuard`, etc.), but cosmore does not use them. Since `verbatimModuleSyntax` enforces `import type`, the runtime exports are never included in cosmore's output.

However, consumers of cosmore who want to use `FromSchema` directly would need to install `json-schema-to-ts` themselves. For cosmore's published package, it is correctly a `devDependency`.

---

## 4. Ajv $ref strategy

**Compile the full schema, not sub-schemas.** Confirmed:

- `ajv.compile(fullOneOfSchema)` — works correctly, resolves all `$ref`
- `ajv.compile(subSchemaWithRef)` — **throws** because `$ref` cannot resolve without the parent `definitions` block

### Strategy for `createTypedContract`:
Compile the full oneOf schema once with `ajv.compile()`. Validate the full envelope message (e.g., `{ transfer: { amount: '1000', recipient: '...' } }`) against the compiled validator. The oneOf constraint ensures only one variant matches.

### Implication:
The runtime validation step constructs the full envelope `{ [msgName]: args }` and validates it against the compiled full schema. This is simpler than extracting sub-schemas and handles `$ref` correctly.

---

## 5. Ajv import pattern

With `verbatimModuleSyntax` + `module: NodeNext`, use:

```typescript
import { Ajv } from 'ajv'
```

Not `import Ajv from 'ajv'` (fails with verbatimModuleSyntax).

---

## 6. API Design Decision

Based on these findings, `createTypedContract` will:

1. Accept the **raw oneOf schema** from `cargo schema` output (no decomposition needed)
2. Use `FromSchema<TSchema>` to infer the full union type
3. Extract message names and args at the type level using conditional types
4. Compile the full schema once with `Ajv` for runtime validation
5. Validate the full envelope message `{ [msgName]: args }` against the compiled validator
