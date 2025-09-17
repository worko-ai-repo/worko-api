1. /admin
   • What It Matches:
      • This path matches exactly /admin and nothing else.
   • Examples:
      • ✅ /admin
      • ❌ /admin/dashboard
      • ❌ /admin/123

2. /admin/*
   • What It Matches:
      • This path matches /admin and anything that comes after it, with / separating each segment.
   • Examples:
      • ✅ /admin
      • ✅ /admin/dashboard
      • ✅ /admin/settings/user
      • ✅ /admin/123
   • How It Works:
      • The * acts like a wildcard that matches all subsequent segments.

3. /admin/(*)
   • What It Matches:
      • Matches anything starting with /admin/ and captures everything after it in a single segment, even if it contains /.
   • Examples:
      • ✅ /admin/dashboard
      • ✅ /admin/settings/user
      • ✅ /admin/123
      • ❌ /admin (does not match /admin alone since it needs something after /admin/).
   • How It Works:
      • The (*) is often used to capture the entire path segment, including slashes.

4. /admin/:path(*)/cv
   • What It Matches:
      • Matches paths like /admin/.../cv, where :path(*) captures everything between /admin/ and /cv, including /.
   • Examples:
      • ✅ /admin/dashboard/cv (captures dashboard)
      • ✅ /admin/settings/user/cv (captures settings/user)
      • ✅ /admin/123/cv (captures 123)
      • ❌ /admin/cv (needs something between /admin/ and /cv).
   • How It Works:
      • :path is a variable that captures the entire middle section.

5. /admin/:path/cv
   • What It Matches:
      • Matches paths like /admin/.../cv, where :path captures a single segment between /admin/ and /cv.
   • Examples:
      • ✅ /admin/dashboard/cv (captures dashboard)
      • ❌ /admin/settings/user/cv (does not match because :path only captures one segment).
      • ❌ /admin/cv (needs one segment between /admin/ and /cv).
   • How It Works:
      • :path is a variable, but it matches only one segment.
