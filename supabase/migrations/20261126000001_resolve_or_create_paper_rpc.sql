-- Stage 8B: Transactional, concurrency-safe internal paper identity resolution RPC.
-- Strictly SECURITY INVOKER so Supabase RLS (owner_id = auth.uid()) remains enforced.

begin;

create or replace function public.resolve_or_create_paper(
    p_identifiers jsonb,
    p_paper jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $function$
declare
    v_owner_id uuid := auth.uid();
    v_req jsonb := '[]'::jsonb;
    v_rec record;
    v_matched_papers uuid[];
    v_paper_id uuid;
    v_created boolean := false;
    v_title text;
    v_abstract text;
    v_pub_year integer;
    v_venue text;
    v_source_provider text;
    v_source_url text;
    v_pdf_url text;
    v_open_access boolean;
    v_access_type text;
    v_metadata jsonb;
    v_arxiv_versions jsonb := '[]'::jsonb;
begin
    if v_owner_id is null then
        raise exception 'RG_UNAUTHENTICATED: authenticated user session required'
            using errcode = '28000';
    end if;

    if p_identifiers is null or jsonb_typeof(p_identifiers) <> 'array' then
        raise exception 'RG_INVALID_IDENTIFIER: p_identifiers must be a non-empty JSON array'
            using errcode = '22023';
    end if;

    if jsonb_array_length(p_identifiers) < 1 or jsonb_array_length(p_identifiers) > 50 then
        raise exception 'RG_INVALID_IDENTIFIER: p_identifiers must contain between 1 and 50 items'
            using errcode = '22023';
    end if;

    if p_paper is null or jsonb_typeof(p_paper) <> 'object' then
        raise exception 'RG_INVALID_PAPER_PAYLOAD: p_paper must be a JSON object'
            using errcode = '22023';
    end if;

    -- Reject non-object identifier elements before extracting JSON fields.
    if exists (
        select 1
        from jsonb_array_elements(p_identifiers) as elem
        where jsonb_typeof(elem) <> 'object'
    ) then
        raise exception 'RG_INVALID_IDENTIFIER: each identifier entry must be a JSON object'
            using errcode = '22023';
    end if;

    -- Validate, deduplicate, and acquire transaction-scoped advisory locks in deterministic order
    -- to prevent deadlocks across concurrent requests with overlapping identifier sets.
    for v_rec in
        with parsed as (
            select
                ordinality,
                btrim(coalesce(elem->>'identifier_type', '')) as identifier_type,
                btrim(coalesce(elem->>'original_value', '')) as original_value,
                btrim(coalesce(elem->>'normalized_value', '')) as normalized_value,
                coalesce(nullif(btrim(elem->>'source_provider'), ''), 'other') as source_provider,
                case
                    when elem ? 'is_primary' and jsonb_typeof(elem->'is_primary') = 'boolean'
                        then (elem->>'is_primary')::boolean
                    else false
                end as is_primary
            from jsonb_array_elements(p_identifiers) with ordinality as arr(elem, ordinality)
        ),
        deduped as (
            select distinct on (identifier_type, normalized_value)
                identifier_type,
                original_value,
                normalized_value,
                source_provider,
                bool_or(is_primary) over (partition by identifier_type, normalized_value) as any_primary
            from parsed
            order by identifier_type, normalized_value, ordinality
        )
        select *
        from deduped
        order by identifier_type, normalized_value
    loop
        if v_rec.identifier_type not in ('doi', 'openalex', 'arxiv', 'pmid', 'pmcid', 'isbn', 'other') then
            raise exception 'RG_INVALID_IDENTIFIER: unsupported identifier_type %', v_rec.identifier_type
                using errcode = '22023';
        end if;
        if char_length(v_rec.original_value) < 1 or char_length(v_rec.original_value) > 1000 then
            raise exception 'RG_INVALID_IDENTIFIER: original_value must be between 1 and 1000 characters'
                using errcode = '22023';
        end if;
        if char_length(v_rec.normalized_value) < 1 or char_length(v_rec.normalized_value) > 1000 then
            raise exception 'RG_INVALID_IDENTIFIER: normalized_value must be between 1 and 1000 characters'
                using errcode = '22023';
        end if;
        if v_rec.source_provider not in ('openalex', 'arxiv', 'crossref', 'manual_upload', 'other') then
            raise exception 'RG_INVALID_IDENTIFIER: unsupported source_provider %', v_rec.source_provider
                using errcode = '22023';
        end if;

        v_req := v_req || jsonb_build_array(jsonb_build_object(
            'identifier_type', v_rec.identifier_type,
            'original_value', v_rec.original_value,
            'normalized_value', v_rec.normalized_value,
            'source_provider', v_rec.source_provider,
            'is_primary', v_rec.any_primary
        ));

        perform pg_advisory_xact_lock(
            hashtextextended(
                v_owner_id::text || '|' || v_rec.identifier_type || '|' || v_rec.normalized_value,
                0
            )
        );
    end loop;

    -- Collect distinct observed arXiv version strings so versioned originals are retained
    -- in papers.metadata even when paper_identifiers holds a single version-stripped row.
    select coalesce(jsonb_agg(distinct original_value order by original_value), '[]'::jsonb)
    into v_arxiv_versions
    from (
        select btrim(elem->>'original_value') as original_value
        from jsonb_array_elements(p_identifiers) as elem
        where btrim(coalesce(elem->>'identifier_type', '')) = 'arxiv'
          and char_length(btrim(coalesce(elem->>'original_value', ''))) between 1 and 1000
    ) arxiv_vals;

    -- Prepare validated papers payload; owner_id always comes exclusively from auth.uid().
    v_title := left(coalesce(nullif(btrim(p_paper->>'title'), ''), 'Untitled paper'), 2000);
    v_abstract := nullif(p_paper->>'abstract', '');
    v_venue := nullif(btrim(coalesce(p_paper->>'venue', '')), '');
    v_source_provider := coalesce(nullif(btrim(p_paper->>'source_provider'), ''), 'other');
    if v_source_provider not in ('openalex', 'arxiv', 'crossref', 'manual_upload', 'other') then
        raise exception 'RG_INVALID_PAPER_PAYLOAD: unsupported source_provider %', v_source_provider
            using errcode = '22023';
    end if;
    v_source_url := nullif(btrim(coalesce(p_paper->>'source_url', '')), '');
    v_pdf_url := nullif(btrim(coalesce(p_paper->>'pdf_url', '')), '');
    v_access_type := coalesce(nullif(btrim(p_paper->>'access_type'), ''), 'metadata_only');
    if v_access_type not in ('open_access_pdf', 'abstract_only', 'metadata_only', 'private_upload', 'unknown') then
        raise exception 'RG_INVALID_PAPER_PAYLOAD: unsupported access_type %', v_access_type
            using errcode = '22023';
    end if;

    if p_paper ? 'publication_year' and p_paper->'publication_year' <> 'null'::jsonb then
        if jsonb_typeof(p_paper->'publication_year') <> 'number' then
            raise exception 'RG_INVALID_PAPER_PAYLOAD: publication_year must be an integer'
                using errcode = '22023';
        end if;
        v_pub_year := (p_paper->>'publication_year')::integer;
        if v_pub_year < 1000 or v_pub_year > 3000 then
            raise exception 'RG_INVALID_PAPER_PAYLOAD: publication_year out of range (1000..3000)'
                using errcode = '22023';
        end if;
    else
        v_pub_year := null;
    end if;

    if p_paper ? 'open_access' and p_paper->'open_access' <> 'null'::jsonb then
        if jsonb_typeof(p_paper->'open_access') <> 'boolean' then
            raise exception 'RG_INVALID_PAPER_PAYLOAD: open_access must be a boolean'
                using errcode = '22023';
        end if;
        v_open_access := (p_paper->>'open_access')::boolean;
    else
        v_open_access := null;
    end if;

    if p_paper ? 'metadata' and p_paper->'metadata' <> 'null'::jsonb then
        if jsonb_typeof(p_paper->'metadata') <> 'object' then
            raise exception 'RG_INVALID_PAPER_PAYLOAD: metadata must be a JSON object'
                using errcode = '22023';
        end if;
        v_metadata := p_paper->'metadata';
    else
        v_metadata := '{}'::jsonb;
    end if;

    if jsonb_array_length(v_arxiv_versions) > 0 then
        v_metadata := jsonb_set(
            v_metadata,
            '{arxiv_versions}',
            (
                select jsonb_agg(distinct val order by val)
                from (
                    select jsonb_array_elements_text(coalesce(v_metadata->'arxiv_versions', '[]'::jsonb)) as val
                    union
                    select jsonb_array_elements_text(v_arxiv_versions) as val
                ) merged
            ),
            true
        );
    end if;

    -- Look up existing owner-scoped identifier mappings.
    select array_agg(distinct pi.paper_id order by pi.paper_id)
    into v_matched_papers
    from public.paper_identifiers pi
    join jsonb_to_recordset(v_req) as req(
        identifier_type text,
        normalized_value text
    )
      on pi.identifier_type = req.identifier_type
     and pi.normalized_value = req.normalized_value
    where pi.owner_id = v_owner_id;

    if coalesce(array_length(v_matched_papers, 1), 0) > 1 then
        raise exception 'RG_ALIAS_CONFLICT: identifiers resolve to multiple papers (%)',
            array_to_string(v_matched_papers, ',')
            using errcode = 'P0409';
    end if;

    if coalesce(array_length(v_matched_papers, 1), 0) = 1 then
        v_paper_id := v_matched_papers[1];
        v_created := false;
    else
        begin
            insert into public.papers (
                owner_id,
                title,
                abstract,
                publication_year,
                venue,
                source_provider,
                source_url,
                pdf_url,
                open_access,
                access_type,
                metadata
            ) values (
                v_owner_id,
                v_title,
                v_abstract,
                v_pub_year,
                v_venue,
                v_source_provider,
                v_source_url,
                v_pdf_url,
                v_open_access,
                v_access_type,
                v_metadata
            )
            returning id into v_paper_id;

            insert into public.paper_identifiers (
                owner_id,
                paper_id,
                identifier_type,
                original_value,
                normalized_value,
                source_provider,
                is_primary
            )
            select
                v_owner_id,
                v_paper_id,
                req.identifier_type,
                req.original_value,
                req.normalized_value,
                req.source_provider,
                req.is_primary
            from jsonb_to_recordset(v_req) as req(
                identifier_type text,
                original_value text,
                normalized_value text,
                source_provider text,
                is_primary boolean
            );

            v_created := true;
        exception
            when unique_violation then
                -- Subtransaction automatically rolled back the uncommitted papers row.
                select array_agg(distinct pi.paper_id order by pi.paper_id)
                into v_matched_papers
                from public.paper_identifiers pi
                join jsonb_to_recordset(v_req) as req(
                    identifier_type text,
                    normalized_value text
                )
                  on pi.identifier_type = req.identifier_type
                 and pi.normalized_value = req.normalized_value
                where pi.owner_id = v_owner_id;

                if coalesce(array_length(v_matched_papers, 1), 0) > 1 then
                    raise exception 'RG_ALIAS_CONFLICT: identifiers resolve to multiple papers (%)',
                        array_to_string(v_matched_papers, ',')
                        using errcode = 'P0409';
                end if;
                if coalesce(array_length(v_matched_papers, 1), 0) = 1 then
                    v_paper_id := v_matched_papers[1];
                    v_created := false;
                else
                    raise;
                end if;
        end;
    end if;

    if not v_created then
        insert into public.paper_identifiers (
            owner_id,
            paper_id,
            identifier_type,
            original_value,
            normalized_value,
            source_provider,
            is_primary
        )
        select
            v_owner_id,
            v_paper_id,
            req.identifier_type,
            req.original_value,
            req.normalized_value,
            req.source_provider,
            case
                when exists (
                    select 1
                    from public.paper_identifiers cur
                    where cur.owner_id = v_owner_id
                      and cur.paper_id = v_paper_id
                      and cur.is_primary
                ) then false
                else req.is_primary
            end
        from jsonb_to_recordset(v_req) as req(
            identifier_type text,
            original_value text,
            normalized_value text,
            source_provider text,
            is_primary boolean
        )
        on conflict (owner_id, identifier_type, normalized_value) do nothing;

        -- Verify all requested identifiers resolve solely to v_paper_id.
        select array_agg(distinct pi.paper_id order by pi.paper_id)
        into v_matched_papers
        from public.paper_identifiers pi
        join jsonb_to_recordset(v_req) as req(
            identifier_type text,
            normalized_value text
        )
          on pi.identifier_type = req.identifier_type
         and pi.normalized_value = req.normalized_value
        where pi.owner_id = v_owner_id;

        if v_matched_papers <> array[v_paper_id] then
            raise exception 'RG_ALIAS_CONFLICT: identifiers resolve to multiple papers (%)',
                coalesce(array_to_string(v_matched_papers, ','), '')
                using errcode = 'P0409';
        end if;

        if jsonb_array_length(v_arxiv_versions) > 0 then
            update public.papers p
            set metadata = jsonb_set(
                coalesce(p.metadata, '{}'::jsonb),
                '{arxiv_versions}',
                (
                    select jsonb_agg(distinct val order by val)
                    from (
                        select jsonb_array_elements_text(coalesce(p.metadata->'arxiv_versions', '[]'::jsonb)) as val
                        union
                        select jsonb_array_elements_text(v_arxiv_versions) as val
                    ) merged
                ),
                true
            )
            where p.owner_id = v_owner_id
              and p.id = v_paper_id;
        end if;
    end if;

    return jsonb_build_object(
        'paper_id', v_paper_id::text,
        'created', v_created
    );
end;
$function$;

revoke all on function public.resolve_or_create_paper(jsonb, jsonb) from public, anon;
grant execute on function public.resolve_or_create_paper(jsonb, jsonb) to authenticated;

commit;
