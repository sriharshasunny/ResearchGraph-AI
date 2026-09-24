from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import requests
from typing import List, Optional

app = FastAPI(title="ResearchGraph AI Backend")

# Allow CORS for local frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

OPENALEX_API_URL = "https://api.openalex.org/works"
SEMANTIC_SCHOLAR_API_URL = "https://api.semanticscholar.org/graph/v1/paper/search"

@app.get("/")
def read_root():
    return {"message": "Welcome to ResearchGraph AI Backend"}

@app.get("/api/search")
def search_papers(q: str = Query(..., description="Search query"), limit: int = 10):
    """
    Searches for papers using the OpenAlex API.
    """
    try:
        response = requests.get(
            OPENALEX_API_URL,
            params={
                "search": q,
                "per-page": limit,
                "sort": "cited_by_count:desc"
            }
        )
        response.raise_for_status()
        data = response.json()
        
        results = []
        for work in data.get("results", []):
            # Extract Authors
            authors = [
                author.get("author", {}).get("display_name")
                for author in work.get("authorships", [])
                if author.get("author", {}).get("display_name")
            ]
            
            # Extract Abstract (OpenAlex uses an inverted index which needs to be reconstructed, 
            # but sometimes it's empty. We'll simplify or use semantic scholar later)
            abstract_inverted = work.get("abstract_inverted_index")
            abstract = "Abstract not available."
            if abstract_inverted:
                # Reconstruct abstract from inverted index
                words = max([max(positions) for positions in abstract_inverted.values()]) + 1
                abstract_arr = [""] * words
                for word, positions in abstract_inverted.items():
                    for pos in positions:
                        abstract_arr[pos] = word
                abstract = " ".join(abstract_arr)
            
            # Check Open Access
            open_access = work.get("open_access", {}).get("is_oa", False)
            pdf_url = work.get("open_access", {}).get("oa_url")
            
            # Concepts/Topics
            concepts = [
                concept.get("display_name") 
                for concept in work.get("concepts", [])[:5]
            ]
            
            results.append({
                "id": work.get("id"),
                "title": work.get("title", "Untitled"),
                "authors": authors,
                "abstract": abstract,
                "publication_year": work.get("publication_year"),
                "doi": work.get("doi"),
                "source": "OpenAlex",
                "open_access": open_access,
                "pdf_url": pdf_url,
                "landing_page": work.get("id"),
                "cited_by_count": work.get("cited_by_count", 0),
                "topics": concepts
            })
            
        return {"papers": results}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/papers/{paper_id:path}")
def get_paper_details(paper_id: str):
    """
    Gets details for a specific paper from OpenAlex using its full ID.
    Example paper_id: https://openalex.org/W2103268463
    """
    try:
        # If the paper_id is already a URL, use it directly. Otherwise construct it.
        url = paper_id if paper_id.startswith("https://") else f"{OPENALEX_API_URL}/{paper_id}"
        response = requests.get(url)
        response.raise_for_status()
        work = response.json()
        
        authors = [
            author.get("author", {}).get("display_name")
            for author in work.get("authorships", [])
            if author.get("author", {}).get("display_name")
        ]
        
        abstract_inverted = work.get("abstract_inverted_index")
        abstract = "Abstract not available."
        if abstract_inverted:
            words = max([max(positions) for positions in abstract_inverted.values()]) + 1
            abstract_arr = [""] * words
            for word, positions in abstract_inverted.items():
                for pos in positions:
                    abstract_arr[pos] = word
            abstract = " ".join(abstract_arr)
        
        open_access = work.get("open_access", {}).get("is_oa", False)
        pdf_url = work.get("open_access", {}).get("oa_url")
        
        concepts = [
            concept.get("display_name") 
            for concept in work.get("concepts", [])[:5]
        ]
        
        paper_data = {
            "id": work.get("id"),
            "title": work.get("title", "Untitled"),
            "authors": authors,
            "abstract": abstract,
            "publication_year": work.get("publication_year"),
            "doi": work.get("doi"),
            "source": "OpenAlex",
            "open_access": open_access,
            "pdf_url": pdf_url,
            "landing_page": work.get("id"),
            "cited_by_count": work.get("cited_by_count", 0),
            "topics": concepts
        }
        
        return paper_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat")
def chat_with_papers(query: str, paper_ids: List[str] = []):
    """
    Mock implementation of LLM RAG chat.
    In a real implementation, this would query ChromaDB/Neo4j and an LLM.
    """
    return {
        "answer": f"This is a simulated AI response based on real retrieved papers. Real implementation requires LLM configuration. Query was: '{query}'",
        "citations": [
            {"id": pid, "title": "Retrieving context for citation..."} for pid in paper_ids
        ]
    }

@app.post("/api/literature-review")
def generate_literature_review(paper_ids: List[str]):
    """
    Generates a mock literature review based on given paper IDs.
    """
    return {
        "review": {
            "topic": "Generated Review from Selected Papers",
            "research_area": "Computer Science / AI",
            "major_approaches": ["Approach A", "Approach B"],
            "datasets": ["Dataset 1"],
            "methods": ["Method X"],
            "key_findings": ["Finding 1", "Finding 2"],
            "limitations": ["Limitation 1"],
            "research_trends": ["Trend 1"],
            "potential_gaps": ["Potential Gap 1: More evaluation needed on Dataset 2"]
        },
        "papers": paper_ids
    }

@app.post("/api/compare")
def compare_papers(paper_ids: List[str]):
    """
    Generates a comparison matrix for the given papers.
    """
    return {
        "comparison": {
            "problem": "Simulated Research Problem",
            "methodology": "Simulated Methodology",
            "results": "Simulated Results",
            "limitations": "Simulated Limitations"
        }
    }
