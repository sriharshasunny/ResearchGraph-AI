"""Unit tests for pure identifier normalization, UUID classification, and metadata extraction."""
from __future__ import annotations

import pytest

from backend import identifiers
from backend.identifiers import (
    InvalidIdentifierError,
    NormalizedIdentifier,
    ParsedIdentifier,
    extract_identifiers_from_arxiv,
    extract_identifiers_from_openalex,
    extract_metadata_identifiers,
    is_valid_uuid,
    normalize_arxiv,
    normalize_doi,
    normalize_identifier,
    normalize_isbn,
    normalize_openalex,
    normalize_other,
    normalize_pmcid,
    normalize_pmid,
    normalize_uuid,
    parse_external_identifier,
)


@pytest.mark.parametrize(
    "raw",
    [
        "10.1234/example",
        "  10.1234/EXAMPLE  ",
        "doi:10.1234/Example",
        "DOI: 10.1234/example",
        "https://doi.org/10.1234/Example",
        "http://dx.doi.org/10.1234/example",
        "https://doi.org/10.1234%2Fexample",
    ],
)
def test_doi_normalization_unifies_prefixes_urls_and_case(raw):
    res = normalize_doi(raw)
    assert res == NormalizedIdentifier("doi", raw.strip(), "10.1234/example")
    # Idempotence
    assert normalize_doi(res.normalized_value).normalized_value == res.normalized_value


@pytest.mark.parametrize(
    "raw",
    [
        "",
        "   ",
        "10.123/short-prefix",
        "10.1234/",
        "10.1234",
        "https://example.org/10.1234/example",
        "https://doi.org/10.1234/example?foo=bar",
        "10.1234/has space",
        "10.1234/frag#x",
        "10.1234/ctrl\x00char",
    ],
)
def test_doi_rejects_invalid_values(raw):
    with pytest.raises(InvalidIdentifierError):
        normalize_doi(raw)


@pytest.mark.parametrize(
    "raw",
    [
        "W2626778328",
        "w2626778328",
        "  https://openalex.org/W2626778328 ",
        "http://openalex.org/w2626778328/",
        "https://api.openalex.org/works/W2626778328",
    ],
)
def test_openalex_normalization_equates_ids_and_urls(raw):
    res = normalize_openalex(raw)
    assert res == NormalizedIdentifier("openalex", raw.strip(), "W2626778328")
    assert normalize_openalex(res.normalized_value).normalized_value == "W2626778328"


@pytest.mark.parametrize(
    "raw",
    [
        "",
        "A2626778328",
        "W",
        "W123abc",
        "https://evil.example/W2626778328",
        "https://openalex.org/W2626778328?select=id",
        "https://openalex.org/authors/A123",
    ],
)
def test_openalex_rejects_invalid_hosts_and_values(raw):
    with pytest.raises(InvalidIdentifierError):
        normalize_openalex(raw)


@pytest.mark.parametrize(
    ("raw", "expected_norm"),
    [
        ("1706.03762", "1706.03762"),
        ("1706.03762v5", "1706.03762"),
        ("1706.03762v7", "1706.03762"),
        ("arXiv:1706.03762v7", "1706.03762"),
        ("https://arxiv.org/abs/1706.03762", "1706.03762"),
        ("https://arxiv.org/pdf/1706.03762v3.pdf", "1706.03762"),
        ("hep-th/9901001", "hep-th/9901001"),
        ("math.AG/9901001v2", "math.ag/9901001"),
        ("nlin.CD/0501001", "nlin.cd/0501001"),
        ("https://arxiv.org/abs/math.AG/9901001v2", "math.ag/9901001"),
    ],
)
def test_arxiv_normalizes_modern_and_legacy_ids_and_strips_version(raw, expected_norm):
    res = normalize_arxiv(raw)
    assert res.identifier_type == "arxiv"
    assert res.original_value == raw.strip()
    assert res.normalized_value == expected_norm
    assert normalize_arxiv(res.normalized_value).normalized_value == expected_norm


