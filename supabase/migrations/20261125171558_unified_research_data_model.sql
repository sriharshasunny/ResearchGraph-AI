-- ResearchGraph AI: unified, user-scoped research data model.
-- This migration creates application metadata only. It does not delete or rewrite
-- existing ChromaDB vectors, Neo4j nodes, SQLite status rows, or frontend localStorage.

begin;

create table if not exists public.workspaces (
    id uuid primary key default gen_random_uuid(),
    owner_id uuid not null references auth.users(id) on delete cascade,
    name text not null check (char_length(btrim(name)) between 1 and 120),
    description text not null default '',
    archived_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint workspaces_owner_id_id_key unique (owner_id, id)
);

create unique index if not exists workspaces_owner_active_name_uidx
    on public.workspaces (owner_id, lower(name))
    where archived_at is null;

create index if not exists workspaces_owner_updated_idx
    on public.workspaces (owner_id, updated_at desc);


create table if not exists public.papers (
    id uuid primary key default gen_random_uuid(),
    owner_id uuid not null references auth.users(id) on delete cascade,
    title text not null check (char_length(btrim(title)) between 1 and 2000),
    abstract text,
    publication_year integer check (publication_year is null or publication_year between 1000 and 3000),
    venue text,
    source_provider text not null default 'other'
        check (source_provider in ('openalex', 'arxiv', 'crossref', 'manual_upload', 'other')),
    source_url text,
    pdf_url text,
    open_access boolean,
    access_type text not null default 'metadata_only'
        check (access_type in ('open_access_pdf', 'abstract_only', 'metadata_only', 'private_upload', 'unknown')),
    metadata jsonb not null default '{}'::jsonb
        check (jsonb_typeof(metadata) = 'object'),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint papers_owner_id_id_key unique (owner_id, id)
);

create index if not exists papers_owner_created_idx
    on public.papers (owner_id, created_at desc);


create table if not exists public.paper_identifiers (
    id uuid primary key default gen_random_uuid(),
    owner_id uuid not null,
    paper_id uuid not null,
    identifier_type text not null
        check (identifier_type in ('doi', 'openalex', 'arxiv', 'pmid', 'pmcid', 'isbn', 'other')),
    original_value text not null check (char_length(btrim(original_value)) between 1 and 1000),
    normalized_value text not null check (char_length(btrim(normalized_value)) between 1 and 1000),
    source_provider text not null default 'other'
        check (source_provider in ('openalex', 'arxiv', 'crossref', 'manual_upload', 'other')),
    is_primary boolean not null default false,
    created_at timestamptz not null default now(),
    constraint paper_identifiers_owner_paper_fk
        foreign key (owner_id, paper_id)
        references public.papers (owner_id, id)
        on delete cascade,
    constraint paper_identifiers_unique_per_owner
        unique (owner_id, identifier_type, normalized_value)
);

create index if not exists paper_identifiers_paper_idx
    on public.paper_identifiers (owner_id, paper_id);


create table if not exists public.workspace_papers (
    owner_id uuid not null,
    workspace_id uuid not null,
    paper_id uuid not null,
    added_at timestamptz not null default now(),
    primary key (workspace_id, paper_id),
    constraint workspace_papers_workspace_owner_fk
        foreign key (owner_id, workspace_id)
        references public.workspaces (owner_id, id)
        on delete cascade,
    constraint workspace_papers_paper_owner_fk
        foreign key (owner_id, paper_id)
        references public.papers (owner_id, id)
        on delete cascade
);

create index if not exists workspace_papers_owner_workspace_idx
    on public.workspace_papers (owner_id, workspace_id, added_at desc);

create index if not exists workspace_papers_owner_paper_idx
    on public.workspace_papers (owner_id, paper_id);


