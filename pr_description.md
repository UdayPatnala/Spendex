🎯 **What:** Created a missing test suite for `JwtUtil` to improve security coverage.
📊 **Coverage:** Covered token generation, extracting emails, validating valid/invalid tokens based on emails, and handling token expiration exceptions (`ExpiredJwtException`). Used `ReflectionTestUtils` for injecting properties without Spring context overhead.
✨ **Result:** Improved overall test coverage for security-critical backend utility classes.
