import { defineConfig } from 'vocs'

export default defineConfig({
  rootDir: '.',
  title: 'schemos',
  description: 'Type-safe CosmWasm contract interactions, zero codegen',
  sidebar: [
    { text: 'Getting Started', link: '/' },
    { text: 'Wallet Integration', link: '/wallet-integration' },
  ],
})
