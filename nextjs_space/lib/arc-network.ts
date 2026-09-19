/**
 * Arc Network Configuration — Single Source of Truth
 *
 * Switch between mainnet and testnet with ONE env var:
 *   ARC_NETWORK=testnet   (default, safe)
 *   ARC_NETWORK=mainnet   (real money — flip only after funding)
 *
 * Client components read NEXT_PUBLIC_ARC_NETWORK instead.
 * Both must always agree; set them together in .env.
 */

const networkEnv =
  (typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_ARC_NETWORK
    : process.env.ARC_NETWORK) ?? 'testnet';

/** True when running against Arc Mainnet (real funds). */
export const IS_MAINNET = networkEnv === 'mainnet';

/** Human-readable label for the current network. */
export const NETWORK_LABEL = IS_MAINNET ? 'Arc Mainnet' : 'Arc Testnet';

/** Short badge form of the network label ("Mainnet" / "Testnet"). */
export const NETWORK_SHORT_LABEL = IS_MAINNET ? 'Mainnet' : 'Testnet';

/**
 * Mainnet cutover (server-side). The database has no per-row network column,
 * so on-chain records (escrow tx hashes, milestone releases) written before
 * this instant belong to the testnet deployment and must not be reported — or
 * linked to the mainnet explorer — as mainnet activity. Null on testnet, where
 * the full history applies. Override with ARC_MAINNET_SINCE (ISO date).
 */
export const NETWORK_SINCE: Date | null = IS_MAINNET
  ? new Date(process.env.ARC_MAINNET_SINCE ?? '2026-09-20T00:00:00Z')
  : null;

// ---------------------------------------------------------------------------
// Circle
// ---------------------------------------------------------------------------

/** Circle blockchain identifier used in wallet / faucet / transfer calls. */
export const CIRCLE_BLOCKCHAIN: string = IS_MAINNET ? 'ARC' : 'ARC-TESTNET';

// ---------------------------------------------------------------------------
// Chain parameters
// ---------------------------------------------------------------------------

export const ARC_CHAIN_ID = IS_MAINNET ? 5042 : 5042002;
export const ARC_RPC_URL = IS_MAINNET
  ? 'https://rpc.mainnet.arc.io'
  : 'https://rpc.testnet.arc.network';
export const ARC_EXPLORER_URL = IS_MAINNET
  ? 'https://explorer.arc.io'
  : 'https://testnet.arcscan.app';

/**
 * Native currency on Arc — USDC on both networks.
 * Previous code incorrectly defined this as "ARC" / "Arc Token".
 */
export const ARC_NATIVE_CURRENCY = {
  NAME: 'USDC',
  SYMBOL: 'USDC',
  DECIMALS: 18,
} as const;

// ---------------------------------------------------------------------------
// Explorer URL helpers
// ---------------------------------------------------------------------------

export function explorerTxUrl(txHash: string): string {
  return `${ARC_EXPLORER_URL}/tx/${txHash}`;
}

export function explorerAddressUrl(address: string): string {
  return `${ARC_EXPLORER_URL}/address/${address}`;
}
