/**
 * CW721 query response schemas.
 * Generated from cw-nfts cw721-base cargo schema output.
 */
export const cw721ResponseSchemas = {
  all_nft_info: {
    type: 'object',
    required: ['access', 'info'],
    properties: {
      access: {
        description: 'Who can transfer the token',
        allOf: [
          {
            $ref: '#/definitions/OwnerOfResponse',
          },
        ],
      },
      info: {
        description: 'Data on the token itself,',
        allOf: [
          {
            $ref: '#/definitions/NftInfoResponse_for_Nullable_Empty',
          },
        ],
      },
    },
    additionalProperties: false,
    definitions: {
      Addr: {
        description:
          "A human readable address.\n\nIn Cosmos, this is typically bech32 encoded. But for multi-chain smart contracts no assumptions should be made other than being UTF-8 encoded and of reasonable length.\n\nThis type represents a validated address. It can be created in the following ways 1. Use `Addr::unchecked(input)` 2. Use `let checked: Addr = deps.api.addr_validate(input)?` 3. Use `let checked: Addr = deps.api.addr_humanize(canonical_addr)?` 4. Deserialize from JSON. This must only be done from JSON that was validated before such as a contract's state. `Addr` must not be used in messages sent by the user because this would result in unvalidated instances.\n\nThis type is immutable. If you really need to mutate it (Really? Are you sure?), create a mutable copy using `let mut mutable = Addr::to_string()` and operate on that `String` instance.",
        type: 'string',
      },
      Approval: {
        type: 'object',
        required: ['expires', 'spender'],
        properties: {
          expires: {
            description: 'When the Approval expires (maybe Expiration::never)',
            allOf: [
              {
                $ref: '#/definitions/Expiration',
              },
            ],
          },
          spender: {
            description: 'Account that can transfer/send the token',
            allOf: [
              {
                $ref: '#/definitions/Addr',
              },
            ],
          },
        },
        additionalProperties: false,
      },
      Empty: {
        description:
          "An empty struct that serves as a placeholder in different places, such as contracts that don't set a custom message.\n\nIt is designed to be expressible in correct JSON and JSON Schema but contains no meaningful data. Previously we used enums without cases, but those cannot represented as valid JSON Schema (https://github.com/CosmWasm/cosmwasm/issues/451)",
        type: 'object',
        additionalProperties: false,
      },
      Expiration: {
        description:
          'Expiration represents a point in time when some event happens. It can compare with a BlockInfo and will return is_expired() == true once the condition is hit (and for every block in the future)',
        oneOf: [
          {
            description:
              'AtHeight will expire when `env.block.height` >= height',
            type: 'object',
            required: ['at_height'],
            properties: {
              at_height: {
                type: 'integer',
                format: 'uint64',
                minimum: 0,
              },
            },
            additionalProperties: false,
          },
          {
            description: 'AtTime will expire when `env.block.time` >= time',
            type: 'object',
            required: ['at_time'],
            properties: {
              at_time: {
                $ref: '#/definitions/Timestamp',
              },
            },
            additionalProperties: false,
          },
          {
            description:
              'Never will never expire. Used to express the empty variant',
            type: 'object',
            required: ['never'],
            properties: {
              never: {
                type: 'object',
                additionalProperties: false,
              },
            },
            additionalProperties: false,
          },
        ],
      },
      NftInfoResponse_for_Nullable_Empty: {
        type: 'object',
        properties: {
          extension: {
            description:
              'You can add any custom metadata here when you extend cw721-base',
            anyOf: [
              {
                $ref: '#/definitions/Empty',
              },
              {
                type: 'null',
              },
            ],
          },
          token_uri: {
            description:
              'Universal resource identifier for this NFT Should point to a JSON file that conforms to the ERC721 Metadata JSON Schema',
            type: ['string', 'null'],
          },
        },
        additionalProperties: false,
      },
      OwnerOfResponse: {
        type: 'object',
        required: ['approvals', 'owner'],
        properties: {
          approvals: {
            description:
              'If set this address is approved to transfer/send the token as well',
            type: 'array',
            items: {
              $ref: '#/definitions/Approval',
            },
          },
          owner: {
            description: 'Owner of the token',
            type: 'string',
          },
        },
        additionalProperties: false,
      },
      Timestamp: {
        description:
          'A point in time in nanosecond precision.\n\nThis type can represent times from 1970-01-01T00:00:00Z to 2554-07-21T23:34:33Z.\n\n## Examples\n\n``` # use cosmwasm_std::Timestamp; let ts = Timestamp::from_nanos(1_000_000_202); assert_eq!(ts.nanos(), 1_000_000_202); assert_eq!(ts.seconds(), 1); assert_eq!(ts.subsec_nanos(), 202);\n\nlet ts = ts.plus_seconds(2); assert_eq!(ts.nanos(), 3_000_000_202); assert_eq!(ts.seconds(), 3); assert_eq!(ts.subsec_nanos(), 202); ```',
        allOf: [
          {
            $ref: '#/definitions/Uint64',
          },
        ],
      },
      Uint64: {
        description:
          'A thin wrapper around u64 that is using strings for JSON encoding/decoding, such that the full u64 range can be used for clients that convert JSON numbers to floats, like JavaScript and jq.\n\n# Examples\n\nUse `from` to create instances of this and `u64` to get the value out:\n\n``` # use cosmwasm_std::Uint64; let a = Uint64::from(42u64); assert_eq!(a.u64(), 42);\n\nlet b = Uint64::from(70u32); assert_eq!(b.u64(), 70); ```',
        type: 'string',
      },
    },
  },
  all_operators: {
    type: 'object',
    required: ['operators'],
    properties: {
      operators: {
        type: 'array',
        items: {
          $ref: '#/definitions/Approval',
        },
      },
    },
    additionalProperties: false,
    definitions: {
      Addr: {
        description:
          "A human readable address.\n\nIn Cosmos, this is typically bech32 encoded. But for multi-chain smart contracts no assumptions should be made other than being UTF-8 encoded and of reasonable length.\n\nThis type represents a validated address. It can be created in the following ways 1. Use `Addr::unchecked(input)` 2. Use `let checked: Addr = deps.api.addr_validate(input)?` 3. Use `let checked: Addr = deps.api.addr_humanize(canonical_addr)?` 4. Deserialize from JSON. This must only be done from JSON that was validated before such as a contract's state. `Addr` must not be used in messages sent by the user because this would result in unvalidated instances.\n\nThis type is immutable. If you really need to mutate it (Really? Are you sure?), create a mutable copy using `let mut mutable = Addr::to_string()` and operate on that `String` instance.",
        type: 'string',
      },
      Approval: {
        type: 'object',
        required: ['expires', 'spender'],
        properties: {
          expires: {
            description: 'When the Approval expires (maybe Expiration::never)',
            allOf: [
              {
                $ref: '#/definitions/Expiration',
              },
            ],
          },
          spender: {
            description: 'Account that can transfer/send the token',
            allOf: [
              {
                $ref: '#/definitions/Addr',
              },
            ],
          },
        },
        additionalProperties: false,
      },
      Expiration: {
        description:
          'Expiration represents a point in time when some event happens. It can compare with a BlockInfo and will return is_expired() == true once the condition is hit (and for every block in the future)',
        oneOf: [
          {
            description:
              'AtHeight will expire when `env.block.height` >= height',
            type: 'object',
            required: ['at_height'],
            properties: {
              at_height: {
                type: 'integer',
                format: 'uint64',
                minimum: 0,
              },
            },
            additionalProperties: false,
          },
          {
            description: 'AtTime will expire when `env.block.time` >= time',
            type: 'object',
            required: ['at_time'],
            properties: {
              at_time: {
                $ref: '#/definitions/Timestamp',
              },
            },
            additionalProperties: false,
          },
          {
            description:
              'Never will never expire. Used to express the empty variant',
            type: 'object',
            required: ['never'],
            properties: {
              never: {
                type: 'object',
                additionalProperties: false,
              },
            },
            additionalProperties: false,
          },
        ],
      },
      Timestamp: {
        description:
          'A point in time in nanosecond precision.\n\nThis type can represent times from 1970-01-01T00:00:00Z to 2554-07-21T23:34:33Z.\n\n## Examples\n\n``` # use cosmwasm_std::Timestamp; let ts = Timestamp::from_nanos(1_000_000_202); assert_eq!(ts.nanos(), 1_000_000_202); assert_eq!(ts.seconds(), 1); assert_eq!(ts.subsec_nanos(), 202);\n\nlet ts = ts.plus_seconds(2); assert_eq!(ts.nanos(), 3_000_000_202); assert_eq!(ts.seconds(), 3); assert_eq!(ts.subsec_nanos(), 202); ```',
        allOf: [
          {
            $ref: '#/definitions/Uint64',
          },
        ],
      },
      Uint64: {
        description:
          'A thin wrapper around u64 that is using strings for JSON encoding/decoding, such that the full u64 range can be used for clients that convert JSON numbers to floats, like JavaScript and jq.\n\n# Examples\n\nUse `from` to create instances of this and `u64` to get the value out:\n\n``` # use cosmwasm_std::Uint64; let a = Uint64::from(42u64); assert_eq!(a.u64(), 42);\n\nlet b = Uint64::from(70u32); assert_eq!(b.u64(), 70); ```',
        type: 'string',
      },
    },
  },
  all_tokens: {
    type: 'object',
    required: ['tokens'],
    properties: {
      tokens: {
        description:
          'Contains all token_ids in lexicographical ordering If there are more than `limit`, use `start_after` in future queries to achieve pagination.',
        type: 'array',
        items: {
          type: 'string',
        },
      },
    },
    additionalProperties: false,
  },
  approval: {
    type: 'object',
    required: ['approval'],
    properties: {
      approval: {
        $ref: '#/definitions/Approval',
      },
    },
    additionalProperties: false,
    definitions: {
      Addr: {
        description:
          "A human readable address.\n\nIn Cosmos, this is typically bech32 encoded. But for multi-chain smart contracts no assumptions should be made other than being UTF-8 encoded and of reasonable length.\n\nThis type represents a validated address. It can be created in the following ways 1. Use `Addr::unchecked(input)` 2. Use `let checked: Addr = deps.api.addr_validate(input)?` 3. Use `let checked: Addr = deps.api.addr_humanize(canonical_addr)?` 4. Deserialize from JSON. This must only be done from JSON that was validated before such as a contract's state. `Addr` must not be used in messages sent by the user because this would result in unvalidated instances.\n\nThis type is immutable. If you really need to mutate it (Really? Are you sure?), create a mutable copy using `let mut mutable = Addr::to_string()` and operate on that `String` instance.",
        type: 'string',
      },
      Approval: {
        type: 'object',
        required: ['expires', 'spender'],
        properties: {
          expires: {
            description: 'When the Approval expires (maybe Expiration::never)',
            allOf: [
              {
                $ref: '#/definitions/Expiration',
              },
            ],
          },
          spender: {
            description: 'Account that can transfer/send the token',
            allOf: [
              {
                $ref: '#/definitions/Addr',
              },
            ],
          },
        },
        additionalProperties: false,
      },
      Expiration: {
        description:
          'Expiration represents a point in time when some event happens. It can compare with a BlockInfo and will return is_expired() == true once the condition is hit (and for every block in the future)',
        oneOf: [
          {
            description:
              'AtHeight will expire when `env.block.height` >= height',
            type: 'object',
            required: ['at_height'],
            properties: {
              at_height: {
                type: 'integer',
                format: 'uint64',
                minimum: 0,
              },
            },
            additionalProperties: false,
          },
          {
            description: 'AtTime will expire when `env.block.time` >= time',
            type: 'object',
            required: ['at_time'],
            properties: {
              at_time: {
                $ref: '#/definitions/Timestamp',
              },
            },
            additionalProperties: false,
          },
          {
            description:
              'Never will never expire. Used to express the empty variant',
            type: 'object',
            required: ['never'],
            properties: {
              never: {
                type: 'object',
                additionalProperties: false,
              },
            },
            additionalProperties: false,
          },
        ],
      },
      Timestamp: {
        description:
          'A point in time in nanosecond precision.\n\nThis type can represent times from 1970-01-01T00:00:00Z to 2554-07-21T23:34:33Z.\n\n## Examples\n\n``` # use cosmwasm_std::Timestamp; let ts = Timestamp::from_nanos(1_000_000_202); assert_eq!(ts.nanos(), 1_000_000_202); assert_eq!(ts.seconds(), 1); assert_eq!(ts.subsec_nanos(), 202);\n\nlet ts = ts.plus_seconds(2); assert_eq!(ts.nanos(), 3_000_000_202); assert_eq!(ts.seconds(), 3); assert_eq!(ts.subsec_nanos(), 202); ```',
        allOf: [
          {
            $ref: '#/definitions/Uint64',
          },
        ],
      },
      Uint64: {
        description:
          'A thin wrapper around u64 that is using strings for JSON encoding/decoding, such that the full u64 range can be used for clients that convert JSON numbers to floats, like JavaScript and jq.\n\n# Examples\n\nUse `from` to create instances of this and `u64` to get the value out:\n\n``` # use cosmwasm_std::Uint64; let a = Uint64::from(42u64); assert_eq!(a.u64(), 42);\n\nlet b = Uint64::from(70u32); assert_eq!(b.u64(), 70); ```',
        type: 'string',
      },
    },
  },
  approvals: {
    type: 'object',
    required: ['approvals'],
    properties: {
      approvals: {
        type: 'array',
        items: {
          $ref: '#/definitions/Approval',
        },
      },
    },
    additionalProperties: false,
    definitions: {
      Addr: {
        description:
          "A human readable address.\n\nIn Cosmos, this is typically bech32 encoded. But for multi-chain smart contracts no assumptions should be made other than being UTF-8 encoded and of reasonable length.\n\nThis type represents a validated address. It can be created in the following ways 1. Use `Addr::unchecked(input)` 2. Use `let checked: Addr = deps.api.addr_validate(input)?` 3. Use `let checked: Addr = deps.api.addr_humanize(canonical_addr)?` 4. Deserialize from JSON. This must only be done from JSON that was validated before such as a contract's state. `Addr` must not be used in messages sent by the user because this would result in unvalidated instances.\n\nThis type is immutable. If you really need to mutate it (Really? Are you sure?), create a mutable copy using `let mut mutable = Addr::to_string()` and operate on that `String` instance.",
        type: 'string',
      },
      Approval: {
        type: 'object',
        required: ['expires', 'spender'],
        properties: {
          expires: {
            description: 'When the Approval expires (maybe Expiration::never)',
            allOf: [
              {
                $ref: '#/definitions/Expiration',
              },
            ],
          },
          spender: {
            description: 'Account that can transfer/send the token',
            allOf: [
              {
                $ref: '#/definitions/Addr',
              },
            ],
          },
        },
        additionalProperties: false,
      },
      Expiration: {
        description:
          'Expiration represents a point in time when some event happens. It can compare with a BlockInfo and will return is_expired() == true once the condition is hit (and for every block in the future)',
        oneOf: [
          {
            description:
              'AtHeight will expire when `env.block.height` >= height',
            type: 'object',
            required: ['at_height'],
            properties: {
              at_height: {
                type: 'integer',
                format: 'uint64',
                minimum: 0,
              },
            },
            additionalProperties: false,
          },
          {
            description: 'AtTime will expire when `env.block.time` >= time',
            type: 'object',
            required: ['at_time'],
            properties: {
              at_time: {
                $ref: '#/definitions/Timestamp',
              },
            },
            additionalProperties: false,
          },
          {
            description:
              'Never will never expire. Used to express the empty variant',
            type: 'object',
            required: ['never'],
            properties: {
              never: {
                type: 'object',
                additionalProperties: false,
              },
            },
            additionalProperties: false,
          },
        ],
      },
      Timestamp: {
        description:
          'A point in time in nanosecond precision.\n\nThis type can represent times from 1970-01-01T00:00:00Z to 2554-07-21T23:34:33Z.\n\n## Examples\n\n``` # use cosmwasm_std::Timestamp; let ts = Timestamp::from_nanos(1_000_000_202); assert_eq!(ts.nanos(), 1_000_000_202); assert_eq!(ts.seconds(), 1); assert_eq!(ts.subsec_nanos(), 202);\n\nlet ts = ts.plus_seconds(2); assert_eq!(ts.nanos(), 3_000_000_202); assert_eq!(ts.seconds(), 3); assert_eq!(ts.subsec_nanos(), 202); ```',
        allOf: [
          {
            $ref: '#/definitions/Uint64',
          },
        ],
      },
      Uint64: {
        description:
          'A thin wrapper around u64 that is using strings for JSON encoding/decoding, such that the full u64 range can be used for clients that convert JSON numbers to floats, like JavaScript and jq.\n\n# Examples\n\nUse `from` to create instances of this and `u64` to get the value out:\n\n``` # use cosmwasm_std::Uint64; let a = Uint64::from(42u64); assert_eq!(a.u64(), 42);\n\nlet b = Uint64::from(70u32); assert_eq!(b.u64(), 70); ```',
        type: 'string',
      },
    },
  },
  contract_info: {
    description:
      'This is a wrapper around CollectionInfo that includes the extension.',
    type: 'object',
    required: ['name', 'symbol', 'updated_at'],
    properties: {
      extension: {
        anyOf: [
          {
            $ref: '#/definitions/CollectionExtension_for_RoyaltyInfo',
          },
          {
            type: 'null',
          },
        ],
      },
      name: {
        type: 'string',
      },
      symbol: {
        type: 'string',
      },
      updated_at: {
        $ref: '#/definitions/Timestamp',
      },
    },
    additionalProperties: false,
    definitions: {
      Addr: {
        description:
          "A human readable address.\n\nIn Cosmos, this is typically bech32 encoded. But for multi-chain smart contracts no assumptions should be made other than being UTF-8 encoded and of reasonable length.\n\nThis type represents a validated address. It can be created in the following ways 1. Use `Addr::unchecked(input)` 2. Use `let checked: Addr = deps.api.addr_validate(input)?` 3. Use `let checked: Addr = deps.api.addr_humanize(canonical_addr)?` 4. Deserialize from JSON. This must only be done from JSON that was validated before such as a contract's state. `Addr` must not be used in messages sent by the user because this would result in unvalidated instances.\n\nThis type is immutable. If you really need to mutate it (Really? Are you sure?), create a mutable copy using `let mut mutable = Addr::to_string()` and operate on that `String` instance.",
        type: 'string',
      },
      CollectionExtension_for_RoyaltyInfo: {
        type: 'object',
        required: ['description', 'image'],
        properties: {
          banner_url: {
            type: ['string', 'null'],
          },
          description: {
            type: 'string',
          },
          explicit_content: {
            type: ['boolean', 'null'],
          },
          external_link: {
            type: ['string', 'null'],
          },
          image: {
            type: 'string',
          },
          royalty_info: {
            anyOf: [
              {
                $ref: '#/definitions/RoyaltyInfo',
              },
              {
                type: 'null',
              },
            ],
          },
          start_trading_time: {
            anyOf: [
              {
                $ref: '#/definitions/Timestamp',
              },
              {
                type: 'null',
              },
            ],
          },
        },
        additionalProperties: false,
      },
      Decimal: {
        description:
          'A fixed-point decimal value with 18 fractional digits, i.e. Decimal(1_000_000_000_000_000_000) == 1.0\n\nThe greatest possible value that can be represented is 340282366920938463463.374607431768211455 (which is (2^128 - 1) / 10^18)',
        type: 'string',
      },
      RoyaltyInfo: {
        type: 'object',
        required: ['payment_address', 'share'],
        properties: {
          payment_address: {
            $ref: '#/definitions/Addr',
          },
          share: {
            $ref: '#/definitions/Decimal',
          },
        },
        additionalProperties: false,
      },
      Timestamp: {
        description:
          'A point in time in nanosecond precision.\n\nThis type can represent times from 1970-01-01T00:00:00Z to 2554-07-21T23:34:33Z.\n\n## Examples\n\n``` # use cosmwasm_std::Timestamp; let ts = Timestamp::from_nanos(1_000_000_202); assert_eq!(ts.nanos(), 1_000_000_202); assert_eq!(ts.seconds(), 1); assert_eq!(ts.subsec_nanos(), 202);\n\nlet ts = ts.plus_seconds(2); assert_eq!(ts.nanos(), 3_000_000_202); assert_eq!(ts.seconds(), 3); assert_eq!(ts.subsec_nanos(), 202); ```',
        allOf: [
          {
            $ref: '#/definitions/Uint64',
          },
        ],
      },
      Uint64: {
        description:
          'A thin wrapper around u64 that is using strings for JSON encoding/decoding, such that the full u64 range can be used for clients that convert JSON numbers to floats, like JavaScript and jq.\n\n# Examples\n\nUse `from` to create instances of this and `u64` to get the value out:\n\n``` # use cosmwasm_std::Uint64; let a = Uint64::from(42u64); assert_eq!(a.u64(), 42);\n\nlet b = Uint64::from(70u32); assert_eq!(b.u64(), 70); ```',
        type: 'string',
      },
    },
  },
  extension: {
    type: 'null',
  },
  get_additional_minters: {
    type: 'object',
    required: ['minters'],
    properties: {
      minters: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
    },
    additionalProperties: false,
  },
  get_all_info: {
    description:
      'This is a wrapper around CollectionInfo that includes the extension, contract info, and number of tokens (supply).',
    type: 'object',
    required: [
      'collection_extension',
      'collection_info',
      'contract_info',
      'num_tokens',
    ],
    properties: {
      collection_extension: {
        type: 'array',
        items: {
          $ref: '#/definitions/Attribute',
        },
      },
      collection_info: {
        $ref: '#/definitions/CollectionInfo',
      },
      contract_info: {
        $ref: '#/definitions/ContractInfoResponse',
      },
      num_tokens: {
        type: 'integer',
        format: 'uint64',
        minimum: 0,
      },
    },
    additionalProperties: false,
    definitions: {
      Addr: {
        description:
          "A human readable address.\n\nIn Cosmos, this is typically bech32 encoded. But for multi-chain smart contracts no assumptions should be made other than being UTF-8 encoded and of reasonable length.\n\nThis type represents a validated address. It can be created in the following ways 1. Use `Addr::unchecked(input)` 2. Use `let checked: Addr = deps.api.addr_validate(input)?` 3. Use `let checked: Addr = deps.api.addr_humanize(canonical_addr)?` 4. Deserialize from JSON. This must only be done from JSON that was validated before such as a contract's state. `Addr` must not be used in messages sent by the user because this would result in unvalidated instances.\n\nThis type is immutable. If you really need to mutate it (Really? Are you sure?), create a mutable copy using `let mut mutable = Addr::to_string()` and operate on that `String` instance.",
        type: 'string',
      },
      Attribute: {
        type: 'object',
        required: ['key', 'value'],
        properties: {
          key: {
            type: 'string',
          },
          value: {
            $ref: '#/definitions/Binary',
          },
        },
        additionalProperties: false,
      },
      Binary: {
        description:
          'Binary is a wrapper around Vec<u8> to add base64 de/serialization with serde. It also adds some helper methods to help encode inline.\n\nThis is only needed as serde-json-{core,wasm} has a horrible encoding for Vec<u8>. See also <https://github.com/CosmWasm/cosmwasm/blob/main/docs/MESSAGE_TYPES.md>.',
        type: 'string',
      },
      CollectionInfo: {
        type: 'object',
        required: ['name', 'symbol', 'updated_at'],
        properties: {
          name: {
            type: 'string',
          },
          symbol: {
            type: 'string',
          },
          updated_at: {
            $ref: '#/definitions/Timestamp',
          },
        },
        additionalProperties: false,
      },
      ContractInfoResponse: {
        type: 'object',
        required: ['code_id', 'creator', 'pinned'],
        properties: {
          admin: {
            description: 'admin who can run migrations (if any)',
            anyOf: [
              {
                $ref: '#/definitions/Addr',
              },
              {
                type: 'null',
              },
            ],
          },
          code_id: {
            type: 'integer',
            format: 'uint64',
            minimum: 0,
          },
          creator: {
            description: 'address that instantiated this contract',
            allOf: [
              {
                $ref: '#/definitions/Addr',
              },
            ],
          },
          ibc_port: {
            description: 'set if this contract has bound an IBC port',
            type: ['string', 'null'],
          },
          pinned: {
            description:
              'if set, the contract is pinned to the cache, and thus uses less gas when called',
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
      Timestamp: {
        description:
          'A point in time in nanosecond precision.\n\nThis type can represent times from 1970-01-01T00:00:00Z to 2554-07-21T23:34:33Z.\n\n## Examples\n\n``` # use cosmwasm_std::Timestamp; let ts = Timestamp::from_nanos(1_000_000_202); assert_eq!(ts.nanos(), 1_000_000_202); assert_eq!(ts.seconds(), 1); assert_eq!(ts.subsec_nanos(), 202);\n\nlet ts = ts.plus_seconds(2); assert_eq!(ts.nanos(), 3_000_000_202); assert_eq!(ts.seconds(), 3); assert_eq!(ts.subsec_nanos(), 202); ```',
        allOf: [
          {
            $ref: '#/definitions/Uint64',
          },
        ],
      },
      Uint64: {
        description:
          'A thin wrapper around u64 that is using strings for JSON encoding/decoding, such that the full u64 range can be used for clients that convert JSON numbers to floats, like JavaScript and jq.\n\n# Examples\n\nUse `from` to create instances of this and `u64` to get the value out:\n\n``` # use cosmwasm_std::Uint64; let a = Uint64::from(42u64); assert_eq!(a.u64(), 42);\n\nlet b = Uint64::from(70u32); assert_eq!(b.u64(), 70); ```',
        type: 'string',
      },
    },
  },
  get_collection_extension: {
    type: 'null',
  },
  get_collection_extension_attributes: {
    type: 'array',
    items: {
      $ref: '#/definitions/Attribute',
    },
    definitions: {
      Attribute: {
        type: 'object',
        required: ['key', 'value'],
        properties: {
          key: {
            type: 'string',
          },
          value: {
            $ref: '#/definitions/Binary',
          },
        },
        additionalProperties: false,
      },
      Binary: {
        description:
          'Binary is a wrapper around Vec<u8> to add base64 de/serialization with serde. It also adds some helper methods to help encode inline.\n\nThis is only needed as serde-json-{core,wasm} has a horrible encoding for Vec<u8>. See also <https://github.com/CosmWasm/cosmwasm/blob/main/docs/MESSAGE_TYPES.md>.',
        type: 'string',
      },
    },
  },
  get_collection_info_and_extension: {
    description:
      'This is a wrapper around CollectionInfo that includes the extension.',
    type: 'object',
    required: ['name', 'symbol', 'updated_at'],
    properties: {
      extension: {
        anyOf: [
          {
            $ref: '#/definitions/CollectionExtension_for_RoyaltyInfo',
          },
          {
            type: 'null',
          },
        ],
      },
      name: {
        type: 'string',
      },
      symbol: {
        type: 'string',
      },
      updated_at: {
        $ref: '#/definitions/Timestamp',
      },
    },
    additionalProperties: false,
    definitions: {
      Addr: {
        description:
          "A human readable address.\n\nIn Cosmos, this is typically bech32 encoded. But for multi-chain smart contracts no assumptions should be made other than being UTF-8 encoded and of reasonable length.\n\nThis type represents a validated address. It can be created in the following ways 1. Use `Addr::unchecked(input)` 2. Use `let checked: Addr = deps.api.addr_validate(input)?` 3. Use `let checked: Addr = deps.api.addr_humanize(canonical_addr)?` 4. Deserialize from JSON. This must only be done from JSON that was validated before such as a contract's state. `Addr` must not be used in messages sent by the user because this would result in unvalidated instances.\n\nThis type is immutable. If you really need to mutate it (Really? Are you sure?), create a mutable copy using `let mut mutable = Addr::to_string()` and operate on that `String` instance.",
        type: 'string',
      },
      CollectionExtension_for_RoyaltyInfo: {
        type: 'object',
        required: ['description', 'image'],
        properties: {
          banner_url: {
            type: ['string', 'null'],
          },
          description: {
            type: 'string',
          },
          explicit_content: {
            type: ['boolean', 'null'],
          },
          external_link: {
            type: ['string', 'null'],
          },
          image: {
            type: 'string',
          },
          royalty_info: {
            anyOf: [
              {
                $ref: '#/definitions/RoyaltyInfo',
              },
              {
                type: 'null',
              },
            ],
          },
          start_trading_time: {
            anyOf: [
              {
                $ref: '#/definitions/Timestamp',
              },
              {
                type: 'null',
              },
            ],
          },
        },
        additionalProperties: false,
      },
      Decimal: {
        description:
          'A fixed-point decimal value with 18 fractional digits, i.e. Decimal(1_000_000_000_000_000_000) == 1.0\n\nThe greatest possible value that can be represented is 340282366920938463463.374607431768211455 (which is (2^128 - 1) / 10^18)',
        type: 'string',
      },
      RoyaltyInfo: {
        type: 'object',
        required: ['payment_address', 'share'],
        properties: {
          payment_address: {
            $ref: '#/definitions/Addr',
          },
          share: {
            $ref: '#/definitions/Decimal',
          },
        },
        additionalProperties: false,
      },
      Timestamp: {
        description:
          'A point in time in nanosecond precision.\n\nThis type can represent times from 1970-01-01T00:00:00Z to 2554-07-21T23:34:33Z.\n\n## Examples\n\n``` # use cosmwasm_std::Timestamp; let ts = Timestamp::from_nanos(1_000_000_202); assert_eq!(ts.nanos(), 1_000_000_202); assert_eq!(ts.seconds(), 1); assert_eq!(ts.subsec_nanos(), 202);\n\nlet ts = ts.plus_seconds(2); assert_eq!(ts.nanos(), 3_000_000_202); assert_eq!(ts.seconds(), 3); assert_eq!(ts.subsec_nanos(), 202); ```',
        allOf: [
          {
            $ref: '#/definitions/Uint64',
          },
        ],
      },
      Uint64: {
        description:
          'A thin wrapper around u64 that is using strings for JSON encoding/decoding, such that the full u64 range can be used for clients that convert JSON numbers to floats, like JavaScript and jq.\n\n# Examples\n\nUse `from` to create instances of this and `u64` to get the value out:\n\n``` # use cosmwasm_std::Uint64; let a = Uint64::from(42u64); assert_eq!(a.u64(), 42);\n\nlet b = Uint64::from(70u32); assert_eq!(b.u64(), 70); ```',
        type: 'string',
      },
    },
  },
  get_config: {
    description:
      'This is a wrapper around CollectionInfo that includes the extension.',
    type: 'object',
    required: [
      'collection_info',
      'contract_info',
      'creator_ownership',
      'minter_ownership',
      'num_tokens',
    ],
    properties: {
      collection_extension: {
        anyOf: [
          {
            $ref: '#/definitions/CollectionExtension_for_RoyaltyInfo',
          },
          {
            type: 'null',
          },
        ],
      },
      collection_info: {
        $ref: '#/definitions/CollectionInfo',
      },
      contract_info: {
        $ref: '#/definitions/ContractInfoResponse',
      },
      creator_ownership: {
        $ref: '#/definitions/Ownership_for_Addr',
      },
      minter_ownership: {
        $ref: '#/definitions/Ownership_for_Addr',
      },
      num_tokens: {
        type: 'integer',
        format: 'uint64',
        minimum: 0,
      },
      withdraw_address: {
        type: ['string', 'null'],
      },
    },
    additionalProperties: false,
    definitions: {
      Addr: {
        description:
          "A human readable address.\n\nIn Cosmos, this is typically bech32 encoded. But for multi-chain smart contracts no assumptions should be made other than being UTF-8 encoded and of reasonable length.\n\nThis type represents a validated address. It can be created in the following ways 1. Use `Addr::unchecked(input)` 2. Use `let checked: Addr = deps.api.addr_validate(input)?` 3. Use `let checked: Addr = deps.api.addr_humanize(canonical_addr)?` 4. Deserialize from JSON. This must only be done from JSON that was validated before such as a contract's state. `Addr` must not be used in messages sent by the user because this would result in unvalidated instances.\n\nThis type is immutable. If you really need to mutate it (Really? Are you sure?), create a mutable copy using `let mut mutable = Addr::to_string()` and operate on that `String` instance.",
        type: 'string',
      },
      CollectionExtension_for_RoyaltyInfo: {
        type: 'object',
        required: ['description', 'image'],
        properties: {
          banner_url: {
            type: ['string', 'null'],
          },
          description: {
            type: 'string',
          },
          explicit_content: {
            type: ['boolean', 'null'],
          },
          external_link: {
            type: ['string', 'null'],
          },
          image: {
            type: 'string',
          },
          royalty_info: {
            anyOf: [
              {
                $ref: '#/definitions/RoyaltyInfo',
              },
              {
                type: 'null',
              },
            ],
          },
          start_trading_time: {
            anyOf: [
              {
                $ref: '#/definitions/Timestamp',
              },
              {
                type: 'null',
              },
            ],
          },
        },
        additionalProperties: false,
      },
      CollectionInfo: {
        type: 'object',
        required: ['name', 'symbol', 'updated_at'],
        properties: {
          name: {
            type: 'string',
          },
          symbol: {
            type: 'string',
          },
          updated_at: {
            $ref: '#/definitions/Timestamp',
          },
        },
        additionalProperties: false,
      },
      ContractInfoResponse: {
        type: 'object',
        required: ['code_id', 'creator', 'pinned'],
        properties: {
          admin: {
            description: 'admin who can run migrations (if any)',
            anyOf: [
              {
                $ref: '#/definitions/Addr',
              },
              {
                type: 'null',
              },
            ],
          },
          code_id: {
            type: 'integer',
            format: 'uint64',
            minimum: 0,
          },
          creator: {
            description: 'address that instantiated this contract',
            allOf: [
              {
                $ref: '#/definitions/Addr',
              },
            ],
          },
          ibc_port: {
            description: 'set if this contract has bound an IBC port',
            type: ['string', 'null'],
          },
          pinned: {
            description:
              'if set, the contract is pinned to the cache, and thus uses less gas when called',
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
      Decimal: {
        description:
          'A fixed-point decimal value with 18 fractional digits, i.e. Decimal(1_000_000_000_000_000_000) == 1.0\n\nThe greatest possible value that can be represented is 340282366920938463463.374607431768211455 (which is (2^128 - 1) / 10^18)',
        type: 'string',
      },
      Expiration: {
        description:
          'Expiration represents a point in time when some event happens. It can compare with a BlockInfo and will return is_expired() == true once the condition is hit (and for every block in the future)',
        oneOf: [
          {
            description:
              'AtHeight will expire when `env.block.height` >= height',
            type: 'object',
            required: ['at_height'],
            properties: {
              at_height: {
                type: 'integer',
                format: 'uint64',
                minimum: 0,
              },
            },
            additionalProperties: false,
          },
          {
            description: 'AtTime will expire when `env.block.time` >= time',
            type: 'object',
            required: ['at_time'],
            properties: {
              at_time: {
                $ref: '#/definitions/Timestamp',
              },
            },
            additionalProperties: false,
          },
          {
            description:
              'Never will never expire. Used to express the empty variant',
            type: 'object',
            required: ['never'],
            properties: {
              never: {
                type: 'object',
                additionalProperties: false,
              },
            },
            additionalProperties: false,
          },
        ],
      },
      Ownership_for_Addr: {
        description: "The contract's ownership info",
        type: 'object',
        properties: {
          owner: {
            description:
              "The contract's current owner. `None` if the ownership has been renounced.",
            anyOf: [
              {
                $ref: '#/definitions/Addr',
              },
              {
                type: 'null',
              },
            ],
          },
          pending_expiry: {
            description:
              "The deadline for the pending owner to accept the ownership. `None` if there isn't a pending ownership transfer, or if a transfer exists and it doesn't have a deadline.",
            anyOf: [
              {
                $ref: '#/definitions/Expiration',
              },
              {
                type: 'null',
              },
            ],
          },
          pending_owner: {
            description:
              "The account who has been proposed to take over the ownership. `None` if there isn't a pending ownership transfer.",
            anyOf: [
              {
                $ref: '#/definitions/Addr',
              },
              {
                type: 'null',
              },
            ],
          },
        },
        additionalProperties: false,
      },
      RoyaltyInfo: {
        type: 'object',
        required: ['payment_address', 'share'],
        properties: {
          payment_address: {
            $ref: '#/definitions/Addr',
          },
          share: {
            $ref: '#/definitions/Decimal',
          },
        },
        additionalProperties: false,
      },
      Timestamp: {
        description:
          'A point in time in nanosecond precision.\n\nThis type can represent times from 1970-01-01T00:00:00Z to 2554-07-21T23:34:33Z.\n\n## Examples\n\n``` # use cosmwasm_std::Timestamp; let ts = Timestamp::from_nanos(1_000_000_202); assert_eq!(ts.nanos(), 1_000_000_202); assert_eq!(ts.seconds(), 1); assert_eq!(ts.subsec_nanos(), 202);\n\nlet ts = ts.plus_seconds(2); assert_eq!(ts.nanos(), 3_000_000_202); assert_eq!(ts.seconds(), 3); assert_eq!(ts.subsec_nanos(), 202); ```',
        allOf: [
          {
            $ref: '#/definitions/Uint64',
          },
        ],
      },
      Uint64: {
        description:
          'A thin wrapper around u64 that is using strings for JSON encoding/decoding, such that the full u64 range can be used for clients that convert JSON numbers to floats, like JavaScript and jq.\n\n# Examples\n\nUse `from` to create instances of this and `u64` to get the value out:\n\n``` # use cosmwasm_std::Uint64; let a = Uint64::from(42u64); assert_eq!(a.u64(), 42);\n\nlet b = Uint64::from(70u32); assert_eq!(b.u64(), 70); ```',
        type: 'string',
      },
    },
  },
  get_creator_ownership: {
    description: "The contract's ownership info",
    type: 'object',
    properties: {
      owner: {
        description:
          "The contract's current owner. `None` if the ownership has been renounced.",
        anyOf: [
          {
            $ref: '#/definitions/Addr',
          },
          {
            type: 'null',
          },
        ],
      },
      pending_expiry: {
        description:
          "The deadline for the pending owner to accept the ownership. `None` if there isn't a pending ownership transfer, or if a transfer exists and it doesn't have a deadline.",
        anyOf: [
          {
            $ref: '#/definitions/Expiration',
          },
          {
            type: 'null',
          },
        ],
      },
      pending_owner: {
        description:
          "The account who has been proposed to take over the ownership. `None` if there isn't a pending ownership transfer.",
        anyOf: [
          {
            $ref: '#/definitions/Addr',
          },
          {
            type: 'null',
          },
        ],
      },
    },
    additionalProperties: false,
    definitions: {
      Addr: {
        description:
          "A human readable address.\n\nIn Cosmos, this is typically bech32 encoded. But for multi-chain smart contracts no assumptions should be made other than being UTF-8 encoded and of reasonable length.\n\nThis type represents a validated address. It can be created in the following ways 1. Use `Addr::unchecked(input)` 2. Use `let checked: Addr = deps.api.addr_validate(input)?` 3. Use `let checked: Addr = deps.api.addr_humanize(canonical_addr)?` 4. Deserialize from JSON. This must only be done from JSON that was validated before such as a contract's state. `Addr` must not be used in messages sent by the user because this would result in unvalidated instances.\n\nThis type is immutable. If you really need to mutate it (Really? Are you sure?), create a mutable copy using `let mut mutable = Addr::to_string()` and operate on that `String` instance.",
        type: 'string',
      },
      Expiration: {
        description:
          'Expiration represents a point in time when some event happens. It can compare with a BlockInfo and will return is_expired() == true once the condition is hit (and for every block in the future)',
        oneOf: [
          {
            description:
              'AtHeight will expire when `env.block.height` >= height',
            type: 'object',
            required: ['at_height'],
            properties: {
              at_height: {
                type: 'integer',
                format: 'uint64',
                minimum: 0,
              },
            },
            additionalProperties: false,
          },
          {
            description: 'AtTime will expire when `env.block.time` >= time',
            type: 'object',
            required: ['at_time'],
            properties: {
              at_time: {
                $ref: '#/definitions/Timestamp',
              },
            },
            additionalProperties: false,
          },
          {
            description:
              'Never will never expire. Used to express the empty variant',
            type: 'object',
            required: ['never'],
            properties: {
              never: {
                type: 'object',
                additionalProperties: false,
              },
            },
            additionalProperties: false,
          },
        ],
      },
      Timestamp: {
        description:
          'A point in time in nanosecond precision.\n\nThis type can represent times from 1970-01-01T00:00:00Z to 2554-07-21T23:34:33Z.\n\n## Examples\n\n``` # use cosmwasm_std::Timestamp; let ts = Timestamp::from_nanos(1_000_000_202); assert_eq!(ts.nanos(), 1_000_000_202); assert_eq!(ts.seconds(), 1); assert_eq!(ts.subsec_nanos(), 202);\n\nlet ts = ts.plus_seconds(2); assert_eq!(ts.nanos(), 3_000_000_202); assert_eq!(ts.seconds(), 3); assert_eq!(ts.subsec_nanos(), 202); ```',
        allOf: [
          {
            $ref: '#/definitions/Uint64',
          },
        ],
      },
      Uint64: {
        description:
          'A thin wrapper around u64 that is using strings for JSON encoding/decoding, such that the full u64 range can be used for clients that convert JSON numbers to floats, like JavaScript and jq.\n\n# Examples\n\nUse `from` to create instances of this and `u64` to get the value out:\n\n``` # use cosmwasm_std::Uint64; let a = Uint64::from(42u64); assert_eq!(a.u64(), 42);\n\nlet b = Uint64::from(70u32); assert_eq!(b.u64(), 70); ```',
        type: 'string',
      },
    },
  },
  get_minter_ownership: {
    description: "The contract's ownership info",
    type: 'object',
    properties: {
      owner: {
        description:
          "The contract's current owner. `None` if the ownership has been renounced.",
        anyOf: [
          {
            $ref: '#/definitions/Addr',
          },
          {
            type: 'null',
          },
        ],
      },
      pending_expiry: {
        description:
          "The deadline for the pending owner to accept the ownership. `None` if there isn't a pending ownership transfer, or if a transfer exists and it doesn't have a deadline.",
        anyOf: [
          {
            $ref: '#/definitions/Expiration',
          },
          {
            type: 'null',
          },
        ],
      },
      pending_owner: {
        description:
          "The account who has been proposed to take over the ownership. `None` if there isn't a pending ownership transfer.",
        anyOf: [
          {
            $ref: '#/definitions/Addr',
          },
          {
            type: 'null',
          },
        ],
      },
    },
    additionalProperties: false,
    definitions: {
      Addr: {
        description:
          "A human readable address.\n\nIn Cosmos, this is typically bech32 encoded. But for multi-chain smart contracts no assumptions should be made other than being UTF-8 encoded and of reasonable length.\n\nThis type represents a validated address. It can be created in the following ways 1. Use `Addr::unchecked(input)` 2. Use `let checked: Addr = deps.api.addr_validate(input)?` 3. Use `let checked: Addr = deps.api.addr_humanize(canonical_addr)?` 4. Deserialize from JSON. This must only be done from JSON that was validated before such as a contract's state. `Addr` must not be used in messages sent by the user because this would result in unvalidated instances.\n\nThis type is immutable. If you really need to mutate it (Really? Are you sure?), create a mutable copy using `let mut mutable = Addr::to_string()` and operate on that `String` instance.",
        type: 'string',
      },
      Expiration: {
        description:
          'Expiration represents a point in time when some event happens. It can compare with a BlockInfo and will return is_expired() == true once the condition is hit (and for every block in the future)',
        oneOf: [
          {
            description:
              'AtHeight will expire when `env.block.height` >= height',
            type: 'object',
            required: ['at_height'],
            properties: {
              at_height: {
                type: 'integer',
                format: 'uint64',
                minimum: 0,
              },
            },
            additionalProperties: false,
          },
          {
            description: 'AtTime will expire when `env.block.time` >= time',
            type: 'object',
            required: ['at_time'],
            properties: {
              at_time: {
                $ref: '#/definitions/Timestamp',
              },
            },
            additionalProperties: false,
          },
          {
            description:
              'Never will never expire. Used to express the empty variant',
            type: 'object',
            required: ['never'],
            properties: {
              never: {
                type: 'object',
                additionalProperties: false,
              },
            },
            additionalProperties: false,
          },
        ],
      },
      Timestamp: {
        description:
          'A point in time in nanosecond precision.\n\nThis type can represent times from 1970-01-01T00:00:00Z to 2554-07-21T23:34:33Z.\n\n## Examples\n\n``` # use cosmwasm_std::Timestamp; let ts = Timestamp::from_nanos(1_000_000_202); assert_eq!(ts.nanos(), 1_000_000_202); assert_eq!(ts.seconds(), 1); assert_eq!(ts.subsec_nanos(), 202);\n\nlet ts = ts.plus_seconds(2); assert_eq!(ts.nanos(), 3_000_000_202); assert_eq!(ts.seconds(), 3); assert_eq!(ts.subsec_nanos(), 202); ```',
        allOf: [
          {
            $ref: '#/definitions/Uint64',
          },
        ],
      },
      Uint64: {
        description:
          'A thin wrapper around u64 that is using strings for JSON encoding/decoding, such that the full u64 range can be used for clients that convert JSON numbers to floats, like JavaScript and jq.\n\n# Examples\n\nUse `from` to create instances of this and `u64` to get the value out:\n\n``` # use cosmwasm_std::Uint64; let a = Uint64::from(42u64); assert_eq!(a.u64(), 42);\n\nlet b = Uint64::from(70u32); assert_eq!(b.u64(), 70); ```',
        type: 'string',
      },
    },
  },
  get_nft_by_extension: {
    anyOf: [
      {
        $ref: '#/definitions/NftInfoResponse_for_Nullable_Empty',
      },
      {
        type: 'null',
      },
    ],
    definitions: {
      Empty: {
        description:
          "An empty struct that serves as a placeholder in different places, such as contracts that don't set a custom message.\n\nIt is designed to be expressible in correct JSON and JSON Schema but contains no meaningful data. Previously we used enums without cases, but those cannot represented as valid JSON Schema (https://github.com/CosmWasm/cosmwasm/issues/451)",
        type: 'object',
        additionalProperties: false,
      },
      NftInfoResponse_for_Nullable_Empty: {
        type: 'object',
        properties: {
          extension: {
            description:
              'You can add any custom metadata here when you extend cw721-base',
            anyOf: [
              {
                $ref: '#/definitions/Empty',
              },
              {
                type: 'null',
              },
            ],
          },
          token_uri: {
            description:
              'Universal resource identifier for this NFT Should point to a JSON file that conforms to the ERC721 Metadata JSON Schema',
            type: ['string', 'null'],
          },
        },
        additionalProperties: false,
      },
    },
  },
  get_withdraw_address: {
    type: ['string', 'null'],
  },
  minter: {
    description:
      'Deprecated: use Cw721QueryMsg::GetMinterOwnership instead! Shows who can mint these tokens.',
    type: 'object',
    properties: {
      minter: {
        type: ['string', 'null'],
      },
    },
    additionalProperties: false,
  },
  nft_info: {
    type: 'object',
    properties: {
      extension: {
        description:
          'You can add any custom metadata here when you extend cw721-base',
        anyOf: [
          {
            $ref: '#/definitions/Empty',
          },
          {
            type: 'null',
          },
        ],
      },
      token_uri: {
        description:
          'Universal resource identifier for this NFT Should point to a JSON file that conforms to the ERC721 Metadata JSON Schema',
        type: ['string', 'null'],
      },
    },
    additionalProperties: false,
    definitions: {
      Empty: {
        description:
          "An empty struct that serves as a placeholder in different places, such as contracts that don't set a custom message.\n\nIt is designed to be expressible in correct JSON and JSON Schema but contains no meaningful data. Previously we used enums without cases, but those cannot represented as valid JSON Schema (https://github.com/CosmWasm/cosmwasm/issues/451)",
        type: 'object',
        additionalProperties: false,
      },
    },
  },
  num_tokens: {
    type: 'object',
    required: ['count'],
    properties: {
      count: {
        type: 'integer',
        format: 'uint64',
        minimum: 0,
      },
    },
    additionalProperties: false,
  },
  operator: {
    type: 'object',
    required: ['approval'],
    properties: {
      approval: {
        $ref: '#/definitions/Approval',
      },
    },
    additionalProperties: false,
    definitions: {
      Addr: {
        description:
          "A human readable address.\n\nIn Cosmos, this is typically bech32 encoded. But for multi-chain smart contracts no assumptions should be made other than being UTF-8 encoded and of reasonable length.\n\nThis type represents a validated address. It can be created in the following ways 1. Use `Addr::unchecked(input)` 2. Use `let checked: Addr = deps.api.addr_validate(input)?` 3. Use `let checked: Addr = deps.api.addr_humanize(canonical_addr)?` 4. Deserialize from JSON. This must only be done from JSON that was validated before such as a contract's state. `Addr` must not be used in messages sent by the user because this would result in unvalidated instances.\n\nThis type is immutable. If you really need to mutate it (Really? Are you sure?), create a mutable copy using `let mut mutable = Addr::to_string()` and operate on that `String` instance.",
        type: 'string',
      },
      Approval: {
        type: 'object',
        required: ['expires', 'spender'],
        properties: {
          expires: {
            description: 'When the Approval expires (maybe Expiration::never)',
            allOf: [
              {
                $ref: '#/definitions/Expiration',
              },
            ],
          },
          spender: {
            description: 'Account that can transfer/send the token',
            allOf: [
              {
                $ref: '#/definitions/Addr',
              },
            ],
          },
        },
        additionalProperties: false,
      },
      Expiration: {
        description:
          'Expiration represents a point in time when some event happens. It can compare with a BlockInfo and will return is_expired() == true once the condition is hit (and for every block in the future)',
        oneOf: [
          {
            description:
              'AtHeight will expire when `env.block.height` >= height',
            type: 'object',
            required: ['at_height'],
            properties: {
              at_height: {
                type: 'integer',
                format: 'uint64',
                minimum: 0,
              },
            },
            additionalProperties: false,
          },
          {
            description: 'AtTime will expire when `env.block.time` >= time',
            type: 'object',
            required: ['at_time'],
            properties: {
              at_time: {
                $ref: '#/definitions/Timestamp',
              },
            },
            additionalProperties: false,
          },
          {
            description:
              'Never will never expire. Used to express the empty variant',
            type: 'object',
            required: ['never'],
            properties: {
              never: {
                type: 'object',
                additionalProperties: false,
              },
            },
            additionalProperties: false,
          },
        ],
      },
      Timestamp: {
        description:
          'A point in time in nanosecond precision.\n\nThis type can represent times from 1970-01-01T00:00:00Z to 2554-07-21T23:34:33Z.\n\n## Examples\n\n``` # use cosmwasm_std::Timestamp; let ts = Timestamp::from_nanos(1_000_000_202); assert_eq!(ts.nanos(), 1_000_000_202); assert_eq!(ts.seconds(), 1); assert_eq!(ts.subsec_nanos(), 202);\n\nlet ts = ts.plus_seconds(2); assert_eq!(ts.nanos(), 3_000_000_202); assert_eq!(ts.seconds(), 3); assert_eq!(ts.subsec_nanos(), 202); ```',
        allOf: [
          {
            $ref: '#/definitions/Uint64',
          },
        ],
      },
      Uint64: {
        description:
          'A thin wrapper around u64 that is using strings for JSON encoding/decoding, such that the full u64 range can be used for clients that convert JSON numbers to floats, like JavaScript and jq.\n\n# Examples\n\nUse `from` to create instances of this and `u64` to get the value out:\n\n``` # use cosmwasm_std::Uint64; let a = Uint64::from(42u64); assert_eq!(a.u64(), 42);\n\nlet b = Uint64::from(70u32); assert_eq!(b.u64(), 70); ```',
        type: 'string',
      },
    },
  },
  owner_of: {
    type: 'object',
    required: ['approvals', 'owner'],
    properties: {
      approvals: {
        description:
          'If set this address is approved to transfer/send the token as well',
        type: 'array',
        items: {
          $ref: '#/definitions/Approval',
        },
      },
      owner: {
        description: 'Owner of the token',
        type: 'string',
      },
    },
    additionalProperties: false,
    definitions: {
      Addr: {
        description:
          "A human readable address.\n\nIn Cosmos, this is typically bech32 encoded. But for multi-chain smart contracts no assumptions should be made other than being UTF-8 encoded and of reasonable length.\n\nThis type represents a validated address. It can be created in the following ways 1. Use `Addr::unchecked(input)` 2. Use `let checked: Addr = deps.api.addr_validate(input)?` 3. Use `let checked: Addr = deps.api.addr_humanize(canonical_addr)?` 4. Deserialize from JSON. This must only be done from JSON that was validated before such as a contract's state. `Addr` must not be used in messages sent by the user because this would result in unvalidated instances.\n\nThis type is immutable. If you really need to mutate it (Really? Are you sure?), create a mutable copy using `let mut mutable = Addr::to_string()` and operate on that `String` instance.",
        type: 'string',
      },
      Approval: {
        type: 'object',
        required: ['expires', 'spender'],
        properties: {
          expires: {
            description: 'When the Approval expires (maybe Expiration::never)',
            allOf: [
              {
                $ref: '#/definitions/Expiration',
              },
            ],
          },
          spender: {
            description: 'Account that can transfer/send the token',
            allOf: [
              {
                $ref: '#/definitions/Addr',
              },
            ],
          },
        },
        additionalProperties: false,
      },
      Expiration: {
        description:
          'Expiration represents a point in time when some event happens. It can compare with a BlockInfo and will return is_expired() == true once the condition is hit (and for every block in the future)',
        oneOf: [
          {
            description:
              'AtHeight will expire when `env.block.height` >= height',
            type: 'object',
            required: ['at_height'],
            properties: {
              at_height: {
                type: 'integer',
                format: 'uint64',
                minimum: 0,
              },
            },
            additionalProperties: false,
          },
          {
            description: 'AtTime will expire when `env.block.time` >= time',
            type: 'object',
            required: ['at_time'],
            properties: {
              at_time: {
                $ref: '#/definitions/Timestamp',
              },
            },
            additionalProperties: false,
          },
          {
            description:
              'Never will never expire. Used to express the empty variant',
            type: 'object',
            required: ['never'],
            properties: {
              never: {
                type: 'object',
                additionalProperties: false,
              },
            },
            additionalProperties: false,
          },
        ],
      },
      Timestamp: {
        description:
          'A point in time in nanosecond precision.\n\nThis type can represent times from 1970-01-01T00:00:00Z to 2554-07-21T23:34:33Z.\n\n## Examples\n\n``` # use cosmwasm_std::Timestamp; let ts = Timestamp::from_nanos(1_000_000_202); assert_eq!(ts.nanos(), 1_000_000_202); assert_eq!(ts.seconds(), 1); assert_eq!(ts.subsec_nanos(), 202);\n\nlet ts = ts.plus_seconds(2); assert_eq!(ts.nanos(), 3_000_000_202); assert_eq!(ts.seconds(), 3); assert_eq!(ts.subsec_nanos(), 202); ```',
        allOf: [
          {
            $ref: '#/definitions/Uint64',
          },
        ],
      },
      Uint64: {
        description:
          'A thin wrapper around u64 that is using strings for JSON encoding/decoding, such that the full u64 range can be used for clients that convert JSON numbers to floats, like JavaScript and jq.\n\n# Examples\n\nUse `from` to create instances of this and `u64` to get the value out:\n\n``` # use cosmwasm_std::Uint64; let a = Uint64::from(42u64); assert_eq!(a.u64(), 42);\n\nlet b = Uint64::from(70u32); assert_eq!(b.u64(), 70); ```',
        type: 'string',
      },
    },
  },
  ownership: {
    description: "The contract's ownership info",
    type: 'object',
    properties: {
      owner: {
        description:
          "The contract's current owner. `None` if the ownership has been renounced.",
        anyOf: [
          {
            $ref: '#/definitions/Addr',
          },
          {
            type: 'null',
          },
        ],
      },
      pending_expiry: {
        description:
          "The deadline for the pending owner to accept the ownership. `None` if there isn't a pending ownership transfer, or if a transfer exists and it doesn't have a deadline.",
        anyOf: [
          {
            $ref: '#/definitions/Expiration',
          },
          {
            type: 'null',
          },
        ],
      },
      pending_owner: {
        description:
          "The account who has been proposed to take over the ownership. `None` if there isn't a pending ownership transfer.",
        anyOf: [
          {
            $ref: '#/definitions/Addr',
          },
          {
            type: 'null',
          },
        ],
      },
    },
    additionalProperties: false,
    definitions: {
      Addr: {
        description:
          "A human readable address.\n\nIn Cosmos, this is typically bech32 encoded. But for multi-chain smart contracts no assumptions should be made other than being UTF-8 encoded and of reasonable length.\n\nThis type represents a validated address. It can be created in the following ways 1. Use `Addr::unchecked(input)` 2. Use `let checked: Addr = deps.api.addr_validate(input)?` 3. Use `let checked: Addr = deps.api.addr_humanize(canonical_addr)?` 4. Deserialize from JSON. This must only be done from JSON that was validated before such as a contract's state. `Addr` must not be used in messages sent by the user because this would result in unvalidated instances.\n\nThis type is immutable. If you really need to mutate it (Really? Are you sure?), create a mutable copy using `let mut mutable = Addr::to_string()` and operate on that `String` instance.",
        type: 'string',
      },
      Expiration: {
        description:
          'Expiration represents a point in time when some event happens. It can compare with a BlockInfo and will return is_expired() == true once the condition is hit (and for every block in the future)',
        oneOf: [
          {
            description:
              'AtHeight will expire when `env.block.height` >= height',
            type: 'object',
            required: ['at_height'],
            properties: {
              at_height: {
                type: 'integer',
                format: 'uint64',
                minimum: 0,
              },
            },
            additionalProperties: false,
          },
          {
            description: 'AtTime will expire when `env.block.time` >= time',
            type: 'object',
            required: ['at_time'],
            properties: {
              at_time: {
                $ref: '#/definitions/Timestamp',
              },
            },
            additionalProperties: false,
          },
          {
            description:
              'Never will never expire. Used to express the empty variant',
            type: 'object',
            required: ['never'],
            properties: {
              never: {
                type: 'object',
                additionalProperties: false,
              },
            },
            additionalProperties: false,
          },
        ],
      },
      Timestamp: {
        description:
          'A point in time in nanosecond precision.\n\nThis type can represent times from 1970-01-01T00:00:00Z to 2554-07-21T23:34:33Z.\n\n## Examples\n\n``` # use cosmwasm_std::Timestamp; let ts = Timestamp::from_nanos(1_000_000_202); assert_eq!(ts.nanos(), 1_000_000_202); assert_eq!(ts.seconds(), 1); assert_eq!(ts.subsec_nanos(), 202);\n\nlet ts = ts.plus_seconds(2); assert_eq!(ts.nanos(), 3_000_000_202); assert_eq!(ts.seconds(), 3); assert_eq!(ts.subsec_nanos(), 202); ```',
        allOf: [
          {
            $ref: '#/definitions/Uint64',
          },
        ],
      },
      Uint64: {
        description:
          'A thin wrapper around u64 that is using strings for JSON encoding/decoding, such that the full u64 range can be used for clients that convert JSON numbers to floats, like JavaScript and jq.\n\n# Examples\n\nUse `from` to create instances of this and `u64` to get the value out:\n\n``` # use cosmwasm_std::Uint64; let a = Uint64::from(42u64); assert_eq!(a.u64(), 42);\n\nlet b = Uint64::from(70u32); assert_eq!(b.u64(), 70); ```',
        type: 'string',
      },
    },
  },
  tokens: {
    type: 'object',
    required: ['tokens'],
    properties: {
      tokens: {
        description:
          'Contains all token_ids in lexicographical ordering If there are more than `limit`, use `start_after` in future queries to achieve pagination.',
        type: 'array',
        items: {
          type: 'string',
        },
      },
    },
    additionalProperties: false,
  },
} as const
