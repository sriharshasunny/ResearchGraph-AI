"""Pure, deterministic identifier normalization, UUID detection, and metadata extraction."""
from __future__ import annotations

from dataclasses import dataclass
import re
from typing import Any, Literal
from urllib.parse import unquote, urlparse
import uuid

IdentifierType = Literal["doi", "openalex", "arxiv", "pmid", "pmcid", "isbn", "other"]

SUPPORTED_IDENTIFIER_TYPES: tuple[IdentifierType, ...] = (
    "doi",
    "openalex",
    "arxiv",
    "pmid",
    "pmcid",
    "isbn",
    "other",
)

MAX_IDENTIFIER_LENGTH = 1000

_UUID_RE = re.compile(
    r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
)
_DOI_PREFIX_RE = re.compile(r"^doi:\s*", re.IGNORECASE)
_DOI_RE = re.compile(r"^10\.\d{4,9}/\S+$")
_OPENALEX_ID_RE = re.compile(r"^W(\d+)$", re.IGNORECASE)
_ARXIV_PREFIX_RE = re.compile(r"^arxiv:\s*", re.IGNORECASE)
_ARXIV_MODERN_RE = re.compile(r"^(\d{4}\.\d{4,5})(?:v([1-9]\d*))?$")
_ARXIV_LEGACY_RE = re.compile(
    r"^([a-z]+(?:-[a-z]+)*(?:\.[a-z-]+)?/\d{7})(?:v([1-9]\d*))?$",
    re.IGNORECASE,
)
_PMID_PREFIX_RE = re.compile(r"^pmid:\s*", re.IGNORECASE)
_PMID_DIGITS_RE = re.compile(r"^[1-9]\d{0,15}$")
_PMCID_PREFIX_RE = re.compile(r"^(?:pmcid|pmc):\s*", re.IGNORECASE)
_PMCID_RE = re.compile(r"^PMC([1-9]\d*)$", re.IGNORECASE)
_ISBN_PREFIX_RE = re.compile(r"^isbn(?:-?(?:10|13))?:\s*", re.IGNORECASE)
_ISBN10_RE = re.compile(r"^\d{9}[\dX]$")
_ISBN13_RE = re.compile(r"^(?:978|979)\d{10}$")

_DOI_RESOLVER_HOSTS = {"doi.org", "www.doi.org", "dx.doi.org"}
_OPENALEX_HOSTS = {"openalex.org", "www.openalex.org", "api.openalex.org"}
_ARXIV_HOSTS = {"arxiv.org", "www.arxiv.org", "export.arxiv.org"}
_PUBMED_HOSTS = {"pubmed.ncbi.nlm.nih.gov", "ncbi.nlm.nih.gov", "www.ncbi.nlm.nih.gov"}
_PMC_HOSTS = {"pmc.ncbi.nlm.nih.gov", "ncbi.nlm.nih.gov", "www.ncbi.nlm.nih.gov"}


class InvalidIdentifierError(ValueError):
    """Raised when an external identifier or UUID fails validation."""


@dataclass(frozen=True, slots=True)
class NormalizedIdentifier:
    identifier_type: IdentifierType
    original_value: str
    normalized_value: str


@dataclass(frozen=True, slots=True)
class ParsedIdentifier:
    kind: Literal["internal_uuid", "external"]
    uuid_value: str | None = None
    identifier: NormalizedIdentifier | None = None


def _clean_raw(raw_value: str) -> str:
    if not isinstance(raw_value, str):
        raise InvalidIdentifierError("Identifier value must be a string.")
    trimmed = raw_value.strip()
    if not trimmed or len(trimmed) > MAX_IDENTIFIER_LENGTH:
        raise InvalidIdentifierError(
            f"Identifier must be between 1 and {MAX_IDENTIFIER_LENGTH} non-whitespace characters."
        )
    if any(ord(ch) < 32 or ord(ch) == 127 for ch in trimmed):
        raise InvalidIdentifierError("Identifier must not contain control characters.")
    return trimmed


