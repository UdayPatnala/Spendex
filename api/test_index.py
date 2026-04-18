import sys
import unittest
from unittest.mock import MagicMock

# Mock the missing python backend dependencies
sys.modules['backend'] = MagicMock()
sys.modules['backend.app'] = MagicMock()
sys.modules['backend.app.main'] = MagicMock()

# Now we can safely import our module
from api.index import normalize_path, SERVICE_PREFIX

class TestNormalizePath(unittest.TestCase):

    def test_empty_path(self):
        self.assertEqual(normalize_path(""), "/")
        self.assertEqual(normalize_path(None), "/")

    def test_service_prefix(self):
        # Starts with SERVICE_PREFIX
        self.assertEqual(normalize_path(SERVICE_PREFIX), "/")
        self.assertEqual(normalize_path(f"{SERVICE_PREFIX}/users"), "/users")

    def test_api_prefix(self):
        # Starts with /api
        self.assertEqual(normalize_path("/api"), "/api")
        self.assertEqual(normalize_path("/api/users"), "/api/users")

    def test_root_path(self):
        self.assertEqual(normalize_path("/"), "/api")

    def test_other_paths(self):
        self.assertEqual(normalize_path("/users"), "/api/users")
        self.assertEqual(normalize_path("/test/path"), "/api/test/path")

if __name__ == '__main__':
    unittest.main()
