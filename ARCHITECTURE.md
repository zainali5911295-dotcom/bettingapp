# BetAdmin Architecture & Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          NEXT.JS FRONTEND (admin-panel)                 │  │
│  │                                                          │  │
│  │  ┌─────────────────────────────────────────────────┐   │  │
│  │  │           React Components                      │   │  │
│  │  │  • Sidebar • Dashboard • Users • Games etc.    │   │  │
│  │  └──────────────────┬──────────────────────────────┘   │  │
│  │                     │ (HTTP + JWT)                      │  │
│  │  ┌─────────────────▼──────────────────────────────┐   │  │
│  │  │        Axios API Client (lib/api.ts)          │   │  │
│  │  │  • Base URL: localhost:5000                    │   │  │
│  │  │  • JWT Token Interceptor                       │   │  │
│  │  │  • Error Handler (401 → redirect)              │   │  │
│  │  └──────────────────┬──────────────────────────────┘   │  │
│  │                     │                                   │  │
│  │  ┌─────────────────▼──────────────────────────────┐   │  │
│  │  │    Auth Context (lib/auth-context.tsx)        │   │  │
│  │  │  • Stores: admin, token, isAuthenticated      │   │  │
│  │  │  • Methods: login(), logout()                  │   │  │
│  │  └─────────────────────────────────────────────────┘   │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ HTTP Requests (JSON)
                 │ POST /auth/admin/login
                 │ GET /api/...
                 │ PUT /api/...
                 │
┌────────────────▼────────────────────────────────────────────────┐
│                      BACKEND SERVER                              │
│                    (localhost:5000)                              │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Express.js Routes                          │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │ POST /auth/admin/login                           │   │  │
│  │  │  └─→ authController.adminLogin()                 │   │  │
│  │  │      └─→ authService.adminLoginUser()            │   │  │
│  │  │          • Validates admin role                  │   │  │
│  │  │          • Checks credentials                    │   │  │
│  │  │          • Returns JWT token                     │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  │                                                         │   │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │ GET/POST /api/... (Protected Routes)             │   │  │
│  │  │  └─→ requireAuth middleware (verifies JWT)       │   │  │
│  │  │      └─→ Various Controllers & Services          │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                    │
│  ┌──────────────────────────▼──────────────────────────────┐   │
│  │              MongoDB Database                          │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │ Users Collection                                 │   │   │
│  │  │ • email: "admin@admin.com"                       │   │   │
│  │  │ • role: "admin"                                  │   │   │
│  │  │ • passwordHash: bcrypt(password)                 │   │   │
│  │  │ • ... other collections ...                      │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└───────────────────────────────────────────────────────────────────┘
```

---

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USER VISITS LOGIN PAGE                                       │
│    http://localhost:3000/login                                  │
└────────────┬────────────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────────────┐
│ 2. ADMIN ENTERS CREDENTIALS                                     │
│    admin@admin.com / admin123                                   │
│    └─→ Submit button clicked                                    │
└────────────┬────────────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────────────┐
│ 3. AXIOS POST REQUEST SENT                                      │
│    POST http://localhost:5000/auth/admin/login                  │
│    Header: Content-Type: application/json                       │
│    Body: { email, password }                                    │
└────────────┬────────────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────────────┐
│ 4. BACKEND PROCESSES LOGIN                                      │
│    ├─→ Find admin user by email                                 │
│    ├─→ Verify role is 'admin'                                   │
│    ├─→ Compare password with bcrypt hash                        │
│    └─→ If valid, generate JWT token                             │
└────────────┬────────────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────────────┐
│ 5. BACKEND RESPONDS                                             │
│    Status: 200                                                  │
│    Body: {                                                      │
│      token: "eyJhbGciOiJIUzI1NiIs...",                          │
│      admin: {                                                   │
│        _id: "507f1f77bcf86cd799439011",                         │
│        email: "admin@admin.com",                                │
│        name: "admin",                                           │
│        role: "admin"                                            │
│      }                                                          │
│    }                                                            │
└────────────┬────────────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────────────┐
│ 6. FRONTEND STORES DATA                                         │
│    ├─→ localStorage.setItem('adminToken', token)                │
│    ├─→ localStorage.setItem('adminData', JSON.stringify(admin)) │
│    └─→ Auth context updates                                     │
└────────────┬────────────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────────────┐
│ 7. REDIRECT TO DASHBOARD                                        │
│    http://localhost:3000/dashboard                              │
│                                                                 │
│    Dashboard is now protected by AuthGuard:                     │
│    ├─→ Checks if token exists                                   │
│    ├─→ Checks if user is authenticated                          │
│    └─→ Shows sidebar + content                                  │
└─────────────────────────────────────────────────────────────────┘

SUCCESSFUL LOGIN FLOW:
  ✅ Token stored in localStorage
  ✅ Admin data stored in context
  ✅ User redirected to dashboard
  ✅ All future requests include JWT token
```

---

## Protected Route Flow

