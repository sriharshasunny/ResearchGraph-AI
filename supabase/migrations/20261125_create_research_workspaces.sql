-- Personal research workspaces and a reusable per-user paper library.
-- Run this migration in the Supabase SQL editor or through Supabase migrations.

create table if not exists public.research_workspaces (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    name text not null check (char_length(trim(name)) between 1 and 100),
    description text not null default '' check (char_length(description) <= 1000),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (id, user_id)
);

create table if not exists public.research_papers (
    user_id uuid not null references auth.users(id) on delete cascade,
    paper_id text not null check (char_length(trim(paper_id)) between 1 and 500),
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    primary key (user_id, paper_id)
);

create table if not exists public.workspace_papers (
    workspace_id uuid not null,
    user_id uuid not null references auth.users(id) on delete cascade,
    paper_id text not null,
    added_at timestamptz not null default now(),
    primary key (workspace_id, paper_id),
    constraint workspace_papers_workspace_owner_fk
        foreign key (workspace_id, user_id)
        references public.research_workspaces(id, user_id)
        on delete cascade,
    constraint workspace_papers_paper_owner_fk
        foreign key (user_id, paper_id)
        references public.research_papers(user_id, paper_id)
        on delete cascade
);

create index if not exists research_workspaces_user_created_idx
    on public.research_workspaces(user_id, created_at desc);
create index if not exists workspace_papers_user_paper_idx
    on public.workspace_papers(user_id, paper_id);
create index if not exists workspace_papers_workspace_added_idx
    on public.workspace_papers(workspace_id, added_at desc);

alter table public.research_workspaces enable row level security;
alter table public.research_papers enable row level security;
alter table public.workspace_papers enable row level security;

drop policy if exists "Users manage their own research workspaces" on public.research_workspaces;
create policy "Users manage their own research workspaces"
    on public.research_workspaces
    for all
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

drop policy if exists "Users manage their own research papers" on public.research_papers;
create policy "Users manage their own research papers"
    on public.research_papers
    for all
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

drop policy if exists "Users manage their own workspace paper links" on public.workspace_papers;
create policy "Users manage their own workspace paper links"
    on public.workspace_papers
    for all
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

create or replace function public.set_research_workspace_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists research_workspaces_updated_at on public.research_workspaces;
create trigger research_workspaces_updated_at
    before update on public.research_workspaces
    for each row execute function public.set_research_workspace_updated_at();

drop trigger if exists research_papers_updated_at on public.research_papers;
create trigger research_papers_updated_at
    before update on public.research_papers
    for each row execute function public.set_research_workspace_updated_at();