-- Stores private-object metadata only. The private Storage bucket and its object
-- policies must be configured before private uploads are enabled in the UI.
create table if not exists public.paper_assets (
    id uuid primary key default gen_random_uuid(),
    owner_id uuid not null,
    paper_id uuid not null,
    asset_kind text not null default 'original_pdf'
        check (asset_kind in ('original_pdf', 'supplementary_file', 'other')),
    storage_bucket text not null default 'research-papers',
    storage_path text not null check (char_length(btrim(storage_path)) between 1 and 2000),
    file_name text not null check (char_length(btrim(file_name)) between 1 and 500),
    content_type text not null default 'application/pdf',
    byte_size bigint check (byte_size is null or byte_size > 0),
    checksum_sha256 text check (
        checksum_sha256 is null or checksum_sha256 ~ '^[0-9a-f]{64}$'
    ),
    version_number integer not null default 1 check (version_number > 0),
    created_at timestamptz not null default now(),
    constraint paper_assets_owner_paper_fk
        foreign key (owner_id, paper_id)
        references public.papers (owner_id, id)
        on delete cascade,
    constraint paper_assets_unique_storage_object
        unique (storage_bucket, storage_path),
    constraint paper_assets_unique_version
        unique (owner_id, paper_id, asset_kind, version_number)
);

create index if not exists paper_assets_owner_paper_idx
    on public.paper_assets (owner_id, paper_id);


-- One durable current ingestion snapshot per user-owned paper.
-- Detailed job history/queueing can be added later without changing paper identity.
create table if not exists public.paper_ingestion_status (
    owner_id uuid not null,
    paper_id uuid not null,
    status text not null default 'discovered'
        check (status in (
            'discovered', 'queued', 'metadata_available', 'downloading',
            'extracting', 'indexing', 'validating', 'graphing',
            'ready', 'abstract_only', 'failed'
        )),
    stage text,
    attempt_count integer not null default 0 check (attempt_count >= 0),
    chunk_count integer not null default 0 check (chunk_count >= 0),
    entity_count integer not null default 0 check (entity_count >= 0),
    claim_count integer not null default 0 check (claim_count >= 0),
    vector_ready boolean not null default false,
    graph_ready boolean not null default false,
    retryable boolean not null default false,
    error_message text,
    started_at timestamptz,
    completed_at timestamptz,
    updated_at timestamptz not null default now(),
    primary key (owner_id, paper_id),
    constraint paper_ingestion_status_owner_paper_fk
        foreign key (owner_id, paper_id)
        references public.papers (owner_id, id)
        on delete cascade
);

create index if not exists paper_ingestion_status_updated_idx
    on public.paper_ingestion_status (owner_id, updated_at desc);


create or replace function public.researchgraph_set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $function$
begin
    new.updated_at := now();
    return new;
end;
$function$;

drop trigger if exists workspaces_set_updated_at on public.workspaces;
create trigger workspaces_set_updated_at
    before update on public.workspaces
    for each row execute function public.researchgraph_set_updated_at();

drop trigger if exists papers_set_updated_at on public.papers;
create trigger papers_set_updated_at
    before update on public.papers
    for each row execute function public.researchgraph_set_updated_at();


-- Row-level security is the database-side ownership boundary for direct
-- authenticated Supabase access. Backend endpoints must also verify the JWT
-- and derive owner_id from the verified identity, never from request JSON.
alter table public.workspaces enable row level security;
alter table public.papers enable row level security;
alter table public.paper_identifiers enable row level security;
alter table public.workspace_papers enable row level security;
alter table public.paper_assets enable row level security;
alter table public.paper_ingestion_status enable row level security;

drop policy if exists workspaces_select_own on public.workspaces;
create policy workspaces_select_own on public.workspaces
    for select to authenticated using (owner_id = (select auth.uid()));
drop policy if exists workspaces_insert_own on public.workspaces;
create policy workspaces_insert_own on public.workspaces
    for insert to authenticated with check (owner_id = (select auth.uid()));
drop policy if exists workspaces_update_own on public.workspaces;
create policy workspaces_update_own on public.workspaces
    for update to authenticated
    using (owner_id = (select auth.uid()))
    with check (owner_id = (select auth.uid()));
drop policy if exists workspaces_delete_own on public.workspaces;
create policy workspaces_delete_own on public.workspaces
    for delete to authenticated using (owner_id = (select auth.uid()));

