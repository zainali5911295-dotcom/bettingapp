# BetAdmin Dashboard - Setup & Usage Guide

## Quick Start

### Step 1: Install Dependencies

Navigate to the admin-panel directory and install dependencies:

```bash
cd admin-panel
npm install
```

This will install:
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Axios (for API calls)
- Lucide React (for icons)

### Step 2: Configure Environment

The `.env.local` file is already configured:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Make sure your backend is running on `http://localhost:5000`

### Step 3: Start Development Server

```bash
npm run dev
```

The dashboard will be available at `http://localhost:3000`

### Step 4: Login

Use the demo credentials:
- **Email:** admin@admin.com
- **Password:** admin123

## Project Structure Overview

```
admin-panel/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # Root layout with providers
│   │   ├── page.tsx           # Root redirect page
│   │   ├── login/
│   │   │   └── page.tsx       # 🔐 Login Page
│   │   └── dashboard/
│   │       ├── layout.tsx
│   │       ├── page.tsx       # 📊 Dashboard Home
│   │       ├── users/
│   │       │   └── page.tsx   # 👥 Users Management
│   │       ├── games/
│   │       │   └── page.tsx   # 🎮 Games Control
│   │       ├── withdrawals/
│   │       │   └── page.tsx   # 💰 Withdrawals
│   │       ├── transactions/
│   │       │   └── page.tsx   # 📈 Transactions
│   │       └── settings/
│   │           └── page.tsx   # ⚙️ Settings
│   ├── components/
│   │   ├── Sidebar.tsx        # 🗂️ Navigation sidebar
│   │   ├── AuthGuard.tsx      # 🔒 Protected routes wrapper
│   │   └── DashboardLayout.tsx # 📐 Dashboard layout wrapper
│   ├── lib/
│   │   ├── api.ts             # 🔗 Axios configuration with interceptors
│   │   ├── types.ts           # 📝 TypeScript interfaces
│   │   └── auth-context.tsx   # 🔑 Authentication context
│   └── app/
│       └── globals.css         # 🎨 Global dark theme styles
├── public/                     # Static files
├── package.json               # Dependencies
├── tsconfig.json             # TypeScript config
├── postcss.config.mjs        # PostCSS config
└── README-DASHBOARD.md       # Full documentation
```

## Key Features Implemented

### ✅ Authentication System
- Login page with demo credentials
- JWT token storage in localStorage
- Automatic token attachment to API requests
- 401 error handling (auto-logout)
- Protected routes with AuthGuard

### ✅ UI/UX Design
- Professional dark theme (Slate + Purple/Pink accents)
- Responsive sidebar navigation
- Mobile menu toggle
- Gradient backgrounds and smooth animations
- Beautiful form styling
- Loading states and error messages

### ✅ API Integration
- Axios instance with base URL configuration
- Request interceptor for JWT tokens
- Response interceptor for error handling
- Automatic redirect on unauthorized access

### ✅ Navigation Structure
- Sidebar with active state indicators
- Mobile-responsive hamburger menu
- Quick logout button
- Route-based menu items

## API Endpoints Required

Make sure your backend provides these endpoints:

### Auth
```
POST /auth/admin/login
  Payload: { email, password }
  Response: { token, admin: { _id, email, name, role } }
```

## Troubleshooting

### Issue: "Cannot GET /api/..."
**Solution:** Ensure backend is running on http://localhost:5000

### Issue: Login fails with CORS error
**Solution:** Configure CORS in your backend to allow http://localhost:3000

### Issue: "Module not found" errors
**Solution:** Run `npm install` to ensure all dependencies are installed

### Issue: Tailwind CSS not loading
**Solution:** Clear `.next` folder and restart dev server:
```bash
rm -rf .next
npm run dev
```

## Building for Production

```bash
npm run build
npm start
```

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## Next Pages to Build

The framework is ready. Here are the next pages to implement:

1. **Dashboard** - Add statistics cards and charts
2. **Users** - User list table with search and actions
3. **Games** - Game management controls
4. **Withdrawals** - Withdrawal approval queue
5. **Transactions** - Transaction history table
6. **Settings** - Configuration forms

## Tech Stack Details

- **Next.js 16**: Latest App Router, SSR ready
- **TypeScript**: Full type safety
- **Tailwind CSS 4**: Modern utility-first CSS
- **Axios**: Promise-based HTTP client
- **Lucide React**: 300+ beautiful icons
- **React 19**: Latest features and hooks

## Security Notes

- JWT tokens stored in localStorage (production: consider httpOnly cookies)
- API calls require valid JWT token
- Unauthorized requests (401) auto-redirect to login
- Environment variables for API URLs
- Input validation on forms

## Performance

- Server-side rendering with Next.js
- Automatic code splitting
- Optimized images and assets
- Fast navigation with client-side routing
- Minimal dependencies

## Support & Documentation

- Full documentation: See README-DASHBOARD.md
- Backend integration: Check API endpoints in README-DASHBOARD.md
- Component examples: Review existing page components
- TypeScript types: Check lib/types.ts for all interfaces

---

**Ready to go!** 🚀

Start the dev server and login with:
- admin@admin.com / admin123
