-- ============================================================
-- GHOST BUSINESS — Database Schema v1.0
-- Supabase / PostgreSQL
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ─── ENUMS ────────────────────────────────────────────────────────────────────

create type user_role as enum ('acheteur', 'vendeur');
create type buyer_profile_type as enum ('focus', 'portfolio');
create type deal_status as enum ('actif', 'pause', 'vendu', 'retire');
create type match_status as enum (
  'en_attente', 'nda_signe', 'data_room',
  'due_diligence', 'offre', 'closing', 'refuse', 'annule'
);
create type ghost_score as enum ('A+', 'A', 'B+', 'B', 'C');
create type subscription_tier as enum ('standard', 'premium');
create type message_type as enum ('text', 'offer', 'system', 'file');
create type sector_type as enum (
  'agroalimentaire', 'manufacturier', 'services_b2b', 'commerce_detail',
  'technologies', 'construction', 'sante', 'transport', 'autre'
);
create type region_type as enum (
  'estrie', 'monteregie', 'montreal', 'quebec_ville',
  'laurentides', 'laval', 'lanaudiere', 'chaudiere_appalaches', 'autre'
);
create type sale_reason as enum ('retraite', 'reorientation', 'sante', 'transmission', 'autre');

-- ─── PROFILES ────────────────────────────────────────────────────────────────