drop policy if exists papers_select_own on public.papers;
create policy papers_select_own on public.papers
    for select to authenticated using (owner_id = (select auth.uid()));
drop policy if exists papers_insert_own on public.papers;
create policy papers_insert_own on public.papers
    for insert to authenticated with check (owner_id = (select auth.uid()));
drop policy if exists papers_update_own on public.papers;
create policy papers_update_own on public.papers
    for update to authenticated
    using (owner_id = (select auth.uid()))
    with check (owner_id = (select auth.uid()));
drop policy if exists papers_delete_own on public.papers;
create policy papers_delete_own on public.papers
    for delete to authenticated using (owner_id = (select auth.uid()));

drop policy if exists paper_identifiers_select_own on public.paper_identifiers;
create policy paper_identifiers_select_own on public.paper_identifiers
    for select to authenticated using (owner_id = (select auth.uid()));
drop policy if exists paper_identifiers_insert_own on public.paper_identifiers;
create policy paper_identifiers_insert_own on public.paper_identifiers
    for insert to authenticated with check (owner_id = (select auth.uid()));
drop policy if exists paper_identifiers_update_own on public.paper_identifiers;
create policy paper_identifiers_update_own on public.paper_identifiers
    for update to authenticated
    using (owner_id = (select auth.uid()))
    with check (owner_id = (select auth.uid()));
drop policy if exists paper_identifiers_delete_own on public.paper_identifiers;
create policy paper_identifiers_delete_own on public.paper_identifiers
    for delete to authenticated using (owner_id = (select auth.uid()));

drop policy if exists workspace_papers_select_own on public.workspace_papers;
create policy workspace_papers_select_own on public.workspace_papers
    for select to authenticated using (owner_id = (select auth.uid()));
drop policy if exists workspace_papers_insert_own on public.workspace_papers;
create policy workspace_papers_insert_own on public.workspace_papers
    for insert to authenticated with check (owner_id = (select auth.uid()));
drop policy if exists workspace_papers_delete_own on public.workspace_papers;
create policy workspace_papers_delete_own on public.workspace_papers
    for delete to authenticated using (owner_id = (select auth.uid()));

drop policy if exists paper_assets_select_own on public.paper_assets;
create policy paper_assets_select_own on public.paper_assets
    for select to authenticated using (owner_id = (select auth.uid()));
drop policy if exists paper_assets_insert_own on public.paper_assets;
create policy paper_assets_insert_own on public.paper_assets
    for insert to authenticated with check (owner_id = (select auth.uid()));
drop policy if exists paper_assets_delete_own on public.paper_assets;
create policy paper_assets_delete_own on public.paper_assets
    for delete to authenticated using (owner_id = (select auth.uid()));

drop policy if exists paper_ingestion_status_select_own on public.paper_ingestion_status;
create policy paper_ingestion_status_select_own on public.paper_ingestion_status
    for select to authenticated using (owner_id = (select auth.uid()));
drop policy if exists paper_ingestion_status_insert_own on public.paper_ingestion_status;
create policy paper_ingestion_status_insert_own on public.paper_ingestion_status
    for insert to authenticated with check (owner_id = (select auth.uid()));
drop policy if exists paper_ingestion_status_update_own on public.paper_ingestion_status;
create policy paper_ingestion_status_update_own on public.paper_ingestion_status
    for update to authenticated
    using (owner_id = (select auth.uid()))
    with check (owner_id = (select auth.uid()));
drop policy if exists paper_ingestion_status_delete_own on public.paper_ingestion_status;
create policy paper_ingestion_status_delete_own on public.paper_ingestion_status
    for delete to authenticated using (owner_id = (select auth.uid()));

grant select, insert, update, delete on
    public.workspaces,
    public.papers,
    public.paper_identifiers,
    public.workspace_papers,
    public.paper_assets,
    public.paper_ingestion_status
to authenticated;

revoke all on
    public.workspaces,
    public.papers,
    public.paper_identifiers,
    public.workspace_papers,
    public.paper_assets,
    public.paper_ingestion_status
from anon;

commit;
