import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isAdminEmail,
  validateSubmission,
  validateReply,
  validToken,
  readBody,
} from '../lib/validation.ts';
const valid = {
  kind: 'issue',
  token: 'a'.repeat(64),
  title: 'A recording issue',
  body: 'Recording becomes jerky when I move around.',
  modVersion: '0.1.5',
  minecraft: '1.21.11',
};
void test('only explicitly configured owner is an admin', () => {
  assert.equal(isAdminEmail('OWNER@EXAMPLE.COM', 'owner@example.com'), true);
  assert.equal(
    isAdminEmail('stranger@example.com', 'owner@example.com'),
    false,
  );
  assert.equal(isAdminEmail('owner@example.com', undefined), false);
  assert.equal(isAdminEmail(null, 'owner@example.com'), false);
});
void test('valid issues are trimmed and questions do not require device versions', () => {
  assert.equal(
    validateSubmission({ ...valid, title: '  hello issue  ' }).title,
    'hello issue',
  );
  assert.equal(
    validateSubmission({
      ...valid,
      kind: 'question',
      modVersion: '',
      minecraft: '',
    }).kind,
    'question',
  );
});
void test('malformed submissions and oversized fields fail intentionally', () => {
  for (const data of [
    null,
    [],
    { ...valid, kind: 'admin' },
    { ...valid, token: 'guess' },
    { ...valid, title: 'x' },
    { ...valid, body: 'x'.repeat(6001) },
    { ...valid, modVersion: '' },
    { ...valid, website: 'spam' },
  ])
    assert.throws(() => validateSubmission(data));
});
void test('tracking accepts only full random access keys', () => {
  assert.equal(validToken('f'.repeat(64)).length, 64);
  assert.throws(() => validToken('XY-1234'));
  assert.throws(() => validToken('a'.repeat(65)));
});
void test('reply status and concurrent-update timestamp are validated', () => {
  assert.equal(
    validateReply({
      status: 'answered',
      reply: 'Here is the answer.',
      updatedAt: 1,
    }).status,
    'answered',
  );
  assert.throws(() =>
    validateReply({ status: 'admin', reply: 'hello', updatedAt: 1 }),
  );
  assert.throws(() =>
    validateReply({ status: 'answered', reply: '', updatedAt: 1 }),
  );
  assert.throws(() =>
    validateReply({ status: 'open', reply: '', updatedAt: '1' }),
  );
});
void test('writes reject cross-origin requests and oversized bodies', async () => {
  await assert.rejects(
    readBody(
      new Request('https://support.test/api', {
        method: 'POST',
        headers: {
          origin: 'https://attacker.test',
          'content-type': 'application/json',
        },
        body: '{}',
      }),
    ),
  );
  await assert.rejects(
    readBody(
      new Request('https://support.test/api', {
        method: 'POST',
        headers: {
          origin: 'https://support.test',
          'content-type': 'application/json',
        },
        body: 'x'.repeat(32769),
      }),
    ),
  );
  assert.deepEqual(
    await readBody(
      new Request('https://support.test/api', {
        method: 'POST',
        headers: {
          origin: 'https://support.test',
          'content-type': 'application/json',
        },
        body: '{"hello":"world"}',
      }),
    ),
    { hello: 'world' },
  );
});
