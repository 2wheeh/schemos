import { defineConfig } from 'vocs'

export default defineConfig({
  rootDir: '.',
  title: 'schemos',
  description: 'Type-safe CosmWasm contract interactions, zero codegen',
  sidebar: [
    { text: 'Getting Started', link: '/' },
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
