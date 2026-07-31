/**
 * Circle Agent Stack Client
 * Provides developer-controlled wallet functionality for ENTARC
 * Source: https://agents.circle.com
 */

import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';

let circleClient: ReturnType<typeof initiateDeveloperControlledWalletsClient> | null = null;

export function getCircleClient() {
  if (!circleClient) {
    const apiKey = process.env.CIRCLE_API_KEY;
    const entitySecret = process.env.CIRCLE_ENTITY_SECRET;

    if (!apiKey || !entitySecret) {
      throw new Error('Circle API credentials not configured');
    }

    circleClient = initiateDeveloperControlledWalletsClient({
      apiKey,
      entitySecret,
    });
  }
  return circleClient;
}

export type CircleWallet = {
  id: string;
  address: string;
  blockchain: string;
  state: string;
  walletSetId: string;
  createDate: string;
  updateDate: string;
};

export type CircleWalletSet = {
  id: string;
  name: string;
  createDate: string;
  updateDate: string;
};

// ---------------------------------------------------------------------------
// Real USDC movement for the autonomous agent (Arc Testnet).
// USDC is Arc's native gas token, so transfers reference Circle's token id
// from the wallet's balance listing rather than an ERC-20 address.
// ---------------------------------------------------------------------------

export const AGENT_BLOCKCHAIN = 'ARC-TESTNET';
export const AGENT_WALLET_SET_NAME = 'ENTARC Agent';
const EXPLORER_TX_BASE = 'https://testnet.arcscan.app/tx/';

export function explorerTxUrl(txHash: string): string {
  return `${EXPLORER_TX_BASE}${txHash}`;
}

/**
 * Find (or provision on first run) the agent's wallet on Arc Testnet.
 * One wallet set named ENTARC Agent, one wallet inside it — idempotent.
 */
export async function getOrCreateAgentWallet(): Promise<CircleWallet> {
  const client = getCircleClient();

  const sets = await client.listWalletSets({});
  const allSets = (sets.data?.walletSets ?? []) as any[];
  let set = allSets.find((s) => s?.name === AGENT_WALLET_SET_NAME);
  if (!set) {
    const created = await client.createWalletSet({ name: AGENT_WALLET_SET_NAME });
    set = created.data?.walletSet;
    if (!set?.id) throw new Error('Failed to create agent wallet set');
  }

  const wallets = await client.listWallets({ walletSetId: set.id });
  const list = (wallets.data?.wallets ?? []) as any[];
  const existing = list.find((w) => w?.blockchain === AGENT_BLOCKCHAIN);
  if (existing) return existing as CircleWallet;

  const created = await client.createWallets({
    walletSetId: set.id,
    blockchains: [AGENT_BLOCKCHAIN] as any,
    count: 1,
    accountType: 'EOA' as any,
  });
  const wallet = (created.data?.wallets ?? [])[0] as CircleWallet | undefined;
  if (!wallet) throw new Error('Failed to create agent wallet');
  return wallet;
}

export type AgentUsdcBalance = {
  /** Human-unit USDC amount, e.g. "19.99". */
  amount: string;
  /** Circle token id used to reference USDC in createTransaction. */
  tokenId: string;
};

/** USDC balance + Circle token id for a wallet. Null when the wallet holds no USDC yet. */
export async function getUsdcBalance(walletId: string): Promise<AgentUsdcBalance | null> {
  const client = getCircleClient();
  const res = await client.getWalletTokenBalance({ id: walletId, includeAll: true } as any);
  const balances = (res.data?.tokenBalances ?? []) as any[];
  const usdc = balances.find(
    (b) => (b?.token?.symbol ?? '').toUpperCase().includes('USDC') || b?.token?.isNative
  );
  if (!usdc?.token?.id) return null;
  return { amount: usdc.amount ?? '0', tokenId: usdc.token.id };
}

export type AgentTransferResult = {
  /** Circle transaction id (UUID). */
  circleTxId: string;
  /** Final Circle state, e.g. COMPLETE / CONFIRMED / FAILED. */
  state: string;
  /** On-chain transaction hash, present once the tx is broadcast. */
  txHash?: string;
  /** Block-explorer URL for the hash, when available. */
  explorerUrl?: string;
};

const TX_POLL_INTERVAL_MS = 2_000;
const TX_POLL_TIMEOUT_MS = 90_000;
const TX_TERMINAL_STATES = new Set(['COMPLETE', 'CONFIRMED', 'FAILED', 'DENIED', 'CANCELLED']);

/**
 * Transfer USDC from an agent wallet and wait for the on-chain hash.
 * This is the ONLY place agent money moves — callers must have passed
 * checkAgentPolicy() before invoking it.
 */
export async function transferUsdc(input: {
  walletId: string;
  tokenId: string;
  destinationAddress: string;
  amountUsdc: number | string;
  /** Caller-supplied idempotency key so retries can never double-spend. */
  idempotencyKey: string;
}): Promise<AgentTransferResult> {
  const client = getCircleClient();
  const amount = String(input.amountUsdc);

  const created = await client.createTransaction({
    walletId: input.walletId,
    tokenId: input.tokenId,
    destinationAddress: input.destinationAddress,
    amount: [amount],
    // REST names this field `amounts`; the SDK has used both across versions.
    amounts: [amount],
    idempotencyKey: input.idempotencyKey,
    fee: { type: 'level', config: { feeLevel: 'MEDIUM' } },
  } as any);

  const circleTxId: string | undefined = (created.data as any)?.id;
  if (!circleTxId) {
    throw new Error(`Circle createTransaction returned no id: ${JSON.stringify(created.data)}`);
  }

  // Poll until the transaction reaches a terminal state or the hash appears.
  const deadline = Date.now() + TX_POLL_TIMEOUT_MS;
  let state = (created.data as any)?.state ?? 'INITIATED';
  let txHash: string | undefined;
  while (Date.now() < deadline) {
    const res = await client.getTransaction({ id: circleTxId } as any);
    const tx = (res.data as any)?.transaction ?? res.data;
    state = tx?.state ?? state;
    txHash = tx?.txHash ?? txHash;
    if (txHash && TX_TERMINAL_STATES.has(state)) break;
    if (state === 'FAILED' || state === 'DENIED' || state === 'CANCELLED') break;
    await new Promise((r) => setTimeout(r, TX_POLL_INTERVAL_MS));
  }

  if (state === 'FAILED' || state === 'DENIED' || state === 'CANCELLED') {
    throw new Error(`Circle transaction ${circleTxId} ended in state ${state}`);
  }

  return {
    circleTxId,
    state,
    txHash,
    explorerUrl: txHash ? explorerTxUrl(txHash) : undefined,
  };
}