def is_valid_uuid(value: str) -> bool:
    """Return True strictly for canonical hyphenated UUID strings (any UUID version)."""
    if not isinstance(value, str):
        return False
    trimmed = value.strip()
    if not _UUID_RE.fullmatch(trimmed):
        return False
    try:
        parsed = uuid.UUID(trimmed)
    except ValueError:
        return False
    return str(parsed).lower() == trimmed.lower()


def normalize_uuid(value: str) -> str:
    """Validate a canonical UUID string and return its lowercase representation."""
    if not is_valid_uuid(value):
        raise InvalidIdentifierError("Value is not a valid canonical UUID.")
    return str(uuid.UUID(value.strip())).lower()


def normalize_doi(raw_value: str) -> NormalizedIdentifier:
    trimmed = _clean_raw(raw_value)
    candidate = _DOI_PREFIX_RE.sub("", trimmed).strip()

    parsed = urlparse(candidate)
    if parsed.scheme or parsed.netloc:
        host = (parsed.hostname or "").lower()
        if parsed.scheme not in {"http", "https"} or host not in _DOI_RESOLVER_HOSTS:
            raise InvalidIdentifierError("Unsupported DOI resolver URL.")
        candidate = parsed.path.lstrip("/")
        if parsed.query or parsed.fragment:
            raise InvalidIdentifierError("DOI URL must not contain query or fragment parts.")

    candidate = unquote(candidate).strip()
    if any(ch.isspace() or ord(ch) < 32 or ord(ch) == 127 for ch in candidate):
        raise InvalidIdentifierError("DOI must not contain whitespace or control characters.")
    if "#" in candidate or "?" in candidate:
        raise InvalidIdentifierError("DOI must not contain query or fragment delimiters.")

    normalized = candidate.lower()
    if not _DOI_RE.fullmatch(normalized):
        raise InvalidIdentifierError("Value is not a valid DOI.")

    return NormalizedIdentifier(
        identifier_type="doi",
        original_value=trimmed,
        normalized_value=normalized,
    )


def normalize_openalex(raw_value: str) -> NormalizedIdentifier:
    trimmed = _clean_raw(raw_value)
    candidate = trimmed

    parsed = urlparse(trimmed)
    if parsed.scheme or parsed.netloc:
        host = (parsed.hostname or "").lower()
        if parsed.scheme not in {"http", "https"} or host not in _OPENALEX_HOSTS:
            raise InvalidIdentifierError("Unsupported OpenAlex host.")
        if parsed.query or parsed.fragment:
            raise InvalidIdentifierError("OpenAlex URL must not contain query or fragment parts.")
        path = parsed.path.strip("/")
        if host == "api.openalex.org" and path.lower().startswith("works/"):
            candidate = path[len("works/"):]
        else:
            candidate = path

    match = _OPENALEX_ID_RE.fullmatch(candidate)
    if not match:
        raise InvalidIdentifierError("Value is not a valid OpenAlex Work ID.")

    return NormalizedIdentifier(
        identifier_type="openalex",
        original_value=trimmed,
        normalized_value=f"W{match.group(1)}",
    )


def normalize_arxiv(raw_value: str) -> NormalizedIdentifier:
    trimmed = _clean_raw(raw_value)
    candidate = _ARXIV_PREFIX_RE.sub("", trimmed).strip()

    parsed = urlparse(candidate)
    if parsed.scheme or parsed.netloc:
        host = (parsed.hostname or "").lower()
        if parsed.scheme not in {"http", "https"} or host not in _ARXIV_HOSTS:
            raise InvalidIdentifierError("Unsupported arXiv host.")
        if parsed.query or parsed.fragment:
            raise InvalidIdentifierError("arXiv URL must not contain query or fragment parts.")
        path = parsed.path.strip("/")
        if path.lower().startswith("abs/"):
            candidate = path[4:]
        elif path.lower().startswith("pdf/"):
            candidate = path[4:]
            if candidate.lower().endswith(".pdf"):
                candidate = candidate[:-4]
        else:
            raise InvalidIdentifierError("arXiv URL path must start with /abs/ or /pdf/.")
    elif candidate.lower().endswith(".pdf"):
        candidate = candidate[:-4]

    modern = _ARXIV_MODERN_RE.fullmatch(candidate)
    if modern:
        return NormalizedIdentifier(
            identifier_type="arxiv",
            original_value=trimmed,
            normalized_value=modern.group(1),
        )

    legacy = _ARXIV_LEGACY_RE.fullmatch(candidate)
    if legacy:
        return NormalizedIdentifier(
            identifier_type="arxiv",
            original_value=trimmed,
            normalized_value=legacy.group(1).lower(),
        )

    raise InvalidIdentifierError("Value is not a valid arXiv identifier.")


