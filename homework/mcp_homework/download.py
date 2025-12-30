import requests

JINA_URL = "https://r.jina.ai/"

def download_page(url: str) -> str:
    response = requests.get(f"{JINA_URL}{url}")
    response.raise_for_status()
    return response.text

if __name__ == "__main__":
    DOWNLOAD_URL   = "https://datatalks.club"
    page_content = download_page(DOWNLOAD_URL)
    file_name = DOWNLOAD_URL.split(".")[-2].split("/")[-1]
    print(f"Saving content to {file_name}.md")
    with open(f"{file_name}.md", "w", encoding="utf-8") as f:
        f.write(page_content)