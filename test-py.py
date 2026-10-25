import sys, json, threading, unittest
from pathlib import Path
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit, parse_qs
sys.path.insert(0, str(Path(__file__).resolve().parent))
from leviathan_public_content import LeviathanClient, LeviathanAPIError

class Handler(BaseHTTPRequestHandler):
    def log_message(self, *args): pass
    def do_GET(self):
        self.server.seen.append(self.path)
        self.send_response(429 if self.server.limited else 200)
        self.send_header("Content-Type", "application/json"); self.send_header("Retry-After", "5"); self.end_headers()
        params = parse_qs(urlsplit(self.path).query)
        data = {"code":"RATE_LIMITED","detail":"Retry later"} if self.server.limited else {"items":[{"id":"service:rack"}],"total":2,"next_cursor":None if "cursor" in params else "next-page"}
        if "/api/v1/resources/service%3Arack" in self.path: data = {"markdown":"# Rack", "id":"service:rack"}
        self.wfile.write(json.dumps(data).encode())

class PublicClientTests(unittest.TestCase):
    def setUp(self):
        self.server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        self.server.seen=[]; self.server.limited=False
        self.thread=threading.Thread(target=self.server.serve_forever, daemon=True); self.thread.start()
        self.client=LeviathanClient("http://127.0.0.1:"+str(self.server.server_port))
    def tearDown(self):
        self.server.shutdown(); self.server.server_close(); self.thread.join()
    def test_pages_and_resource_keep_the_query_and_origin(self):
        pages=list(self.client.resource_pages(q="rack",kind="service",limit=1))
        self.assertEqual(len(pages),2)
        self.assertTrue(all("q=rack" in path and "kind=service" in path for path in self.server.seen))
        self.assertEqual(self.client.read_resource(pages[0]["items"][0]["id"])["markdown"],"# Rack")
    def test_typed_limits_do_not_retry(self):
        self.server.limited=True
        with self.assertRaises(LeviathanAPIError) as raised: self.client.company_profile()
        self.assertEqual((raised.exception.status,raised.exception.code,raised.exception.retry_after),(429,"RATE_LIMITED","5"))
        self.assertEqual(len(self.server.seen),1)
    def test_invalid_input_is_rejected_before_network(self):
        for value in ["../../private","https://internal.invalid",None]:
            with self.assertRaises(ValueError): self.client.read_resource(value)
        with self.assertRaises(ValueError): self.client.list_resources(limit=51)
        with self.assertRaises(ValueError): LeviathanClient("https://user:secret@example.com")
        self.assertEqual(len(self.server.seen),0)
if __name__ == "__main__": unittest.main()
