import crypto from 'crypto';

/**
 * SHA256 commitment for server seed (published before round resolves).
 */
export function sha256Hex(input) {
  return crypto.createHash('sha256').update(String(input)).digest('hex');
}

export function generateServerSeed() {
  return crypto.randomBytes(32).toString('hex');
}

export function generateNonce() {
  return crypto.randomBytes(16).toString('hex');
}

function hmacHex(key, message) {
  return crypto.createHmac('sha256', key).update(message).digest('hex');
}

/**
 * Deterministic game digest from server seed + client seed + nonce (HMAC-SHA256).
 */
export function gameDigest(serverSeed, clientSeed, nonce) {
  return hmacHex(serverSeed, `${clientSeed}:${nonce}`);
}

/**
 * Map digest to uniform color: red | green | violet
 */
export function colorFromDigest(digestHex) {
  const n = BigInt(`0x${digestHex.slice(0, 8)}`) % 3n;
  return ['red', 'green', 'violet'][Number(n)];
}

/**
 * Crash multiplier from digest (provably-fair style crash curve).
 * @param {string} digestHex
 * @param {number} houseEdge 0–1 e.g. 0.01
 */
export function crashMultiplierFromDigest(digestHex, houseEdge = 0.01) {
  const h = parseInt(digestHex.slice(0, 13), 16);
  const e = Math.pow(2, 52);
  if (Number.isNaN(h) || h <= 0) return 1;

  let result = (100 * e - h) / (e - h);
  result = Math.floor(result) / 100;
  result = Math.max(1, result * (1 - houseEdge));
  return Math.round(result * 100) / 100;
}