def normalize_pmid(raw_value: str) -> NormalizedIdentifier:
    trimmed = _clean_raw(raw_value)
    candidate = _PMID_PREFIX_RE.sub("", trimmed).strip()

    parsed = urlparse(candidate)
    if parsed.scheme or parsed.netloc:
        host = (parsed.hostname or "").lower()
        if parsed.scheme not in {"http", "https"} or host not in _PUBMED_HOSTS:
            raise InvalidIdentifierError("Unsupported PubMed host.")
        if parsed.query or parsed.fragment:
            raise InvalidIdentifierError("PubMed URL must not contain query or fragment parts.")
        path = parsed.path.strip("/")
        if host in {"ncbi.nlm.nih.gov", "www.ncbi.nlm.nih.gov"}:
            if not path.lower().startswith("pubmed/"):
                raise InvalidIdentifierError("PubMed URL path must start with /pubmed/.")
            candidate = path[len("pubmed/"):]
        else:
            candidate = path

    if not _PMID_DIGITS_RE.fullmatch(candidate):
        raise InvalidIdentifierError("Value is not a valid numeric PMID.")

    return NormalizedIdentifier(
        identifier_type="pmid",
        original_value=trimmed,
        normalized_value=candidate,
    )


def normalize_pmcid(raw_value: str) -> NormalizedIdentifier:
    trimmed = _clean_raw(raw_value)
    candidate = _PMCID_PREFIX_RE.sub("", trimmed).strip()

    parsed = urlparse(candidate)
    if parsed.scheme or parsed.netloc:
        host = (parsed.hostname or "").lower()
        if parsed.scheme not in {"http", "https"} or host not in _PMC_HOSTS:
            raise InvalidIdentifierError("Unsupported PMC host.")
        if parsed.query or parsed.fragment:
            raise InvalidIdentifierError("PMC URL must not contain query or fragment parts.")
        path = parsed.path.strip("/")
        if host in {"ncbi.nlm.nih.gov", "www.ncbi.nlm.nih.gov"}:
            if not path.lower().startswith("pmc/articles/"):
                raise InvalidIdentifierError("PMC URL path must start with /pmc/articles/.")
            candidate = path[len("pmc/articles/"):]
        else:
            if not path.lower().startswith("articles/"):
                raise InvalidIdentifierError("PMC URL path must start with /articles/.")
            candidate = path[len("articles/"):]
        candidate = candidate.rstrip("/")

    match = _PMCID_RE.fullmatch(candidate)
    if not match:
        raise InvalidIdentifierError("Value is not a valid PMCID.")

    return NormalizedIdentifier(
        identifier_type="pmcid",
        original_value=trimmed,
        normalized_value=f"PMC{match.group(1)}",
    )


def _isbn10_to_isbn13(isbn10: str) -> str:
    core = f"978{isbn10[:9]}"
    total = sum((1 if idx % 2 == 0 else 3) * int(ch) for idx, ch in enumerate(core))
    check = (10 - (total % 10)) % 10
    return f"{core}{check}"


def _is_valid_isbn10(isbn10: str) -> bool:
    if not _ISBN10_RE.fullmatch(isbn10):
        return False
    total = sum(
        (10 - idx) * (10 if ch == "X" else int(ch))
        for idx, ch in enumerate(isbn10)
    )
    return total % 11 == 0


