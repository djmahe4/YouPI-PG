import { Database } from './packages/db/src/database.js';
import { runMigrations } from './packages/db/src/migrate.js';
import { PaymentSessionRepository, ReceivingAccountRepository, MerchantRepository } from './packages/db/src/repositories/index.js';

const db = new Database({ inMemory: true });
const { runMigrations } = await import('./packages/db/src/migrate.js');
runMigrations(db);

const sessionRepo = (await import('./packages/db/src/repositories/payment-session.repository.js')).PaymentSessionRepository;
const accountRepo = (await import('./packages/db/src/repositories/receiving-account.repository.js')).ReceivingAccountRepository;
const merchantRepo = (await import('./packages/db/src/repositories/merchant.repository.js')).MerchantRepository;

const db2 = new (await import('./packages/db/src/database.js')).Database({ inMemory: true });
const { runMigrations: rm2 } = await import('./packages/db/src/migrate.js');
rm2(db2);

const sessionRepo2 = new sessionRepo(db2);
const accountRepo2 = new accountRepo(db2);
const merchantRepo2 = new merchantRepo(db2);

const merchantA = merchantRepo2.create({
  businessName: 'Merchant A',
  slug: 'merchant-a',
  contactEmail: 'a@test.com',
  contactPhone: '9999999999',
  webhookUrl: 'http://localhost:3000/webhook',
  webhookSecret: 'secret_a'
});

const accountA = accountRepo2.create({
  merchantId: merchantA.id,
  upiId: 'merchantA@upi',
  payeeName: 'Merchant A',
  isMerchantEnabled: true,
  isActive: true
});

const session = sessionRepo2.create({
  merchantId: merchantA.id,
  receivingAccountId: accountA.id,
  amountPaise: 25000,
  orderId: 'ORD_E2E_9D_01',
  status: 'ACTIVE',
  expiresAt: new Date(Date.now() + 600000)
});

console.log('Session created:', session.id, session.status, session.amountPaise);

const { AttributionEngine } = await import('./packages/core/src/attribution-engine.js');
const attributionEngine = new AttributionEngine({ db: db2, sessionRepo: sessionRepo2, accountRepo: accountRepo2, merchantRepo: merchantRepo2 });

const attrResult = attributionEngine.processObservation({
  source: 'SMS',
  receivingAccountId: accountA.id,
  amountPaise: 25000,
  bankReferenceNumber: '998877665544',
  senderVpa: 'buyer@okhdfcbank',
  fingerprintHash: 'hash_test_998877665544',
  rawPayload: { text: 'Rs 250 credited' },
  observedAt: new Date()
});

console.log('attrResult:', JSON.stringify(attrResult, null, 2));
