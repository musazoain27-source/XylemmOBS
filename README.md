# XylemmOBS support

A Sites / vinext support center with a D1-backed private inbox, owner-only ChatGPT sign-in, searchable answers, and capability links for visitors.

## Runtime configuration

Set ADMIN_EMAIL in Sites to the owner’s ChatGPT account email. Missing configuration denies inbox access. Set RATE_LIMIT_SALT to a random secret. Public visitors do not need to sign in. Site-wide hosting access is separate from application inbox authorization.

## Local development

Install using the generated pnpm lockfile. Dependency lifecycle scripts were kept disabled; packaged platform binaries are used. Create an ignored .dev.vars with ADMIN_EMAIL=seedy@sites.test for the Sites local simulated owner. Never deploy this simulated email as the production allowlist.
Apply migrations with wrangler d1 migrations apply DB --local --config wrangler.local.json, then pnpm run dev. The Sites plugin provides local sign-in at /signin-with-chatgpt?return_to=/inbox.

## Storage

Report access keys are 32 random bytes. Only their SHA-256 hashes are stored. Browser tracking links keep keys in URL fragments and send them to lookup as JSON. Inbox APIs require the owner’s trusted dispatcher identity. All API responses prohibit caching. Writes require a matching Origin and bounded JSON. SQL is prepared and bound. Submission keys make retries idempotent; reply writes use optimistic concurrency. Reports are not public knowledge-base entries.
The inbox has status filters, pagination, replies and status updates. No email notifications or file uploads are implemented. Visitor follow-ups can be sent as new questions. Rate limits count hourly requests per salted network hash.

## Verification

Run node --experimental-transform-types --test tests/validation.test.ts for validation/security checks. tests/integration.mjs exercises local anonymous submit, idempotency, private lookup, unauthorized access, simulated owner sign-in, reply persistence and stale update rejection.
Browser visual testing was not requested. The optional search_support_answers WebMCP tool shares the visible FAQ state; no supported WebMCP execution context was available for contract verification.

## Hosting

The registered Sites project is persisted in .openai/hosting.json. Source and artifact must correspond to the same pushed commit. Production owner email is managed as a Sites secret and is not part of this source.
