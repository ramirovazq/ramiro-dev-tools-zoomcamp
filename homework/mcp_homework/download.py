from urllib.parse import urlparse
import requests
import re

JINA_URL = "https://r.jina.ai/"

def get_content_md_page(url: str) -> str:
    response = requests.get(f"{JINA_URL}{url}")
    response.raise_for_status()
    return response.text


def get_name_from_url(url: str) -> str:
    parsed = urlparse(url)
    # prefer last path segment when available
    path = parsed.path.rstrip('/')
    if path:
        last = path.split('/')[-1]
        if last:
            return last

    # fallback to hostname first part (strip www and port)
    hostname = parsed.netloc.split(':')[0]
    if hostname.startswith('www.'):
        hostname = hostname[4:]
    return hostname.split('.')[0]

def download_page(url: str) -> str:
    page_content = get_content_md_page(url)
    file_name = get_name_from_url(url)

    
    with open(f"{file_name}.md", "w", encoding="utf-8") as f:
        f.write(page_content)

    return f"{file_name}.md"

def count_word_in_page(url: str, word: str) -> int:
    """Return the number of whole-word, case-insensitive occurrences of `word` in the page at `url`.

    Uses regex word boundaries to approximate `grep -owi` behavior.
    """
    page_content = get_content_md_page(url)
    pattern = rf"\b{re.escape(word)}\b"
    matches = re.findall(pattern, page_content, flags=re.IGNORECASE)
    return len(matches)



if __name__ == "__main__":
    DOWNLOAD_URL   = "https://datatalks.club"
    DOWNLOAD_URL   = "https://github.com/alexeygrigorev/minsearch"

    file_saved = download_page(DOWNLOAD_URL)
    print(f"Saving content to:{file_saved}")
    #page_content = get_content_md_page(DOWNLOAD_URL)
    #file_name = DOWNLOAD_URL.split(".")[-2].split("/")[-1]
