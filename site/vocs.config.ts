import { defineConfig } from 'vocs'

export default defineConfig({
  rootDir: '.',
  title: 'schemos',
  description: 'Type-safe CosmWasm contract interactions, zero codegen',
  sidebar: [
    { text: 'Getting Started', link: '/' },
    { text: 'Overview', link: '/overview' },
    {
      text: 'API Reference',
      items: [
        { text: 'createTypedContract', link: '/api/create-typed-contract' },
        { text: 'Msg', link: '/api/msg' },
        { text: 'Encoding', link: '/api/encoding' },
        { text: 'Telescope Adapters', link: '/api/telescope' },
        { text: 'Schemas', link: '/api/schemas' },
      ],
    },
    {
      text: 'Guides',
      items: [{ text: 'Custom Contracts', link: '/guides/custom-contracts' }],
    },
    {
      text: 'Integrations',
      items: [
        { text: 'cosmjs', link: '/integrations/cosmjs' },
        { text: 'Telescope SDKs', link: '/integrations/telescope' },
        { text: 'Wallet Kits', link: '/integrations/wallet-kits' },
      ],
    },
  ],
  twoslash: {
    compilerOptions: {
      strict: true,
    },
  },
})