def _is_valid_isbn13(isbn13: str) -> bool:
    if not _ISBN13_RE.fullmatch(isbn13):
        return False
    total = sum((1 if idx % 2 == 0 else 3) * int(ch) for idx, ch in enumerate(isbn13))
    return total % 10 == 0


def normalize_isbn(raw_value: str) -> NormalizedIdentifier:
    trimmed = _clean_raw(raw_value)
    candidate = _ISBN_PREFIX_RE.sub("", trimmed).strip()
    compact = re.sub(r"[-\s]+", "", candidate).upper()

    if len(compact) == 10 and _is_valid_isbn10(compact):
        normalized = _isbn10_to_isbn13(compact)
    elif len(compact) == 13 and _is_valid_isbn13(compact):
        normalized = compact
    else:
        raise InvalidIdentifierError("Value is not a valid ISBN-10 or ISBN-13.")

    return NormalizedIdentifier(
        identifier_type="isbn",
        original_value=trimmed,
        normalized_value=normalized,
    )


def normalize_other(raw_value: str) -> NormalizedIdentifier:
    trimmed = _clean_raw(raw_value)
    return NormalizedIdentifier(
        identifier_type="other",
        original_value=trimmed,
        normalized_value=trimmed,
    )


_TYPED_NORMALIZERS = {
    "doi": normalize_doi,
    "openalex": normalize_openalex,
    "arxiv": normalize_arxiv,
    "pmid": normalize_pmid,
    "pmcid": normalize_pmcid,
    "isbn": normalize_isbn,
    "other": normalize_other,
}


def normalize_identifier(identifier_type: str, raw_value: str) -> NormalizedIdentifier:
    normalizer = _TYPED_NORMALIZERS.get(identifier_type)
    if normalizer is None:
        raise InvalidIdentifierError(f"Unsupported identifier type: {identifier_type!r}.")
    return normalizer(raw_value)


def parse_external_identifier(raw_value: str) -> ParsedIdentifier:
    """Classify an untyped input without guessing ambiguous numeric IDs or falling back to 'other'."""
    trimmed = _clean_raw(raw_value)

    if is_valid_uuid(trimmed):
        return ParsedIdentifier(kind="internal_uuid", uuid_value=normalize_uuid(trimmed))

    lowered = trimmed.lower()

    # Explicitly prefixed or URL forms are unambiguous.
    if lowered.startswith("isbn") or _ISBN_PREFIX_RE.match(trimmed):
        return ParsedIdentifier(kind="external", identifier=normalize_isbn(trimmed))
    if lowered.startswith("pmid:"):
        return ParsedIdentifier(kind="external", identifier=normalize_pmid(trimmed))
    if lowered.startswith(("pmc:", "pmcid:")) or _PMCID_RE.fullmatch(trimmed):
        return ParsedIdentifier(kind="external", identifier=normalize_pmcid(trimmed))
    if lowered.startswith("doi:") or lowered.startswith("10."):
        return ParsedIdentifier(kind="external", identifier=normalize_doi(trimmed))
    if lowered.startswith("arxiv:"):
        return ParsedIdentifier(kind="external", identifier=normalize_arxiv(trimmed))
    if _OPENALEX_ID_RE.fullmatch(trimmed):
        return ParsedIdentifier(kind="external", identifier=normalize_openalex(trimmed))

    parsed = urlparse(trimmed)
    if parsed.scheme or parsed.netloc:
        host = (parsed.hostname or "").lower()
        if host in _DOI_RESOLVER_HOSTS:
            return ParsedIdentifier(kind="external", identifier=normalize_doi(trimmed))
        if host in _OPENALEX_HOSTS:
            return ParsedIdentifier(kind="external", identifier=normalize_openalex(trimmed))
        if host in _ARXIV_HOSTS:
            return ParsedIdentifier(kind="external", identifier=normalize_arxiv(trimmed))
        if host in _PUBMED_HOSTS and (host == "pubmed.ncbi.nlm.nih.gov" or parsed.path.lower().startswith("/pubmed/")):
            return ParsedIdentifier(kind="external", identifier=normalize_pmid(trimmed))
        if host in _PMC_HOSTS:
            return ParsedIdentifier(kind="external", identifier=normalize_pmcid(trimmed))
        raise InvalidIdentifierError("Unrecognized external identifier URL host.")

    # Reject bare numeric PMID/ISBN or dashed ISBN without prefix to avoid guessing.
    if re.fullmatch(r"\d+", trimmed):
        raise InvalidIdentifierError(
            "Bare numeric identifier is ambiguous; specify identifier_type explicitly."
        )
    if _ARXIV_MODERN_RE.fullmatch(trimmed) or _ARXIV_LEGACY_RE.fullmatch(trimmed):
        return ParsedIdentifier(kind="external", identifier=normalize_arxiv(trimmed))

    raise InvalidIdentifierError(
        "Could not unambiguously classify identifier; specify identifier_type explicitly."
    )


