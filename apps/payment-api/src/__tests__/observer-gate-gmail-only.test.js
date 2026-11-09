import { describe, test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { upiObserversAcceptingPayments, gmailOnlyAllowed } from '../routes/checkout.routes.js';

const gmailOnlyHealth = { smsHealthy: false, gmailHealthy: true, gmailPollerActive: true };

describe('new-session observer gate: YOUPI_ALLOW_GMAIL_ONLY', () => {
  afterEach(() => { delete process.env.YOUPI_ALLOW_GMAIL_ONLY; });

  test('default: an SMS observer is required, Gmail alone is refused', () => {
    assert.equal(gmailOnlyAllowed(), false);
    assert.equal(upiObserversAcceptingPayments(gmailOnlyHealth), false);
    assert.equal(upiObserversAcceptingPayments({ smsHealthy: true }), true);
    assert.equal(upiObserversAcceptingPayments({ smsHealthy: false, gmailHealthy: false }), false);
  });

  test('opt-in: a live Gmail poller opens the gate', () => {
    process.env.YOUPI_ALLOW_GMAIL_ONLY = 'true';
    assert.equal(gmailOnlyAllowed(), true);
    assert.equal(upiObserversAcceptingPayments(gmailOnlyHealth), true);
  });

  test('opt-in still refuses a Gmail observer whose poller is not running', () => {
    process.env.YOUPI_ALLOW_GMAIL_ONLY = 'true';
    // refresh token stored (gmailHealthy) but poller down / STANDBY
    assert.equal(upiObserversAcceptingPayments({ smsHealthy: false, gmailHealthy: true, gmailPollerActive: false }), false);
    assert.equal(upiObserversAcceptingPayments({ smsHealthy: false, gmailHealthy: true }), false);
    assert.equal(upiObserversAcceptingPayments({ smsHealthy: false, gmailHealthy: false, gmailPollerActive: true }), false);
  });

  test('only the exact string "true" enables it', () => {
    for (const v of ['1', 'yes', 'TRUE', 'on', '']) {
      process.env.YOUPI_ALLOW_GMAIL_ONLY = v;
      assert.equal(upiObserversAcceptingPayments(gmailOnlyHealth), false, `value ${JSON.stringify(v)}`);
    }
  });

  test('the dev "false narrative" override never opens the gate', () => {
    process.env.YOUPI_ALLOW_GMAIL_ONLY = 'true';
    assert.equal(upiObserversAcceptingPayments({ ...gmailOnlyHealth, isFalseNarrative: true }), false);
    assert.equal(upiObserversAcceptingPayments({ smsHealthy: true, isFalseNarrative: true }), false);
  });
});
