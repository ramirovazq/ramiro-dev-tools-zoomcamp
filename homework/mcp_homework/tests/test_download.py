import os
import sys
import pytest
import requests
from unittest.mock import Mock

# Ensure the package folder is importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import download


def test_get_content_md_page_success(monkeypatch):
    fake_resp = Mock()
    fake_resp.text = "fake content"
    fake_resp.raise_for_status = Mock()
    monkeypatch.setattr(download.requests, "get", lambda url: fake_resp)

    result = download.get_content_md_page("some-path")
    assert result == "fake content"
    fake_resp.raise_for_status.assert_called_once()


def test_get_content_md_page_raises_on_http_error(monkeypatch):
    fake_resp = Mock()

    def raise_error():
        raise requests.HTTPError("boom")

    fake_resp.raise_for_status = raise_error
    monkeypatch.setattr(download.requests, "get", lambda url: fake_resp)

    with pytest.raises(requests.HTTPError):
        download.get_content_md_page("bad-path")


def test_get_name_from_url_various():
    assert download.get_name_from_url("https://datatalks.club") == "datatalks"
    assert download.get_name_from_url("https://github.com/alexeygrigorev/minsearch") == "minsearch"
    assert download.get_name_from_url("http://example.com/") == "example"
    assert download.get_name_from_url("https://sub.domain.co.uk") == "sub"


def test_download_page_writes_file(monkeypatch, tmp_path):
    content = "hello"
    monkeypatch.setattr(download, "get_content_md_page", lambda url: content)
    monkeypatch.setattr(download, "get_name_from_url", lambda url: "myfile")

    cwd = os.getcwd()
    try:
        os.chdir(str(tmp_path))
        saved = download.download_page("some-url")
        assert saved == "myfile.md"
        p = tmp_path / "myfile.md"
        assert p.exists()
        assert p.read_text(encoding="utf-8") == content
    finally:
        os.chdir(cwd)
