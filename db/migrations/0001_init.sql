-- Phase 1: authentication + engagement/membership schema.
-- Assessment data (observations, evidence, scope, custom controls) is
-- intentionally NOT part of this migration; it still lives client-side
-- until a later phase reimplements the services layer against the API.

create extension if not exists pgcrypto;

-- ── Auth ─────────────────────────────────────────────────────────────
create table users (
  id            uuid primary key default gen_random_uuid(),
  email         text not null,
  password_hash text,              -- nullable: reserved for magic-link-only accounts later
  display_name  text not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create unique index users_email_lower_idx on users (lower(email));

create table sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references users(id) on delete cascade,
  token_hash   text not null,       -- sha256(raw token); raw token only ever in the cookie
  created_at   timestamptz not null default now(),
  expires_at   timestamptz not null,
  last_seen_at timestamptz not null default now(),
  user_agent   text
);
create unique index sessions_token_hash_idx on sessions (token_hash);
create index sessions_user_id_idx on sessions (user_id);

-- Schema only for now — no request/verify endpoints or email sending yet.
create table magic_link_tokens (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  token_hash  text not null,
  expires_at  timestamptz not null,
  consumed_at timestamptz,
  created_at  timestamptz not null default now()
);
create unique index magic_link_tokens_token_hash_idx on magic_link_tokens (token_hash);
create index magic_link_tokens_email_idx on magic_link_tokens (lower(email));

-- ── Engagements & membership ─────────────────────────────────────────
create type engagement_role as enum ('owner', 'reviewer', 'viewer');

create table engagements (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  client_name   text,
  framework_ids text[] not null default '{}',
  created_by    uuid not null references users(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index engagements_created_by_idx on engagements (created_by);

create table engagement_members (
  engagement_id uuid not null references engagements(id) on delete cascade,
  user_id       uuid not null references users(id) on delete cascade,
  role          engagement_role not null default 'viewer',
  invited_by    uuid references users(id),
  created_at    timestamptz not null default now(),
  primary key (engagement_id, user_id)
);
create index engagement_members_user_id_idx on engagement_members (user_id);

create table engagement_invites (
  id            uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references engagements(id) on delete cascade,
  email         text not null,
  role          engagement_role not null,
  invited_by    uuid not null references users(id),
  token_hash    text not null,
  expires_at    timestamptz not null,
  accepted_at   timestamptz,
  created_at    timestamptz not null default now()
);
create unique index engagement_invites_token_hash_idx on engagement_invites (token_hash);
create unique index engagement_invites_pending_unique_idx
  on engagement_invites (engagement_id, lower(email)) where accepted_at is null;
