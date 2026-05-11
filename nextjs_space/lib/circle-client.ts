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
