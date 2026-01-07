# server.py
import sys
from pathlib import Path

from fastmcp import FastMCP

from download import count_word_in_page

# Add script_process_zips to path for imports
_project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(_project_root / "script_process_zips"))

from process_zips import process_directory, resolve_md_references
from minsearch import Index


mcp = FastMCP("Demo 🚀 main")


@mcp.tool
def add(a: int, b: int) -> int:
    """Add two numbers"""
    return a + b


@mcp.tool
def count_word(url: str, word: str) -> int:
    """Count occurrences of `word` (case-insensitive, substring) in `url`.

    This delegates to `count_word_in_page` from `download.py`.
    """
    return count_word_in_page(url, word)


def load_docs_from_zips(zip_dir: Path) -> list:
    """Load docs from zip files in the given directory.
    
    Args:
        zip_dir: Directory containing .zip files.
    
    Returns:
        List of document dicts with 'original', 'filename', and 'content' keys.
    """
    results = process_directory(zip_dir)
    
    # Flatten all entries from all zip files and resolve references
    all_docs = []
    for archive_name, entries in results.items():
        resolved = resolve_md_references(entries)
        all_docs.extend(resolved)
    
    return all_docs


@mcp.tool
def search_in_zips(directory: str, word: str, max_results: int = 5) -> list[dict]:
    """Search for a word in markdown files inside zip archives.
    
    Args:
        directory: Path to directory containing .zip files.
        word: The search term to look for.
        max_results: Maximum number of results to return (default: 5).
    
    Returns:
        List of matching documents with 'filename' and 'content' keys.
    """
    zip_dir = Path(directory)
    if not zip_dir.exists():
        return [{"error": f"Directory not found: {directory}"}]
    
    docs = load_docs_from_zips(zip_dir)
    
    if not docs:
        return [{"error": "No markdown files found in zip archives"}]
    
    # Create an index
    index = Index(
        text_fields=["filename", "content"],
        keyword_fields=["original"]
    )
    
    # Add documents and search
    index.fit(docs)
    results = index.search(word)[:max_results]
    
    # Return simplified results
    return [{"filename": doc["filename"]} for doc in results]


if __name__ == "__main__":
    mcp.run()