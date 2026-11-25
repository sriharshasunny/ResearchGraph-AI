-- Tighten privileges for the unified research tables.
-- RLS protects rows; table grants must also avoid unsafe operations such as TRUNCATE.

begin;

revoke all privileges on table
    public.workspaces,
    public.papers,
    public.paper_identifiers,
    public.workspace_papers,
    public.paper_assets,
    public.paper_ingestion_status
from anon, authenticated;

grant select, insert, update, delete on
    public.workspaces,
    public.papers,
    public.paper_identifiers,
    public.paper_ingestion_status
to authenticated;

grant select, insert, delete on
    public.workspace_papers,
    public.paper_assets
to authenticated;

commit;