```
┌──────────────────────────────────────────────────────┐
│ User accesses dashboard page                          │
│ (component wrapped with <AuthGuard>)                  │
└────────────────┬─────────────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────────────┐
│ AuthGuard component checks:                           │
│                                                       │
│ ├─→ isLoading === true?                              │
│ │   └─→ Show loading spinner                         │
│ │                                                     │
│ ├─→ isAuthenticated === false?                       │
│ │   └─→ Redirect to /login                           │
│ │                                                     │
│ └─→ isAuthenticated === true?                        │
│     └─→ Render protected content                     │
│                                                       │
└──────────────────────────────────────────────────────┘
```

---

## API Request With JWT Flow

```
┌────────────────────────────────────────────────────────┐
│ Component calls: api.get('/api/users')                 │
└─────────────┬──────────────────────────────────────────┘
              │
┌─────────────▼──────────────────────────────────────────┐
│ Axios Request Interceptor (lib/api.ts):                │
│                                                         │
│ ├─→ Read token from localStorage                       │
│ ├─→ If token exists:                                   │
│ │   └─→ Add header: Authorization: Bearer <token>     │
│ └─→ Send request                                       │
└─────────────┬──────────────────────────────────────────┘
              │
              │ HTTP: GET /api/users
              │ Header: Authorization: Bearer eyJ...
              │
┌─────────────▼──────────────────────────────────────────┐
│ Backend Middleware (requireAuth):                      │
│                                                         │
│ ├─→ Extract token from Authorization header           │
│ ├─→ Verify JWT token with secret                      │
│ ├─→ If invalid/expired:                                │
│ │   └─→ Return 401 error                              │
│ └─→ If valid:                                          │
│     └─→ Continue to controller                        │
└─────────────┬──────────────────────────────────────────┘
              │
┌─────────────▼──────────────────────────────────────────┐
│ Controller processes request                           │
│ Returns data: { data: [...], total: 100 }              │
└─────────────┬──────────────────────────────────────────┘
              │
┌─────────────▼──────────────────────────────────────────┐
│ Axios Response Interceptor (lib/api.ts):               │
│                                                         │
│ ├─→ If status === 200:                                 │
│ │   └─→ Return response.data                           │
│ │                                                       │
│ └─→ If status === 401:                                 │
│     ├─→ Clear localStorage                             │
│     ├─→ Redirect to /login                             │
│     └─→ Reject promise                                 │
└─────────────┬──────────────────────────────────────────┘
              │
┌─────────────▼──────────────────────────────────────────┐
│ Component receives data                                │
│ Updates state and renders                              │
└──────────────────────────────────────────────────────────┘
```

---

## File Structure & Data Flow

```
admin-panel/
│
├── src/app/page.tsx
│   └─→ Checks auth status
│       ├─→ Authenticated? → /dashboard
│       └─→ Not authenticated? → /login
│
├── src/app/login/page.tsx
│   ├─→ Displays login form
│   ├─→ Sends credentials to /auth/admin/login
│   ├─→ Calls useAuth().login()
│   └─→ Redirects to /dashboard on success
│
├── src/app/dashboard/layout.tsx
│   └─→ Just exports children
│
├── src/app/dashboard/page.tsx
│   ├─→ Wrapped with <DashboardLayout>
│   ├─→ <DashboardLayout> includes <AuthGuard>
│   ├─→ Protected by AuthGuard component
│   └─→ Shows sidebar + dashboard content
│
├── src/components/DashboardLayout.tsx
│   ├─→ Wraps children with <AuthGuard>
│   ├─→ Renders <Sidebar>
│   └─→ Renders main content area
│
├── src/components/AuthGuard.tsx
│   ├─→ Uses useAuth() hook
│   ├─→ Checks isLoading and isAuthenticated
│   ├─→ Shows spinner while loading
│   ├─→ Returns null if not authenticated (during redirect)
│   └─→ Renders children if authenticated
│
├── src/components/Sidebar.tsx
│   ├─→ Uses useAuth() hook to get admin info
│   ├─→ Displays navigation menu
│   ├─→ Shows active route indicator
│   ├─→ Handles logout via useAuth().logout()
│   └─→ Mobile responsive with toggle
│
├── src/lib/auth-context.tsx
│   ├─→ Creates AuthContext
│   ├─→ <AuthProvider> wrapper component
│   ├─→ Provides: admin, token, isAuthenticated, login, logout
│   ├─→ Persists data in localStorage
│   └─→ useAuth() hook to consume context
│
├── src/lib/api.ts
│   ├─→ Creates axios instance
│   ├─→ Request interceptor: adds JWT token
│   ├─→ Response interceptor: handles 401 errors
│   └─→ Used by all API calls
│
└── src/lib/types.ts
    └─→ TypeScript interfaces for all data types
```

---

## Data Flow Example: Login

