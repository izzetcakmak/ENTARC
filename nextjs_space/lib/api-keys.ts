// API Keys Configuration - Server-side only
// CRITICAL: This file should NEVER be imported on the client side
// Keys are read from environment variables for production safety

// Convenience functions for API keys
export function getCoinMarketCapKey(): string | null {
  const key = process.env.COINMARKETCAP_API_KEY;
  if (!key) {
    console.warn('COINMARKETCAP_API_KEY not configured');
    return null;
  }
  return key;
}

export function getDuneAnalyticsKey(): string | null {
  const key = process.env.DUNE_ANALYTICS_API_KEY;
  if (!key) {
    console.warn('DUNE_ANALYTICS_API_KEY not configured');
    return null;
  }
  return key;
}

// Generic function for other API keys
export function getApiKey(service: string): string | null {
  const envKey = `${service.toUpperCase().replace(/\s+/g, '_')}_API_KEY`;
  const key = process.env[envKey];
  if (!key) {
    console.warn(`API key not found for service: ${service} (env: ${envKey})`);
    return null;
  }
  return key;
}
