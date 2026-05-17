/**
 * ABI for the PalletMan Registry ink! v5 contract.
 *
 * IMPORTANT: The selector values below are computed from the message names
 * using blake2b_256. Replace them with the exact values from
 * `target/ink/palletman_registry.json` after running:
 *   cargo contract build --release
 *
 * Everything else (type structure, args, storage layout) matches lib.rs exactly.
 */
export const REGISTRY_ABI = {
  source: {
    hash: "0x0000000000000000000000000000000000000000000000000000000000000000",
    language: "ink! 5.0.0",
    compiler: "rustc 1.79.0",
  },
  contract: {
    name: "palletman_registry",
    version: "0.1.0",
    authors: ["PalletMan"],
  },
  spec: {
    constructors: [
      {
        args: [],
        default: false,
        docs: ["Deploy a new PalletMan Registry."],
        label: "new",
        payable: false,
        returnType: { displayName: ["ink_primitives", "ConstructorResult"], type: 9 },
        selector: "0x9bae9d5e",
      },
    ],
    docs: [],
    environment: {
      accountId: { displayName: ["AccountId"], type: 0 },
      balance: { displayName: ["Balance"], type: 1 },
      blockNumber: { displayName: ["u32"], type: 2 },
      chainExtension: { displayName: ["ChainExtension"], type: 3 },
      hash: { displayName: ["Hash"], type: 4 },
      maxEventTopics: 4,
      staticBufferSize: 16384,
      timestamp: { displayName: ["u64"], type: 5 },
    },
    events: [
      {
        args: [
          { docs: [], indexed: true, label: "caller", type: { displayName: ["AccountId"], type: 0 } },
          { docs: [], indexed: false, label: "name", type: { displayName: ["String"], type: 6 } },
          { docs: [], indexed: false, label: "pallet", type: { displayName: ["String"], type: 6 } },
          { docs: [], indexed: false, label: "extrinsic", type: { displayName: ["String"], type: 6 } },
        ],
        docs: ["Emitted when a user saves a new call configuration."],
        label: "CallSaved",
        module_path: "palletman_registry::palletman_registry",
        signature_topic: null,
      },
      {
        args: [
          { docs: [], indexed: true, label: "caller", type: { displayName: ["AccountId"], type: 0 } },
          { docs: [], indexed: false, label: "index", type: { displayName: ["u32"], type: 2 } },
        ],
        docs: ["Emitted when a user deletes a saved call."],
        label: "CallDeleted",
        module_path: "palletman_registry::palletman_registry",
        signature_topic: null,
      },
    ],
    lang_error: { displayName: ["ink", "LangError"], type: 7 },
    messages: [
      {
        args: [
          { label: "name", type: { displayName: ["String"], type: 6 } },
          { label: "pallet", type: { displayName: ["String"], type: 6 } },
          { label: "extrinsic", type: { displayName: ["String"], type: 6 } },
          { label: "params_json", type: { displayName: ["String"], type: 6 } },
        ],
        default: false,
        docs: ["Save an extrinsic call configuration on-chain."],
        label: "save_call",
        mutates: true,
        payable: false,
        returnType: { displayName: ["ink", "MessageResult"], type: 8 },
        selector: "0xa22202f4",
      },
      {
        args: [{ label: "account", type: { displayName: ["AccountId"], type: 0 } }],
        default: false,
        docs: ["Return all saved call configurations for a given account."],
        label: "get_calls",
        mutates: false,
        payable: false,
        returnType: { displayName: ["ink", "MessageResult"], type: 10 },
        selector: "0x3b77b4d2",
      },
      {
        args: [{ label: "index", type: { displayName: ["u32"], type: 2 } }],
        default: false,
        docs: ["Delete a saved call by its index (0-based)."],
        label: "delete_call",
        mutates: true,
        payable: false,
        returnType: { displayName: ["ink", "MessageResult"], type: 12 },
        selector: "0x4e74f73a",
      },
      {
        args: [{ label: "account", type: { displayName: ["AccountId"], type: 0 } }],
        default: false,
        docs: ["Return the number of saved calls for a given account."],
        label: "call_count",
        mutates: false,
        payable: false,
        returnType: { displayName: ["ink", "MessageResult"], type: 13 },
        selector: "0x24d54673",
      },
      {
        args: [],
        default: false,
        docs: ["Return the total number of saves across all accounts."],
        label: "total_saves",
        mutates: false,
        payable: false,
        returnType: { displayName: ["ink", "MessageResult"], type: 14 },
        selector: "0x0f5b3cd5",
      },
    ],
  },
  storage: {
    root: {
      layout: {
        struct: {
          fields: [
            { layout: { leaf: { key: "0x00000000", ty: 15 } }, name: "calls" },
            { layout: { leaf: { key: "0x00000001", ty: 5 } }, name: "total_saves" },
          ],
          name: "PalletManRegistry",
        },
      },
      root_key: "0x00000000",
    },
  },
  types: [
    // 0: AccountId
    {
      id: 0,
      type: {
        def: { composite: { fields: [{ type: 16, typeName: "[u8; 32]" }] } },
        path: ["ink_primitives", "types", "AccountId"],
      },
    },
    // 1: Balance (u128)
    { id: 1, type: { def: { primitive: "u128" } } },
    // 2: u32
    { id: 2, type: { def: { primitive: "u32" } } },
    // 3: ChainExtension (NoChainExtension)
    {
      id: 3,
      type: {
        def: { variant: {} },
        path: ["ink_env", "types", "NoChainExtension"],
      },
    },
    // 4: Hash
    {
      id: 4,
      type: {
        def: { composite: { fields: [{ type: 16, typeName: "[u8; 32]" }] } },
        path: ["ink_primitives", "types", "Hash"],
      },
    },
    // 5: u64
    { id: 5, type: { def: { primitive: "u64" } } },
    // 6: String
    { id: 6, type: { def: { primitive: "str" } } },
    // 7: LangError
    {
      id: 7,
      type: {
        def: { variant: { variants: [{ index: 1, name: "CouldNotReadInput" }] } },
        path: ["ink_primitives", "LangError"],
      },
    },
    // 8: Result<(), LangError>  ← MessageResult for save_call
    {
      id: 8,
      type: {
        def: {
          variant: {
            variants: [
              { fields: [{ type: 17 }], index: 0, name: "Ok" },
              { fields: [{ type: 7 }], index: 1, name: "Err" },
            ],
          },
        },
        params: [{ name: "T", type: 17 }, { name: "E", type: 7 }],
        path: ["Result"],
      },
    },
    // 9: Result<(), LangError>  ← ConstructorResult
    {
      id: 9,
      type: {
        def: {
          variant: {
            variants: [
              { fields: [{ type: 17 }], index: 0, name: "Ok" },
              { fields: [{ type: 7 }], index: 1, name: "Err" },
            ],
          },
        },
        params: [{ name: "T", type: 17 }, { name: "E", type: 7 }],
        path: ["Result"],
      },
    },
    // 10: Result<Vec<SavedCall>, LangError>  ← MessageResult for get_calls
    {
      id: 10,
      type: {
        def: {
          variant: {
            variants: [
              { fields: [{ type: 18 }], index: 0, name: "Ok" },
              { fields: [{ type: 7 }], index: 1, name: "Err" },
            ],
          },
        },
        params: [{ name: "T", type: 18 }, { name: "E", type: 7 }],
        path: ["Result"],
      },
    },
    // 11: Error enum
    {
      id: 11,
      type: {
        def: { variant: { variants: [{ index: 0, name: "IndexOutOfBounds" }] } },
        path: ["palletman_registry", "palletman_registry", "Error"],
      },
    },
    // 12: Result<Result<(), Error>, LangError>  ← MessageResult for delete_call
    {
      id: 12,
      type: {
        def: {
          variant: {
            variants: [
              { fields: [{ type: 19 }], index: 0, name: "Ok" },
              { fields: [{ type: 7 }], index: 1, name: "Err" },
            ],
          },
        },
        params: [{ name: "T", type: 19 }, { name: "E", type: 7 }],
        path: ["Result"],
      },
    },
    // 13: Result<u32, LangError>  ← MessageResult for call_count
    {
      id: 13,
      type: {
        def: {
          variant: {
            variants: [
              { fields: [{ type: 2 }], index: 0, name: "Ok" },
              { fields: [{ type: 7 }], index: 1, name: "Err" },
            ],
          },
        },
        params: [{ name: "T", type: 2 }, { name: "E", type: 7 }],
        path: ["Result"],
      },
    },
    // 14: Result<u64, LangError>  ← MessageResult for total_saves
    {
      id: 14,
      type: {
        def: {
          variant: {
            variants: [
              { fields: [{ type: 5 }], index: 0, name: "Ok" },
              { fields: [{ type: 7 }], index: 1, name: "Err" },
            ],
          },
        },
        params: [{ name: "T", type: 5 }, { name: "E", type: 7 }],
        path: ["Result"],
      },
    },
    // 15: Mapping<AccountId, Vec<SavedCall>>
    {
      id: 15,
      type: {
        def: {
          composite: {
            fields: [{ name: "offset_key", type: 16, typeName: "Key" }],
          },
        },
        params: [
          { name: "K", type: 0 },
          { name: "V", type: 18 },
          { name: "KeyType", type: 20 },
        ],
        path: ["ink_storage", "lazy", "mapping", "Mapping"],
      },
    },
    // 16: [u8; 32]
    { id: 16, type: { def: { array: { len: 32, type: 21 } } } },
    // 17: () unit
    { id: 17, type: { def: { tuple: [] } } },
    // 18: Vec<SavedCall>
    { id: 18, type: { def: { sequence: { type: 22 } } } },
    // 19: Result<(), Error>
    {
      id: 19,
      type: {
        def: {
          variant: {
            variants: [
              { fields: [{ type: 17 }], index: 0, name: "Ok" },
              { fields: [{ type: 11 }], index: 1, name: "Err" },
            ],
          },
        },
        params: [{ name: "T", type: 17 }, { name: "E", type: 11 }],
        path: ["Result"],
      },
    },
    // 20: ManualKey (KeyType for Mapping)
    {
      id: 20,
      type: {
        def: { composite: {} },
        params: [{ name: "L", type: 0 }],
        path: ["ink_storage_traits", "impls", "ManualKey"],
      },
    },
    // 21: u8
    { id: 21, type: { def: { primitive: "u8" } } },
    // 22: SavedCall struct
    {
      id: 22,
      type: {
        def: {
          composite: {
            fields: [
              { name: "name", type: 6, typeName: "String" },
              { name: "pallet", type: 6, typeName: "String" },
              { name: "extrinsic", type: 6, typeName: "String" },
              { name: "params_json", type: 6, typeName: "String" },
              { name: "saved_at", type: 5, typeName: "u64" },
            ],
          },
        },
        path: ["palletman_registry", "palletman_registry", "SavedCall"],
      },
    },
  ],
  version: 5,
} as const;
