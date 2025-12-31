# server.py
from fastmcp import FastMCP

from download import count_word_in_page


mcp = FastMCP("Demo 🚀")


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

if __name__ == "__main__":
    mcp.run()