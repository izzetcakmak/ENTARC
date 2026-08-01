import { generateEntitySecretCiphertext } from '@circle-fin/developer-controlled-wallets';
import fs from 'fs';

const secret = fs.readFileSync(process.env.HOME + '/circle-entity-secret/new-secret-pending.txt', 'utf8').trim();
const ct = await generateEntitySecretCiphertext({
  apiKey: process.env.CIRCLE_API_KEY,
  entitySecret: secret,
});
fs.writeFileSync(process.env.HOME + '/circle-entity-secret/new-secret-ciphertext.txt', ct);
console.log('ciphertext uretildi -> ~/circle-entity-secret/new-secret-ciphertext.txt (uzunluk:', ct.length, ')');
