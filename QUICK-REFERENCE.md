# BetAdmin - One Page Reference Guide

## 🚀 Quick Start Commands

```bash
# 1. Create Admin User
cd backend && node scripts/create-admin.js

# 2. Install Dashboard
cd admin-panel && npm install

# 3. Terminal 1 - Start Backend (port 5000)
cd backend && npm run dev

# 4. Terminal 2 - Start Dashboard (port 3000)
cd admin-panel && npm run dev

# 5. Login
# Visit: http://localhost:3000
# Email: admin@admin.com
# Password: admin123
```

---

## 📁 Key Files Created

### Frontend
```
admin-panel/src/
├── app/
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Redirect to dashboard/login
│   ├── login/page.tsx            # 🔐 LOGIN (READY)
│   └── dashboard/
│       ├── page.tsx              # 📊 Dashboard home
│       ├── users/page.tsx        # 👥 Users
│       ├── games/page.tsx        # 🎮 Games
│       ├── withdrawals/page.tsx  # 💰 Withdrawals
│       ├── transactions/page.tsx # 📈 Transactions
│       └── settings/page.tsx     # ⚙️ Settings
├── components/
│   ├── Sidebar.tsx               # Navigation
│   ├── AuthGuard.tsx             # Route protection
│   └── DashboardLayout.tsx       # Layout wrapper
├── lib/
│   ├── api.ts                    # Axios config
│   ├── types.ts                  # TypeScript types
│   └── auth-context.tsx          # Auth state
└── app/globals.css               # Dark theme
```

### Backend
```
backend/src/
├── controllers/
│   └── auth.controller.js        # Updated with adminLogin
├── services/
│   └── auth.service.js           # Updated with adminLoginUser
├── routes/
│   └── auth.routes.js            # Added POST /admin/login
└── scripts/
    └── create-admin.js           # Admin user creation
```

---

## 📚 Documentation Files

| File | Read This For |
|------|---------------|
| `README-ADMIN-DASHBOARD.md` | Overview & quick start |
| `ADMIN_DASHBOARD_STATUS.md` | Complete status report |
| `SETUP-GUIDE.md` | Step-by-step setup |
| `COMPONENTS-GUIDE.md` | Component reference |
| `ARCHITECTURE.md` | System architecture |

---

## 🔐 Auth Credentials

```
Email:    admin@admin.com
Password: admin123
```

---

## 🌐 URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:5000 |
| Login Page | http://localhost:3000/login |
| Dashboard | http://localhost:3000/dashboard |

---

## 📊 Pages & Status

| Page | Endpoint | Status |
|------|----------|--------|
| Login | `/login` | ✅ Working |
| Dashboard | `/dashboard` | 🔲 Placeholder |
| Users | `/dashboard/users` | 🔲 Placeholder |
| Games | `/dashboard/games` | 🔲 Placeholder |
| Withdrawals | `/dashboard/withdrawals` | 🔲 Placeholder |
| Transactions | `/dashboard/transactions` | 🔲 Placeholder |
| Settings | `/dashboard/settings` | 🔲 Placeholder |

---

## 🎨 Color Palette

```
bg-slate-950   # Darkest background
bg-slate-900   # Card backgrounds
bg-slate-800   # Medium dark
bg-purple-600  # Primary
bg-pink-600    # Secondary
text-white     # Primary text
text-slate-300 # Secondary text
```

---

## 🔗 API Endpoints

### Auth (Implemented)
```
POST /auth/admin/login
  Request:  { email, password }
  Response: { token, admin: {...} }
```

### Dashboard (Placeholder)
```
GET /api/admin/stats
GET /api/admin/users
GET /api/admin/games/...
GET /api/admin/withdrawals
GET /api/admin/transactions
GET /api/admin/settings
```

---

## 💻 Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **HTTP Client**: Axios with JWT interceptors
- **Icons**: Lucide React (300+)
- **Backend**: Express.js, MongoDB
- **Auth**: JWT tokens
- **State**: React Context + localStorage

---

## 🛠️ Development

### Frontend Commands
```bash
cd admin-panel
npm run dev    # Start dev server
npm run build  # Build production
npm start      # Start prod server
npm run lint   # ESLint
```

### Backend Commands
```bash
cd backend
npm run dev    # Start dev
npm start      # Start prod
```

---

## ✨ Key Components

### useAuth() Hook
```tsx
const { admin, token, isAuthenticated, login, logout } = useAuth();
```

### api Instance
```tsx
import api from "@/lib/api";
const res = await api.get("/api/users");
```

### DashboardLayout Component
```tsx
<DashboardLayout>
  {/* Content wrapped with AuthGuard + Sidebar */}
</DashboardLayout>
```

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't login | Run `node scripts/create-admin.js` |
| Connection refused | Start backend: `npm run dev` |
| Tailwind not working | Clear `.next` folder & restart |
| Module not found | Run `npm install` in admin-panel |

---

## 📝 Next Steps

1. ✅ Login works
2. 🔲 Build dashboard stats page
3. 🔲 Build users management
4. 🔲 Build games control
5. 🔲 Build withdrawals page
6. 🔲 Build transactions page
7. 🔲 Build settings page

---

## 📦 Environment Variables

### .env.local (Frontend)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### .env (Backend)
```env
MONGO_URI=mongodb://...
JWT_SECRET=your_secret
BCRYPT_SALT_ROUNDS=10
PORT=5000
```

---

## 🎯 Project Structure Overview

```
BETTINGAPP/
├── admin-panel/          # 🎨 Frontend (Next.js)
├── backend/              # 🔙 Backend (Express)
├── betting_app/          # 📱 Mobile app
├── README-ADMIN-DASHBOARD.md
├── ADMIN_DASHBOARD_STATUS.md
├── SETUP-GUIDE.md
└── ARCHITECTURE.md
```

---

## 📞 Files Reference

- `src/lib/types.ts` - TypeScript interfaces
- `src/lib/api.ts` - Axios configuration
- `src/lib/auth-context.tsx` - Auth state management
- `src/components/Sidebar.tsx` - Navigation
- `src/components/AuthGuard.tsx` - Route protection
- `src/components/DashboardLayout.tsx` - Layout wrapper

---

## 🔒 Security

✅ JWT token-based auth  
✅ Bcrypt password hashing  
✅ Protected routes with AuthGuard  
✅ 401 auto-logout  
✅ Token stored in localStorage  

---

## 📊 Features Summary

✅ Admin login system  
✅ JWT authentication  
✅ Beautiful dark UI  
✅ Responsive sidebar  
✅ Protected routes  
✅ Mobile responsive  
✅ Error handling  
✅ Loading states  
✅ Full TypeScript support  

---

## 🚀 Production Ready

- ✅ Build command: `npm run build`
- ✅ Production start: `npm start`
- ✅ ESLint configured
- ✅ TypeScript strict mode
- ✅ Environment variables

---

**All systems ready! Start with Quick Start Commands above.** 🎉

---

**Created:** May 12, 2026  
**Status:** ✅ Login & Layout Complete  
**Next:** Build dashboard feature pages
