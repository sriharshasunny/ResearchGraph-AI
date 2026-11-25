# Unified Research Data Model

Status: Step 1 implementation contract  
Migration: `supabase/migrations/20261125224000_unified_research_data_model.sql`

## 1. Architecture decision

ResearchGraph AI uses one logical research infrastructure per authenticated user:

- Supabase Postgres is the source of truth for users' workspaces, paper records, external identifiers, workspace membership, paper assets, and ingestion status.
- ChromaDB stores text chunks and embeddings. Workspace membership is not copied into chunk metadata; it is resolved from Postgres at query time.
- Neo4j stores a user-scoped research graph. Canonical entities can be shared by that user's papers, while every extracted claim keeps its own paper and chunk provenance.
- A workspace is a retrieval boundary, not a physically separate vector database or graph database.

A paper may belong to several workspaces. Combining workspaces means taking the distinct union of their authorized paper IDs. Removing a workspace changes the allowed paper set; it does not delete vectors, entities, or claims.

## 2. Supabase tables

### workspaces

One row per user-owned research workspace.

- `id`: internal UUID primary key.
- `owner_id`: Supabase Auth user UUID.
- `name`, `description`: user-visible workspace fields.
- `archived_at`: optional archive marker. Archiving does not delete papers.

### papers

One canonical paper record per user.

- `id`: internal UUID. This is the permanent ResearchGraph AI paper ID.
- `owner_id`: owner from the verified Supabase identity.
- `title`, `abstract`, `publication_year`, `venue`: bibliographic data.
- `source_provider`: openalex, arxiv, crossref, manual_upload, or other.
- `source_url`, `pdf_url`, `open_access`, `access_type`: source/access metadata.
- `metadata`: provider-specific JSON object.

Do not use an OpenAlex ID, arXiv ID, DOI, title, or URL as the internal primary key.

### paper_identifiers

External identifiers are aliases for a canonical paper record.

- Supported initial types: doi, openalex, arxiv, pmid, pmcid, isbn, other.
- `normalized_value` is used for matching and is unique per owner and identifier type.
- Keep `original_value` for the exact source representation.

When an identifier already belongs to a paper owned by the user, reuse that paper row and add a workspace membership. Do not create a duplicate paper or duplicate vector index merely because the same paper was discovered through another provider.

Suggested normalization:
- DOI: lowercase, trim whitespace, remove a leading `https://doi.org/` or `doi:`.
- OpenAlex: store the canonical OpenAlex work ID in a consistent lowercase form.
- arXiv: remove an optional `arxiv:` prefix and normalize the version policy consistently. Preserve the original source value.

Normalization and identifier resolution must be implemented and tested in the ingestion service; the database stores the normalized value supplied by that service.

### workspace_papers

Many-to-many mapping between papers and workspaces.

The composite foreign keys include `owner_id` on both sides. This prevents a row from connecting a workspace belonging to one user to a paper belonging to another user.

The primary key `(workspace_id, paper_id)` prevents duplicate membership.

### paper_assets

Metadata for original PDFs and supplementary files. The file itself belongs in a private Supabase Storage bucket; this table stores the bucket/path, filename, content type, size, checksum, and version.

The migration does not create the Storage bucket or its object-level policies. Private upload must remain disabled until those are configured and tested.

### paper_ingestion_status

One durable current status snapshot per owner and paper. It replaces the current local SQLite status record in a later backend step. It includes processing stage, attempts, chunk/entity/claim counts, vector/graph readiness, error, and timestamps.

## 3. Ownership and security rules

1. Supabase Auth identifies the user. The backend must verify the incoming access token.
2. The backend derives `owner_id` from the verified JWT. Never trust a client-supplied owner/user ID.
3. RLS is enabled on all six tables. Authenticated users can access only rows where `owner_id = auth.uid()`.
4. Composite foreign keys ensure that workspace membership, identifiers, assets, and ingestion status cannot cross owners.
5. Backend routes must still validate workspace ownership and paper membership. RLS is not a substitute for API authorization.
6. Never query ChromaDB or Neo4j with an unrestricted fallback when a workspace selection is empty.

## 4. ChromaDB metadata contract

Each indexed chunk uses a stable chunk ID and scalar metadata:

| Field | Meaning |
|---|---|
| user_id | Authenticated owner UUID, stored as a string |
| paper_id | Internal Supabase paper UUID, stored as a string |
| chunk_id | Stable chunk UUID/hash |
| asset_id | Source paper asset UUID, when a PDF asset exists |
| page | Source page number |
| section | Detected document section |
| chunk_index | Chunk order within the source asset |
| source_provider | openalex, arxiv, crossref, manual_upload, or other |
| access_type | open_access_pdf, abstract_only, metadata_only, private_upload, or unknown |
| doi | DOI string when available |

