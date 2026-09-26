-- Makes email verification mandatory before a new account can sign in.
-- Separate from magic_link_tokens (schema-only, unused so far): this table
-- is keyed by user_id (the account already exists at signup time) rather
-- than by email, and serves a distinct purpose (proving control of the
-- address just used to register, not authenticating an existing user).

alter table users add column email_verified_at timestamptz;

create table email_verification_tokens (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  token_hash  text not null,
  expires_at  timestamptz not null,
  consumed_at timestamptz,
  created_at  timestamptz not null default now()
);
create unique index email_verification_tokens_token_hash_idx on email_verification_tokens (token_hash);
create index email_verification_tokens_user_id_idx on email_verification_tokens (user_id);
