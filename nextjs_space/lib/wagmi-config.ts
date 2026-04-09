// Wagmi Configuration - Arc Testnet
// Web3 wallet connection setup for Arc Network
// Configuration updated from Arc Node: https://github.com/circlefin/arc-node

import { http, createConfig, createStorage } from 'wagmi';
import { defineChain } from 'viem';
import { injected } from 'wagmi/connectors';
import { ARC_TESTNET_ADDRESSES, ARC_CHAIN_PARAMS } from './contracts/arc-testnet-addresses';

// Arc Testnet Chain Definition (updated from Arc Network specification)
export const arcTestnet = defineChain({
  id: ARC_CHAIN_PARAMS.CHAIN_ID,
  name: ARC_CHAIN_PARAMS.CHAIN_NAME,
  nativeCurrency: {
    name: ARC_CHAIN_PARAMS.NATIVE_CURRENCY.NAME,
    symbol: ARC_CHAIN_PARAMS.NATIVE_CURRENCY.SYMBOL,
    decimals: ARC_CHAIN_PARAMS.NATIVE_CURRENCY.DECIMALS,
  },
  rpcUrls: {
    default: {
      http: [ARC_CHAIN_PARAMS.RPC_URL],
    },
    public: {
      http: [ARC_CHAIN_PARAMS.RPC_URL],
    },
  },
  blockExplorers: {
    default: {
      name: 'ArcScan',
      url: ARC_CHAIN_PARAMS.EXPLORER_URL,
    },
  },
  testnet: true,
});

// USDC Contract Address on Arc Testnet (from Arc Network config)
export const USDC_CONTRACT_ADDRESS = ARC_TESTNET_ADDRESSES.TOKEN.ADDRESS as `0x${string}`;

// Additional Arc Protocol contract addresses
export const ARC_PROTOCOL_ADDRESSES = ARC_TESTNET_ADDRESSES;
export const ARC_PROTOCOL_PARAMS = ARC_CHAIN_PARAMS;

// Wagmi Config
export const wagmiConfig = createConfig({
  chains: [arcTestnet],
  connectors: [
    injected(),
  ],
  transports: {
    [arcTestnet.id]: http('https://rpc.testnet.arc.network'),
  },
  ssr: true,
  storage: createStorage({
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  }),
});

// Export chain for use in components
export const supportedChains = [arcTestnet] as const;
