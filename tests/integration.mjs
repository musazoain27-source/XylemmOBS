import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
const base = 'http://localhost:3000';
async function call(path, method = 'GET', body, cookie, extra = {}) {
  const requestOptions = {
    method,
    redirect: 'manual',
    headers: {
      ...(body ? { 'Content-Type': 'application/json', Origin: base } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
      ...extra,
    },
    body:
      body && method !== 'GET' && method !== 'HEAD'
        ? JSON.stringify(body)
        : undefined,
    signal: AbortSignal.timeout(60000),
  };
  const response = await fetch(base + path, requestOptions);
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text.slice(0, 300);
  }
  return { status: response.status, data, headers: response.headers };
}
function check(label, actual, expected) {
  assert.equal(actual, expected, label);
  console.log('PASS', label);
}
check('anonymous inbox is denied', (await call('/api/inbox')).status, 403);
check(
  'forged identity headers are denied',
  (
    await call('/api/inbox', 'GET', undefined, undefined, {
      'oai-authenticated-user-id': 'forged',
      'oai-authenticated-user-email': 'seedy@sites.test',
    })
  ).status,
  403,
);
check(
  'invalid report is rejected',
  (await call('/api/tickets', 'POST', {})).status,
  400,
);
const token = randomBytes(32).toString('hex');
const submission = {
  kind: 'issue',
  token,
  title: 'Integration test: recording issue',
  body: 'Local automated test. A recording stutters while the camera moves.',
  modVersion: '0.1.5',
  minecraft: '1.21.11',
  gpu: 'Test GPU',
  settings: '1080p60 CFR',
};
check(
  'cross-origin write is denied',
  (
    await call('/api/tickets', 'POST', submission, undefined, {
      Origin: 'https://unrelated.example',
    })
  ).status,
  403,
);
const created = await call('/api/tickets', 'POST', submission);
check('report persists', created.status, 201);
assert.ok(created.data.id);
const duplicate = await call('/api/tickets', 'POST', submission);
check('retries keep same report', duplicate.data.id, created.data.id);
const lookup = await call('/api/tickets/lookup', 'POST', { token });
check('private key opens report', lookup.status, 200);
check('stored message is intact', lookup.data.ticket.body, submission.body);
assert.equal('tokenHash' in lookup.data.ticket, false);
check(
  'wrong private key is denied',
  (
    await call('/api/tickets/lookup', 'POST', {
      token: randomBytes(32).toString('hex'),
    })
  ).status,
  404,
);
check(
  'anonymous detail is denied',
  (await call('/api/inbox/' + created.data.id)).status,
  403,
);
const signIn = await call('/signin-with-chatgpt?return_to=/inbox');
assert.ok([302, 303, 307].includes(signIn.status));
const cookie = signIn.headers
  .getSetCookie()
  .map((value) => value.split(';')[0])
  .join('; ');
assert.ok(cookie);
const inbox = await call('/api/inbox', 'GET', undefined, cookie);
check('configured owner can open inbox', inbox.status, 200);
assert.ok(inbox.data.tickets.some((t) => t.id === created.data.id));
const detail = await call(
  '/api/inbox/' + created.data.id,
  'GET',
  undefined,
  cookie,
);
check('owner can read full report', detail.status, 200);
const edit = {
  status: 'answered',
  reply: 'Test reply saved successfully.',
  updatedAt: detail.data.ticket.updatedAt,
};
const saved = await call(
  '/api/inbox/' + created.data.id,
  'PATCH',
  edit,
  cookie,
);
check('owner reply persists', saved.status, 200);
const readback = await call('/api/tickets/lookup', 'POST', { token });
check('visitor can read reply', readback.data.ticket.reply, edit.reply);
check('visitor sees new status', readback.data.ticket.status, 'answered');
check(
  'stale update cannot overwrite reply',
  (await call('/api/inbox/' + created.data.id, 'PATCH', edit, cookie)).status,
  409,
);
check(
  'invalid inbox filters rejected',
  (await call('/api/inbox?status=unknown', 'GET', undefined, cookie)).status,
  400,
);
for (const path of [
  '/',
  '/submit?type=issue',
  '/submit?type=question',
  '/track',
  '/privacy',
  '/inbox',
])
  check('page responds ' + path, (await call(path)).status, 200);
console.log(
  'All support API integration checks passed. Test data exists only in the local development database.',
);
