/**
 * Arc Network Smart Contract ABIs and Addresses
 * Centralized export for all contract interactions
 * Updated from Arc Node: https://github.com/circlefin/arc-node
 */

// Contract addresses and chain parameters
export {
  ARC_TESTNET_ADDRESSES,
  ARC_CHAIN_PARAMS,
  ARC_PROTOCOL_CONFIG,
} from './arc-testnet-addresses';

// Contract ABIs
export { USDC_ABI } from './usdc-abi';
export { PROTOCOL_CONFIG_ABI } from './protocol-config-abi';
export { VALIDATOR_MANAGER_ABI } from './validator-manager-abi';

// Re-export Wagmi config with updated Arc Protocol addresses
export {
  arcTestnet,
  wagmiConfig,
  USDC_CONTRACT_ADDRESS,
  ARC_PROTOCOL_ADDRESSES,
  ARC_PROTOCOL_PARAMS,
} from '../wagmi-config';

/**
 * Contract Interaction Guide
 *
 * Usage:
 * import { USDC_ABI, ARC_TESTNET_ADDRESSES } from '@/lib/contracts';
 * import { useReadContract } from 'wagmi';
 *
 * const { data: balance } = useReadContract({
 *   abi: USDC_ABI,
 *   address: ARC_TESTNET_ADDRESSES.TOKEN.ADDRESS,
 *   functionName: 'balanceOf',
 *   args: [userAddress],
 * });
 */
