-- Classement en ligne de « Une nuit avec Michel » (Supabase / PostgreSQL).
-- À coller une fois dans Supabase -> SQL Editor. Ensuite, mettre l'URL du projet et la clé « anon » dans .env
-- (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) avant `npm run build`. La clé anon est publique par conception :
-- c'est la sécurité au niveau des lignes (RLS) ci-dessous qui protège la table.

create table if not exists public.scores (
  id      bigint generated always as identity primary key,
  name    text not null check (name ~ '^[A-Z0-9ÀÂÉÈÊËÎÏÔÛÙÇ]{1,6}$'),
  score   integer not null check (score between 1 and 1000000),
  stage   text not null check (char_length(stage) <= 12),
  win     boolean not null default false,
  mode    text not null check (mode in ('easy', 'medium', 'hard')),
  at      timestamptz not null default now(),
  ip_hash text                                   -- rempli par le trigger, jamais exposé
);
create index if not exists scores_mode_score on public.scores (mode, score desc);

alter table public.scores enable row level security;

-- par défaut Supabase donne tous les droits aux rôles publics : on repart de zéro
revoke all on public.scores from anon, authenticated;

-- lecture : tout le monde, mais seulement les colonnes publiques (ip_hash reste caché)
grant select (id, name, score, stage, win, mode, at) on public.scores to anon, authenticated;
drop policy if exists "scores lisibles" on public.scores;
create policy "scores lisibles" on public.scores for select to anon, authenticated using (true);

-- écriture : insertion seulement (pas de modification ni de suppression), valeurs vérifiées par les contraintes
grant insert (name, score, stage, win, mode) on public.scores to anon, authenticated;
drop policy if exists "scores ajoutables" on public.scores;
create policy "scores ajoutables" on public.scores for insert to anon, authenticated with check (true);

-- anti-spam simple : un score par adresse IP toutes les 20 secondes
create or replace function public.scores_rate_limit() returns trigger
language plpgsql security definer set search_path = public as $$
declare ip text := coalesce(
  split_part(current_setting('request.headers', true)::json ->> 'x-forwarded-for', ',', 1), 'inconnu');
begin
  new.ip_hash := md5(ip || 'michel');
  new.at := now();
  if exists (select 1 from public.scores where ip_hash = new.ip_hash and at > now() - interval '20 seconds') then
    raise exception 'trop vite, mon Michel' using errcode = 'P0001';
  end if;
  return new;
end $$;
drop trigger if exists scores_rate_limit on public.scores;
create trigger scores_rate_limit before insert on public.scores for each row execute function public.scores_rate_limit();
