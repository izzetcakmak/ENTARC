import { registerEntitySecretCiphertext } from '@circle-fin/developer-controlled-wallets';
import fs from 'fs';

const apiKey = process.env.CIRCLE_API_KEY;
const entitySecret = process.env.CIRCLE_ENTITY_SECRET;
try {
  const res = await registerEntitySecretCiphertext({
    apiKey,
    entitySecret,
    recoveryFileDownloadPath: process.env.RECOVERY_DIR || '.',
  });
  console.log('REGISTERED ✅', JSON.stringify(res?.data ?? res).slice(0, 120));
} catch (e) {
  console.log('REGISTER FAILED:', e?.response?.status, JSON.stringify(e?.response?.data ?? e.message).slice(0, 300));
}
