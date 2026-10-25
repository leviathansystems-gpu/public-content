"""Official dependency-free client for Leviathan Systems public content."""
import json
import urllib.error
import urllib.parse
import urllib.request

class LeviathanAPIError(Exception):
    def __init__(self, message, status=0, code="NETWORK_ERROR", retry_after=None):
        super().__init__(message)
        self.status, self.code, self.retry_after = status, code, retry_after

class _NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None

class LeviathanClient:
    def __init__(self, base_url="https://www.leviathansystems.co", timeout=15):
        url = urllib.parse.urlsplit(base_url)
        local = url.scheme == "http" and url.hostname in ("localhost", "127.0.0.1")
        if url.username or url.password or url.query or url.fragment or url.path not in ("", "/") or not url.hostname or not (url.scheme == "https" or local):
            raise ValueError("base_url must be an HTTPS origin, or a local development origin")
        if not isinstance(timeout, (int, float)) or not 0 < timeout <= 60:
            raise ValueError("timeout must be from 0 to 60 seconds")
        self.base_url, self.timeout = base_url.rstrip("/"), timeout
        self._opener = urllib.request.build_opener(_NoRedirect)

    def _request(self, path):
        req = urllib.request.Request(self.base_url + path, headers={"Accept": "application/json", "Leviathan-API-Version": "1", "User-Agent": "Leviathan-Public-Content-Python/1.0.1"})
        try:
            try:
                response = self._opener.open(req, timeout=self.timeout)
            except urllib.error.HTTPError as error:
                response = error
            with response:
                raw = response.read(2_000_001)
                if len(raw) > 2_000_000:
                    raise LeviathanAPIError("Response exceeds the client size limit", code="INVALID_RESPONSE")
                try:
                    data = json.loads(raw)
                except (ValueError, UnicodeError):
                    raise LeviathanAPIError("The server returned an unreadable response", response.status, "INVALID_RESPONSE") from None
                if not isinstance(data, dict):
                    raise LeviathanAPIError("The server returned an invalid document", response.status, "INVALID_RESPONSE")
                if not 200 <= response.status < 300:
                    raise LeviathanAPIError(data.get("detail", "Content request failed"), response.status, data.get("code", "HTTP_ERROR"), response.headers.get("Retry-After"))
                return data
        except (urllib.error.URLError, TimeoutError, OSError):
            raise LeviathanAPIError("The content request could not complete. Check connectivity and retry.") from None

    def list_resources(self, q=None, kind=None, limit=20, cursor=None):
        if q is not None and (not isinstance(q, str) or len(q) > 200):
            raise ValueError("q must be a string of at most 200 characters")
        if kind is not None and kind not in ("article", "service"):
            raise ValueError("kind must be article or service")
        if type(limit) is not int or not 1 <= limit <= 50:
            raise ValueError("limit must be from 1 to 50")
        if cursor is not None and (not isinstance(cursor, str) or not 1 <= len(cursor) <= 100 or any(c not in "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-" for c in cursor)):
            raise ValueError("cursor must come from a previous resource page")
        params = {"limit": limit}
        for key, value in (("q", q), ("kind", kind), ("cursor", cursor)):
            if value is not None:
                params[key] = value
        return self._request("/api/v1/resources?" + urllib.parse.urlencode(params))

    def resource_pages(self, **options):
        cursor = options.pop("cursor", None)
        seen = set()
        while True:
            page = self.list_resources(cursor=cursor, **options)
            yield page
            cursor = page.get("next_cursor")
            if not cursor:
                return
            if cursor in seen:
                raise LeviathanAPIError("The server repeated a cursor", code="INVALID_RESPONSE")
            seen.add(cursor)

    def read_resource(self, resource_id):
        import re
        if not isinstance(resource_id, str) or len(resource_id) > 210 or not re.fullmatch(r"(?:article|service):[a-z0-9-]+", resource_id):
            raise ValueError("Use an article:slug or service:slug catalog ID")
        return self._request("/api/v1/resources/" + urllib.parse.quote(resource_id, safe=""))

    def company_profile(self):
        return self._request("/api/machine/home")