@pytest.mark.parametrize(
    "raw",
    [
        "",
        "1706.03762v0",
        "1706.03762v",
        "1706.123",
        "1706.123456",
        "hep-th/9901001v0",
        "https://evil.org/abs/1706.03762",
        "https://arxiv.org/html/1706.03762",
        "https://arxiv.org/abs/1706.03762?foo=1",
    ],
)
def test_arxiv_rejects_invalid_ids_hosts_and_versions(raw):
    with pytest.raises(InvalidIdentifierError):
        normalize_arxiv(raw)


@pytest.mark.parametrize(
    "raw",
    [
        "31452104",
        "PMID:31452104",
        "pmid: 31452104",
        "https://pubmed.ncbi.nlm.nih.gov/31452104/",
        "https://www.ncbi.nlm.nih.gov/pubmed/31452104",
    ],
)
def test_pmid_formats_and_urls(raw):
    res = normalize_pmid(raw)
    assert res == NormalizedIdentifier("pmid", raw.strip(), "31452104")


@pytest.mark.parametrize(
    "raw",
    ["0", "-5", "abc", "https://example.org/31452104", "https://pubmed.ncbi.nlm.nih.gov/31452104/?x=1"],
)
def test_pmid_rejects_invalid_values(raw):
    with pytest.raises(InvalidIdentifierError):
        normalize_pmid(raw)


@pytest.mark.parametrize(
    "raw",
    [
        "PMC6712345",
        "pmc6712345",
        "pmcid: PMC6712345",
        "https://pmc.ncbi.nlm.nih.gov/articles/PMC6712345/",
        "https://www.ncbi.nlm.nih.gov/pmc/articles/pmc6712345",
    ],
)
def test_pmcid_variants(raw):
    res = normalize_pmcid(raw)
    assert res == NormalizedIdentifier("pmcid", raw.strip(), "PMC6712345")


@pytest.mark.parametrize(
    "raw",
    ["PMC0", "6712345", "https://pmc.ncbi.nlm.nih.gov/PMC6712345", "PMC12AB"],
)
def test_pmcid_rejects_invalid_values(raw):
    with pytest.raises(InvalidIdentifierError):
        normalize_pmcid(raw)


def test_isbn10_and_isbn13_normalization_and_equivalence():
    isbn10 = normalize_isbn("0-306-40615-2")
    isbn13 = normalize_isbn("978-0-306-40615-7")
    assert isbn10.normalized_value == "9780306406157"
    assert isbn10.original_value == "0-306-40615-2"
    assert isbn13.normalized_value == "9780306406157"

    trailing_x = normalize_isbn("ISBN: 0-8044-2957-X")
    assert trailing_x.normalized_value == "9780804429573"
    assert trailing_x.original_value == "ISBN: 0-8044-2957-X"
    assert normalize_isbn("isbn:080442957x").normalized_value == "9780804429573"


@pytest.mark.parametrize(
    "raw",
    [
        "",
        "0-306-40615-9",  # bad ISBN-10 check digit
        "978-0-306-40615-0",  # bad ISBN-13 check digit
        "977-0-306-40615-7",  # invalid prefix
        "123456789",
    ],
)
def test_isbn_rejects_invalid_checksums(raw):
    with pytest.raises(InvalidIdentifierError):
        normalize_isbn(raw)


def test_other_is_conservative_and_explicit_only():
    res = normalize_other("  Lab-Corpus-ID:Alpha_42  ")
    assert res == NormalizedIdentifier("other", "Lab-Corpus-ID:Alpha_42", "Lab-Corpus-ID:Alpha_42")
    with pytest.raises(InvalidIdentifierError):
        normalize_other("   ")
    with pytest.raises(InvalidIdentifierError):
        normalize_other("x" * 1001)
    with pytest.raises(InvalidIdentifierError):
        normalize_other("bad\nvalue")
    with pytest.raises(InvalidIdentifierError):
        normalize_identifier("unknown_type", "abc")


