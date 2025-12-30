import os
import sys
import pytest
import requests
from unittest.mock import Mock

# Ensure the package folder is importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import download


def test_download_page_success(monkeypatch):
    fake_resp = Mock()
    fake_resp.text = "fake content"
    fake_resp.raise_for_status = Mock()

    def fake_get(url):
        assert url == download.JINA_URL + "some-path"
        return fake_resp

    monkeypatch.setattr(download.requests, "get", fake_get)

    result = download.download_page("some-path")
    assert result == "fake content"
    fake_resp.raise_for_status.assert_called_once()


def test_download_page_raises_on_http_error(monkeypatch):
    fake_resp = Mock()

    def raise_error():
        raise requests.HTTPError("boom")

    fake_resp.raise_for_status = raise_error
    monkeypatch.setattr(download.requests, "get", lambda url: fake_resp)

    with pytest.raises(requests.HTTPError):
        download.download_page("bad-path")