```
User Login Form
      │
      ▼
handleSubmit() called
      │
      ├─→ Validate email & password
      │
      ▼
api.post("/auth/admin/login", { email, password })
      │
      ├─→ [Axios Request Interceptor]
      │   └─→ No token yet (not needed for login)
      │
      ▼
Backend receives request
      │
      ├─→ Express router matches /auth/admin/login
      ├─→ authLimiter middleware (rate limit)
      ├─→ adminLogin controller
      ├─→ authService.adminLoginUser()
      │
      ├─→ Database query: User.findOne({ email, role: 'admin' })
      ├─→ bcrypt.compare(password, passwordHash)
      │
      ├─→ issueTokens(user)
      │   └─→ signAccessToken() generates JWT
      │
      ▼
Response: { token: "...", admin: { ... } }
      │
      ├─→ [Axios Response Interceptor]
      │   └─→ Status 200, return response
      │
      ▼
Component receives response
      │
      ├─→ useAuth().login(token, admin)
      │   ├─→ setToken(token)
      │   ├─→ setAdmin(admin)
      │   ├─→ localStorage.setItem('adminToken', token)
      │   └─→ localStorage.setItem('adminData', JSON.stringify(admin))
      │
      ▼
router.push("/dashboard")
      │
      ├─→ Next.js navigates to /dashboard
      ├─→ Page renders with <DashboardLayout>
      ├─→ <AuthGuard> checks isAuthenticated (✅ true)
      ├─→ Renders <Sidebar> and content
      │
      ▼
Admin is now logged in and viewing dashboard ✅
```

---

## Component Hierarchy

```
RootLayout (app/layout.tsx)
    └── <AuthProvider>
        ├── page.tsx (root redirect)
        │
        ├── login/page.tsx
        │   └── No special layout
        │
        └── dashboard/layout.tsx
            └── dashboard/page.tsx
                └── <DashboardLayout>
                    ├── <AuthGuard>
                    │   └── Checks authentication
                    ├── <Sidebar>
                    │   ├── Menu items
                    │   └── Logout button
                    └── Main content area
                        └── Page-specific components

Other dashboard pages follow same structure:
- dashboard/users/page.tsx
- dashboard/games/page.tsx
- dashboard/withdrawals/page.tsx
- dashboard/transactions/page.tsx
- dashboard/settings/page.tsx
```

---

## State Management Flow

```
Global State (AuthProvider/AuthContext):
    ├── admin: Admin | null
    ├── token: string | null
    ├── isLoading: boolean
    ├── isAuthenticated: boolean
    └── Methods:
        ├── login(token, admin)
        └── logout()

Component-Level State:
    ├── Form inputs
    ├── Loading states (isLoading, isSubmitting)
    ├── Errors
    ├── Data fetching (useState)
    └── UI states (modals, dropdowns, etc.)

LocalStorage Persistence:
    ├── adminToken
    └── adminData
```

---

## Error Handling Flow

```
API Error Occurs
    │
    ├─→ Axios catches error
    │
    ├─→ [Response Interceptor]
    │
    ├─→ Check status code:
    │
    ├─→ if (status === 401)
    │   ├─→ localStorage.removeItem('adminToken')
    │   ├─→ localStorage.removeItem('adminData')
    │   ├─→ window.location.href = '/login'
    │   └─→ Reject promise
    │
    ├─→ if (status === 500)
    │   └─→ Component catches error
    │       └─→ Display error message
    │
    └─→ Component error boundary
        └─→ Try/catch around API calls
            └─→ setState({ error: message })
                └─→ Display to user
```

---

## Security Considerations

```
✅ Authentication:
   - JWT tokens signed with secret
   - Tokens stored in localStorage
   - Tokens sent with every authenticated request

✅ Authorization:
   - Backend verifies admin role
   - Only admins can call /auth/admin/login
   - Only authenticated users can access protected routes

✅ Error Handling:
   - 401 errors auto-logout user
   - Tokens cleared on logout
   - Passwords hashed with bcrypt

⚠️ Future Improvements:
   - Use httpOnly cookies instead of localStorage
   - Implement refresh token rotation
   - Add CSRF protection
   - Implement rate limiting (already done)
   - Add request signing
   - Implement 2FA for admin
```

---

## Deployment Architecture

```
Production Setup:
    
    ┌──────────────────────────────────────────────────────┐
    │                   Vercel / Netlify                   │
    │              (Deploy admin-panel here)               │
    │                                                       │
    │  - Automatic builds on git push                       │
    │  - Environment variables (NEXT_PUBLIC_API_URL)       │
    │  - CDN for static assets                              │
    │  - Automatic SSL certificates                        │
    └──────────────────┬───────────────────────────────────┘
                       │
                       │ HTTPS
                       │
    ┌──────────────────▼───────────────────────────────────┐
    │              Your Backend Server                     │
    │         (Deploy backend here)                        │
    │                                                      │
    │  - Express.js server                                │
    │  - MongoDB Atlas / Self-hosted                       │
    │  - Environment variables (.env)                      │
    │  - JWT_SECRET, MONGO_URI, etc.                       │
    └────────────────────────────────────────────────────────┘
```

---

This documentation provides complete visibility into how the BetAdmin dashboard architecture works, data flows through the system, and how components interact with each other.