Do not put `workspace_id` or a mutable array of workspace IDs in Chroma metadata. The same paper can be in multiple workspaces, and membership can change without re-embedding.

At retrieval time:
1. Verify the selected workspace IDs belong to the authenticated user.
2. Resolve the distinct paper UUIDs from `workspace_papers`.
3. If the allowed paper list is empty, return no evidence without querying Chroma.
4. Query with both an owner filter and the allowed paper IDs. Chroma filter shape:

```python
where = {
    "$and": [
        {"user_id": authenticated_user_id},
        {"paper_id": {"$in": allowed_paper_ids}},
    ]
}
```

Validate this filter against the deployed Chroma version during the retrieval implementation.

## 5. Neo4j graph contract

Use one logical graph, with owner-aware keys. A user's canonical entities can be reused by multiple papers belonging to that user, but must not be shared with another user's private graph.

### Nodes

- `ResearchPaper`: `paper_id`, `owner_id`, title, DOI/source metadata.
- `ResearchEntity`: `entity_id`, `owner_id`, canonical_name, entity_type, aliases, external_id (when available).
- `ResearchClaim`: `claim_id`, `owner_id`, `paper_id`, `chunk_id`, predicate, evidence_text, page, section, confidence, validation_status, polarity, attribution, extraction_version.

### Relationships

```text
(ResearchPaper)-[:HAS_CLAIM]->(ResearchClaim)
(ResearchClaim)-[:SUBJECT]->(ResearchEntity)
(ResearchClaim)-[:OBJECT]->(ResearchEntity)
```

The predicate is a property on ResearchClaim, not a dynamically interpolated Cypher relationship type. This keeps predicates and evidence separate and avoids unsafe dynamic relationship names.

Each claim is one paper-supported assertion. If two papers support the same fact, create two claims that point to the same canonical entity/entities. Do not combine their evidence into one claim.

Only accepted claims are eligible for normal GraphRAG retrieval. Pending and rejected claims may be retained for review/audit but must not be presented as verified graph facts.

Suggested attribution values include current_work, prior_work, and related_work. Suggested polarity values include positive, negative, and uncertain. These prevent a paper's discussion of previous work, negation, or speculation from being misrepresented as the paper's own result.

### Entity identity

Resolve entities in this order: trusted external identifier; normalized name plus entity type; known alias; semantic candidate search; LLM adjudication for ambiguous matches.

Semantic similarity finds candidates. It must not automatically merge entities. Different concepts such as BERT and Transformer remain separate entities even though they are related.

Construct entity keys within an owner namespace, for example by hashing owner UUID + entity type + canonical identifier/name. Never create a cross-user entity match.

## 6. Existing-data compatibility and migration

The current backend has legacy behavior that must not be mistaken for the new contract:

- Current paper IDs are provider IDs such as OpenAlex work IDs or arXiv IDs.
- The Chroma collection currently defaults to `researchgraph_public`; existing chunk metadata has `paper_id` but does not yet consistently have `user_id`.
- Neo4j currently stores direct Paper-to-entity relationships and uses globally unique entity keys.
- Ingestion status currently lives in a local SQLite file.
- The frontend currently saves selected/saved paper state in localStorage.

This migration creates the new Supabase application tables only. It deliberately does not delete, rewrite, or silently assign ownership to any existing Chroma vectors or Neo4j records.

During the later data-migration step:
1. Create internal paper UUIDs for papers that are deliberately adopted by a user.
2. Store each old provider ID as a row in paper_identifiers.
3. Establish workspace_papers membership explicitly.
4. Re-chunk/re-index under the new internal paper UUID and user_id metadata, or run a verified one-time metadata migration where the source ownership is known.
5. Build the claim-based Neo4j representation alongside the legacy representation, compare results, then switch reads.
6. Do not assign owner_id to legacy shared records unless the actual owner is known. Do not expose ownerless legacy records through authenticated workspace retrieval.

## 7. Migration application and verification

Apply the SQL migration to the intended Supabase project using the Supabase SQL Editor or the Supabase CLI migration workflow.

After applying, verify:
- All six tables exist.
- RLS is enabled on all six tables.
- Authenticated user A cannot select or mutate user B's rows.
- A paper can be linked to two workspaces belonging to the same owner.
- A paper cannot be linked to another owner's workspace.
- An external identifier cannot map to two papers for the same owner.
- Archiving a workspace does not delete its paper rows.
- Removing a workspace_papers row does not delete a paper or its assets.

The migration must be applied and these checks must pass before the API begins depending on the new tables.
