declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    ADMIN_EMAIL?: string;
    RATE_LIMIT_SALT?: string;
  }
}
