import http from 'http';
import bcrypt from 'bcryptjs';
import { env } from './config/env.js';
import { connectDb } from './config/db.js';
import { createApp } from './app.js';
import { User } from './models/User.js';
import { tickColorRounds } from './services/colorPrediction.service.js';
import { tickAviatorRound } from './services/aviator.scheduler.js';
import { attachAviatorSockets, broadcastAviatorState } from './sockets/aviator.socket.js';
import { generateReferralCode } from './utils/referralCode.js';

async function ensureAdminUser() {
  const exists = await User.exists({ email: env.adminEmail.toLowerCase() });
  if (exists) return;

  const passwordHash = await bcrypt.hash(env.adminPassword, env.bcryptSaltRounds);
  let referralCode = 'ADMIN';
  for (let i = 0; i < 5; i += 1) {
    if (!(await User.exists({ referralCode }))) break;
    referralCode = generateReferralCode();
  }

  await User.create({
    email: env.adminEmail.toLowerCase(),
    username: 'administrator',
    passwordHash,
    role: 'admin',
    walletBalance: 0,
    referralCode,
  });
}

async function main() {
  await connectDb();
  await ensureAdminUser();

  const app = createApp();
  const server = http.createServer(app);

  const { aviatorNs } = attachAviatorSockets(server);

  tickColorRounds().catch((e) => console.error('color tick', e));
  tickAviatorRound()
    .then(() => broadcastAviatorState(aviatorNs))
    .catch((e) => console.error('aviator tick', e));

  setInterval(() => {
    tickColorRounds().catch((e) => console.error('color tick', e));
  }, 1000);

  setInterval(() => {
    tickAviatorRound()
      .then(() => broadcastAviatorState(aviatorNs))
      .catch((e) => console.error('aviator tick', e));
  }, env.aviatorTickMs);

  server.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on :${env.port}`);
  });
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