create table profiles (
  id                    uuid primary key references auth.users(id) on delete cascade,
  email                 text not null unique,
  full_name             text not null,
  role                  user_role not null,
  buyer_profile         buyer_profile_type,
  subscription_tier     subscription_tier not null default 'standard',
  subscription_active   boolean not null default false,
  neq                   text,           -- Numéro d'entreprise Québec (vendeur)
  phone                 text,
  avatar_url            text,
  onboarding_complete   boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- ─── DEALS ───────────────────────────────────────────────────────────────────

create table deals (
  id                        uuid primary key default uuid_generate_v4(),
  seller_id                 uuid not null references profiles(id) on delete cascade,

  -- Private identity (NEVER returned to non-matched buyers via RLS)
  company_name              text not null,
  address                   text not null,

  -- Public data
  sector                    sector_type not null,
  region                    region_type not null,
  founded_year              int not null check (founded_year >= 1900),
  employee_count            text not null,
  annual_revenue            bigint not null check (annual_revenue > 0),
  ebitda                    bigint not null check (ebitda > 0),
  growth_3y                 numeric(5,2) not null default 0,
  asking_price              bigint not null check (asking_price > 0),
  net_margin                numeric(5,2) not null default 0,
  sale_reason               sale_reason not null default 'retraite',

  -- AI computed (recalculated on upsert via trigger)
  ghost_score               ghost_score not null default 'B',
  ghost_score_rentabilite   int not null default 50,
  ghost_score_attractivite  int not null default 50,
  estimated_multiple        numeric(4,2) not null default 4.0,
  estimated_liquidity_months int not null default 12,
  risk_level                text not null default 'moyen',

  -- Public description
  description               text not null,
  strengths                 text[] not null default '{}',
  ideal_buyer               text not null,

  -- Visibility
  status                    deal_status not null default 'actif',
  off_market_only           boolean not null default false,
  hide_exact_sector         boolean not null default false,
  hide_exact_region         boolean not null default false,
  block_same_sector         boolean not null default false,

  -- Stats (denormalized for perf)
  view_count                int not null default 0,
  interest_count            int not null default 0,

  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

create index idx_deals_seller on deals(seller_id);
create index idx_deals_status on deals(status);
create index idx_deals_sector on deals(sector);
create index idx_deals_region on deals(region);
create index idx_deals_ghost_score on deals(ghost_score);
create index idx_deals_off_market on deals(off_market_only);

-- ─── MATCHES ─────────────────────────────────────────────────────────────────

create table matches (
  id                        uuid primary key default uuid_generate_v4(),
  deal_id                   uuid not null references deals(id) on delete cascade,
  buyer_id                  uuid not null references profiles(id),
  seller_id                 uuid not null references profiles(id),
  status                    match_status not null default 'en_attente',

  -- NDA
  nda_signed_at             timestamptz,
  nda_signed_by_buyer       boolean not null default false,
  nda_signed_by_seller      boolean not null default false,

  -- Mutual reveal
  buyer_accepted_reveal     boolean not null default false,
  seller_accepted_reveal    boolean not null default false,
  revealed_at               timestamptz,

  -- AI
  ai_compatibility_score    int not null default 0 check (ai_compatibility_score between 0 and 100),

  -- Offer (jsonb for flexibility)
  offer_price               bigint,
  offer_payment_terms       text,
  offer_transition_months   int,
  offer_submitted_at        timestamptz,
  offer_response            text,
  offer_responded_at        timestamptz,

  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),

  unique(deal_id, buyer_id)
);

create index idx_matches_deal on matches(deal_id);
create index idx_matches_buyer on matches(buyer_id);
create index idx_matches_seller on matches(seller_id);
create index idx_matches_status on matches(status);

-- ─── MESSAGES ────────────────────────────────────────────────────────────────

create table messages (
  id          uuid primary key default uuid_generate_v4(),
  match_id    uuid not null references matches(id) on delete cascade,
  sender_id   uuid not null references profiles(id),
  content     text not null,
  type        message_type not null default 'text',
  metadata    jsonb,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index idx_messages_match on messages(match_id);
create index idx_messages_sender on messages(sender_id);
create index idx_messages_created on messages(created_at);

-- ─── DATA ROOM ───────────────────────────────────────────────────────────────

create table data_room_documents (
  id            uuid primary key default uuid_generate_v4(),
  deal_id       uuid not null references deals(id) on delete cascade,
  name          text not null,
  description   text,
  file_url      text not null,
  file_size     bigint not null,
  file_type     text not null,
  is_required   boolean not null default false,
  uploaded_at   timestamptz not null default now()
);

create table data_room_access (
  id            uuid primary key default uuid_generate_v4(),
  document_id   uuid not null references data_room_documents(id) on delete cascade,
  match_id      uuid not null references matches(id) on delete cascade,
  accessed_at   timestamptz not null default now()
);

create index idx_dr_deal on data_room_documents(deal_id);
create index idx_dr_access_doc on data_room_access(document_id);
create index idx_dr_access_match on data_room_access(match_id);

-- ─── NOTIFICATIONS ───────────────────────────────────────────────────────────

create table notifications (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references profiles(id) on delete cascade,
  title         text not null,
  body          text not null,
  type          text not null,
  read          boolean not null default false,
  action_url    text,
  created_at    timestamptz not null default now()
);

create index idx_notif_user on notifications(user_id);
create index idx_notif_read on notifications(read);

-- ─── GHOST SCORE TRIGGER ─────────────────────────────────────────────────────

create or replace function compute_ghost_score()
returns trigger as $$
declare
  rentabilite   int;
  attractivite  int;
  multiple      numeric;
  liquidity     int;
  score         ghost_score;
begin
  -- Rentabilité (0-100) based on net margin
  rentabilite := least(100, greatest(0, (new.net_margin * 4)::int));

  -- Attractivité based on growth + sector
  attractivite := least(100, greatest(0, (60 + new.growth_3y * 1.5)::int));

  -- Multiple estimé
  multiple := round(4.0 + (new.growth_3y / 30.0) + (new.net_margin / 25.0), 2);

  -- Liquidité estimée (months)
  liquidity := greatest(3, (24 - new.growth_3y / 2 - new.net_margin / 3)::int);

  -- Score final
  if new.net_margin > 18 and new.growth_3y > 10 then
    score := 'A+';
  elsif new.net_margin > 14 and new.growth_3y > 5 then
    score := 'A';
  elsif new.net_margin > 10 then
    score := 'B+';
  elsif new.net_margin > 6 then
    score := 'B';
  else
    score := 'C';
  end if;

  new.ghost_score := score;
  new.ghost_score_rentabilite := rentabilite;
  new.ghost_score_attractivite := attractivite;
  new.estimated_multiple := multiple;
  new.estimated_liquidity_months := liquidity;
  new.updated_at := now();

  return new;
end;
$$ language plpgsql;

create trigger trg_ghost_score
  before insert or update on deals
  for each row execute function compute_ghost_score();

-- ─── AUTO-UPDATE TIMESTAMPS ──────────────────────────────────────────────────

create or replace function touch_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function touch_updated_at();

create trigger trg_matches_updated_at
  before update on matches
  for each row execute function touch_updated_at();

-- ─── AUTO-REVEAL ON MUTUAL ACCEPTANCE ────────────────────────────────────────

create or replace function check_mutual_reveal()
returns trigger as $$
begin
  if new.buyer_accepted_reveal = true and new.seller_accepted_reveal = true
     and old.revealed_at is null then
    new.revealed_at := now();
    new.status := 'due_diligence';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_mutual_reveal
  before update on matches
  for each row execute function check_mutual_reveal();

-- ─── INCREMENT VIEW COUNT ─────────────────────────────────────────────────────

create or replace function increment_deal_views(deal_uuid uuid)
returns void as $$
begin
  update deals set view_count = view_count + 1 where id = deal_uuid;
end;
$$ language plpgsql security definer;

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────────

alter table profiles enable row level security;
alter table deals enable row level security;
alter table matches enable row level security;
alter table messages enable row level security;
alter table data_room_documents enable row level security;
alter table data_room_access enable row level security;
alter table notifications enable row level security;

-- PROFILES: users see their own profile only
create policy "profiles_select_own" on profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id);

create policy "profiles_insert_own" on profiles
  for insert with check (auth.uid() = id);

-- DEALS: buyers see public data; full data only to seller or post-reveal match
create policy "deals_select_public" on deals
  for select using (
    status = 'actif'
    and (
      -- Seller sees their own deals fully
      seller_id = auth.uid()
      or (
        -- Buyers see non-off-market, or premium buyers see all
        off_market_only = false
        or exists (
          select 1 from profiles p
          where p.id = auth.uid()
          and p.subscription_tier = 'premium'
          and p.subscription_active = true
        )
      )
    )
  );

create policy "deals_insert_seller" on deals
  for insert with check (seller_id = auth.uid());

create policy "deals_update_seller" on deals
  for update using (seller_id = auth.uid());

-- MATCHES: buyer or seller of the match
create policy "matches_select" on matches
  for select using (buyer_id = auth.uid() or seller_id = auth.uid());

create policy "matches_insert_buyer" on matches
  for insert with check (buyer_id = auth.uid());

create policy "matches_update_participants" on matches
  for update using (buyer_id = auth.uid() or seller_id = auth.uid());

-- MESSAGES: only match participants
create policy "messages_select" on messages
  for select using (
    exists (
      select 1 from matches m
      where m.id = messages.match_id
      and (m.buyer_id = auth.uid() or m.seller_id = auth.uid())
    )
  );

create policy "messages_insert" on messages
  for insert with check (
    sender_id = auth.uid()
    and exists (
      select 1 from matches m
      where m.id = match_id
      and (m.buyer_id = auth.uid() or m.seller_id = auth.uid())
      and m.status not in ('refuse', 'annule')
    )
  );

-- DATA ROOM: only after NDA signed
create policy "dataroom_select_nda" on data_room_documents
  for select using (
    exists (
      select 1 from deals d where d.id = data_room_documents.deal_id and d.seller_id = auth.uid()
    )
    or exists (
      select 1 from matches m
      where m.deal_id = data_room_documents.deal_id
      and m.buyer_id = auth.uid()
      and m.nda_signed_by_buyer = true
    )
  );

create policy "dataroom_insert_seller" on data_room_documents
  for insert with check (
    exists (select 1 from deals d where d.id = deal_id and d.seller_id = auth.uid())
  );

-- NOTIFICATIONS: own only
create policy "notif_select_own" on notifications
  for select using (user_id = auth.uid());

create policy "notif_update_own" on notifications
  for update using (user_id = auth.uid());