def _dedupe_and_sort_identifiers(
    candidates: list[NormalizedIdentifier],
) -> list[NormalizedIdentifier]:
    order = {id_type: idx for idx, id_type in enumerate(SUPPORTED_IDENTIFIER_TYPES)}
    unique: dict[tuple[IdentifierType, str], NormalizedIdentifier] = {}
    for candidate in candidates:
        key = (candidate.identifier_type, candidate.normalized_value)
        if key not in unique:
            unique[key] = candidate
    return sorted(
        unique.values(),
        key=lambda item: (order[item.identifier_type], item.normalized_value),
    )


def extract_identifiers_from_openalex(work: dict[str, Any]) -> list[NormalizedIdentifier]:
    """Extract only explicit identifiers present in an OpenAlex work or normalized OpenAlex metadata."""
    if not isinstance(work, dict):
        return []

    candidates: list[NormalizedIdentifier] = []

    def _try_add(id_type: IdentifierType, value: Any) -> None:
        if not isinstance(value, str) or not value.strip():
            return
        try:
            candidates.append(normalize_identifier(id_type, value))
        except InvalidIdentifierError:
            return

    _try_add("openalex", work.get("id"))
    _try_add("doi", work.get("doi"))

    ids_map = work.get("ids")
    if isinstance(ids_map, dict):
        for id_type in ("openalex", "doi", "pmid", "pmcid"):
            _try_add(id_type, ids_map.get(id_type))

    _try_add("pmid", work.get("pmid"))
    _try_add("pmcid", work.get("pmcid"))
    _try_add("arxiv", work.get("arxiv_id"))

    return _dedupe_and_sort_identifiers(candidates)


def extract_identifiers_from_arxiv(record: dict[str, Any]) -> list[NormalizedIdentifier]:
    """Extract only explicit identifiers present in an arXiv metadata record."""
    if not isinstance(record, dict):
        return []

    candidates: list[NormalizedIdentifier] = []

    def _try_add(id_type: IdentifierType, value: Any) -> None:
        if not isinstance(value, str) or not value.strip():
            return
        try:
            candidates.append(normalize_identifier(id_type, value))
        except InvalidIdentifierError:
            return

    _try_add("arxiv", record.get("id"))
    _try_add("arxiv", record.get("arxiv_id"))
    _try_add("arxiv", record.get("source_url"))
    _try_add("doi", record.get("doi"))

    return _dedupe_and_sort_identifiers(candidates)


def extract_metadata_identifiers(metadata: dict[str, Any]) -> list[NormalizedIdentifier]:
    """Deterministically extract identifier candidates from supported OpenAlex or arXiv metadata."""
    if not isinstance(metadata, dict):
        return []

    source = str(metadata.get("source") or "").strip().lower()
    if source == "arxiv":
        return extract_identifiers_from_arxiv(metadata)
    if source == "openalex":
        return extract_identifiers_from_openalex(metadata)

    # Support raw OpenAlex payloads that lack the normalized "source" field.
    candidates = extract_identifiers_from_openalex(metadata)
    raw_id = metadata.get("id")
    if isinstance(raw_id, str) and raw_id.strip():
        try:
            candidates.append(normalize_arxiv(raw_id))
        except InvalidIdentifierError:
            pass
    return _dedupe_and_sort_identifiers(candidates)