def test_uuid_detection_accepts_all_canonical_versions_and_rejects_non_uuids():
    assert is_valid_uuid("00000000-0000-4000-8000-000000000001")
    assert is_valid_uuid("A1B2C3D4-E5F6-11D1-9000-000000000123")  # v1 uppercase
    assert is_valid_uuid("01936B2C-1234-7000-8000-000000000001")  # v7 mixed
    assert normalize_uuid("A1B2C3D4-E5F6-11D1-9000-000000000123") == "a1b2c3d4-e5f6-11d1-9000-000000000123"

    for non_uuid in [
        "00000000000040008000000000000001",  # unhyphenated
        "{00000000-0000-4000-8000-000000000001}",
        "urn:uuid:00000000-0000-4000-8000-000000000001",
        "W2626778328",
        "10.1234/example",
        "1706.03762",
        "not-a-uuid",
    ]:
        assert not is_valid_uuid(non_uuid)


def test_parse_external_identifier_avoids_ambiguous_guessing_and_other_fallback():
    assert parse_external_identifier("A1B2C3D4-E5F6-4000-8000-000000000123") == ParsedIdentifier(
        kind="internal_uuid",
        uuid_value="a1b2c3d4-e5f6-4000-8000-000000000123",
    )
    assert parse_external_identifier("https://doi.org/10.1234/ABC").identifier == NormalizedIdentifier(
        "doi", "https://doi.org/10.1234/ABC", "10.1234/abc"
    )
    assert parse_external_identifier("W2626778328").identifier == NormalizedIdentifier(
        "openalex", "W2626778328", "W2626778328"
    )
    assert parse_external_identifier("1706.03762v7").identifier == NormalizedIdentifier(
        "arxiv", "1706.03762v7", "1706.03762"
    )
    assert parse_external_identifier("PMC6712345").identifier == NormalizedIdentifier(
        "pmcid", "PMC6712345", "PMC6712345"
    )
    assert parse_external_identifier("PMID:31452104").identifier == NormalizedIdentifier(
        "pmid", "PMID:31452104", "31452104"
    )
    assert parse_external_identifier("ISBN:0-306-40615-2").identifier == NormalizedIdentifier(
        "isbn", "ISBN:0-306-40615-2", "9780306406157"
    )

    for ambiguous_or_unknown in ["31452104", "9780306406157", "opaque-local-id", "https://example.org/paper"]:
        with pytest.raises(InvalidIdentifierError):
            parse_external_identifier(ambiguous_or_unknown)


def test_metadata_extraction_is_pure_deduplicated_and_never_invents_aliases():
    openalex_work = {
        "id": "https://openalex.org/W2626778328",
        "doi": "https://doi.org/10.48550/arXiv.1706.03762",
        "source": "OpenAlex",
        "ids": {
            "openalex": "https://openalex.org/W2626778328",
            "doi": "10.48550/ARXIV.1706.03762",
            "pmid": "https://pubmed.ncbi.nlm.nih.gov/31452104/",
            "pmcid": "pmc6712345",
        },
        "title": "Attention Is All You Need",
    }
    extracted = extract_metadata_identifiers(openalex_work)
    assert extracted == [
        NormalizedIdentifier("doi", "https://doi.org/10.48550/arXiv.1706.03762", "10.48550/arxiv.1706.03762"),
        NormalizedIdentifier("openalex", "https://openalex.org/W2626778328", "W2626778328"),
        NormalizedIdentifier("pmid", "https://pubmed.ncbi.nlm.nih.gov/31452104/", "31452104"),
        NormalizedIdentifier("pmcid", "pmc6712345", "PMC6712345"),
    ]
    # Must NOT invent an arxiv alias from DOI string
    assert all(item.identifier_type != "arxiv" for item in extracted)
    # Deterministic on repeated calls
    assert extract_identifiers_from_openalex(openalex_work) == extracted

    arxiv_record = {
        "id": "arxiv:1706.03762v7",
        "source": "arXiv",
        "source_url": "https://arxiv.org/abs/1706.03762v7",
        "doi": None,
    }
    assert extract_identifiers_from_arxiv(arxiv_record) == [
        NormalizedIdentifier("arxiv", "arxiv:1706.03762v7", "1706.03762")
    ]
    assert extract_metadata_identifiers(arxiv_record) == [
        NormalizedIdentifier("arxiv", "arxiv:1706.03762v7", "1706.03762")
    ]
    assert identifiers.SUPPORTED_IDENTIFIER_TYPES == ("doi", "openalex", "arxiv", "pmid", "pmcid", "isbn", "other")
