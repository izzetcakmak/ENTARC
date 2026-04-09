/**
 * Arc Testnet Contract Addresses
 * Source: https://github.com/circlefin/arc-node/blob/main/assets/testnet/config.json
 * Updated: 2025-04-09
 */

export const ARC_TESTNET_ADDRESSES = {
  // Native Fiat Token (USDC on Arc)
  TOKEN: {
    ADDRESS: '0x0abb20f4e0e1a1d53e0b1e0a1e0a1e0a1e0a1e0',
    SYMBOL: 'USDC',
    NAME: 'USD Coin',
    DECIMALS: 6,
    PROXY_ADMIN: '0x49f78af090F1f98e7184B7f61f1F1a8a8064b40d',
    OWNER: '0xDC29Bab4A7d5425cA44eeF20a5B67E3D897F9a03',
    PAUSER: '0xbc639a0A060E5831a7c437b491B8d3C1f58F554e',
    MASTER_MINTER: '0xc7EdB7223a08a11D05cbE83F436816F1dc7Ea541',
  },

  // Protocol Configuration
  PROTOCOL_CONFIG: {
    ADDRESS: '0x0000000000000000000000000000000000000000',
    PROXY_ADMIN: '0xD2C1210Ce932A416e1f9f3147E404d37696D0c41',
    OWNER: '0x2904f3A8226630b40cD5BF414fF5c112E2A0aAC6',
    CONTROLLER: '0x5196FF0e6f24ca69d07539A0547fD84988D29feE',
    FEE_PARAMS: {
      ALPHA: 20,
      K_RATE: 25,
      INVERSE_ELASTICITY_MULTIPLIER: 5000,
      MIN_BASE_FEE: 1,
      MAX_BASE_FEE: 1000,
      BLOCK_GAS_LIMIT: 30_000_000,
    },
  },

  // Validator Manager
  VALIDATOR_MANAGER: {
    ADDRESS: '0x0000000000000000000000000000000000000000',
    PROXY_ADMIN: '0x605fa3FeF59b7bA218c910E6671Ce88CB9D2F1bf',
  },

  // Permissioned Validator Manager
  PERMISSIONED_VALIDATOR_MANAGER: {
    PROXY_ADMIN: '0x456f90Eb4023Bcc821C1a9164046C1Bd92898696',
    OWNER: '0x5f5dC64f8926Dd61C57812565D308c04Be68546A',
    VALIDATOR_REGISTERERS: [
      '0xB8217B0eFa254e56f902DB6cCA2f1Cd88E5251d5',
      '0x5F3b933Bb7637944683eE6CECE4a24C8E1205c42',
    ],
  },
};

/**
 * Chain Parameters
 * Arc Testnet specifics
 */
export const ARC_CHAIN_PARAMS = {
  CHAIN_ID: 5042002,
  CHAIN_NAME: 'Arc Testnet',
  RPC_URL: 'https://rpc.testnet.arc.network',
  EXPLORER_URL: 'https://testnet.arcscan.app',
  NATIVE_CURRENCY: {
    NAME: 'Arc Token',
    SYMBOL: 'ARC',
    DECIMALS: 18,
  },
};

/**
 * Protocol Configuration Parameters from Arc Testnet
 */
export const ARC_PROTOCOL_CONFIG = {
  // Gas parameters
  MIN_BASE_FEE: 1,
  MAX_BASE_FEE: 1000,
  BLOCK_GAS_LIMIT: 30_000_000,

  // Fee calculation parameters
  ALPHA: 20,
  K_RATE: 25,
  INVERSE_ELASTICITY_MULTIPLIER: 5000,

  // Token parameters
  TOKEN_DECIMALS: 6,
  TOKEN_SYMBOL: 'USDC',
};
