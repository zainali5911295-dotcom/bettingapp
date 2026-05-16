# BetAdmin - Professional Betting Admin Dashboard

A professional dark-themed admin dashboard built with Next.js 16, TypeScript, and Tailwind CSS. Perfect for managing a betting platform with games, users, withdrawals, and transactions.

## Features

✨ **Core Features:**
- 🎨 Professional dark theme with gradient accents
- 🔐 JWT authentication with protected routes
- 📱 Responsive design (mobile & desktop)
- ⚡ Real-time API integration with axios
- 🎯 Beautiful UI similar to 91 Club / TC Lottery

📊 **Dashboard Pages:**
- **Login** - Secure admin authentication
- **Dashboard** - Total users, balance, profit, active games chart
- **Users** - List, search, edit balance, ban/unban users
- **Games** - Color Prediction, Aviator manual control, jackpot settings
- **Withdrawals** - Pending approvals, approve/reject with reasons
- **Transactions** - Deposits, withdrawals, bets history
- **Settings** - Commission rates, referral levels, maintenance mode

## Tech Stack

- **Framework:** Next.js 16
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **HTTP Client:** Axios
- **UI Components:** Lucide React Icons
- **State Management:** React Context API

## Prerequisites

- Node.js 18+
- Backend API running on http://localhost:5000

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file (already created):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Development

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Default Credentials

- **Email:** admin@admin.com
- **Password:** admin123

## API Integration

The dashboard connects to your backend APIs with the following endpoints:

### Authentication
- `POST /auth/admin/login` - Admin login

### Users
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user balance
- `PUT /api/users/:id/ban` - Ban/unban user

### Games
- `GET /api/games/color-prediction/rounds` - Color Prediction rounds
- `POST /api/games/color-prediction/:roundId/result` - Set manual result
- `GET /api/games/aviator/rounds` - Aviator rounds
- `POST /api/games/aviator/:roundId/crash` - Set manual crash

### Withdrawals
- `GET /api/withdrawals` - List pending withdrawals
- `POST /api/withdrawals/:id/approve` - Approve withdrawal
- `POST /api/withdrawals/:id/reject` - Reject withdrawal

### Transactions
- `GET /api/transactions` - All transactions

### Dashboard
- `GET /api/admin/stats` - Dashboard statistics

### Settings
- `GET /api/admin/settings` - Get settings
- `PUT /api/admin/settings` - Update settings

## Project Structure

```
src/
├── app/
│   ├── layout.tsx           # Root layout with AuthProvider
│   ├── page.tsx             # Root redirect page
│   ├── login/
│   │   └── page.tsx         # Login page
│   └── dashboard/
│       ├── layout.tsx       # Dashboard layout
│       ├── page.tsx         # Dashboard home
│       ├── users/
│       ├── games/
│       ├── withdrawals/
│       ├── transactions/
│       └── settings/
├── components/
│   ├── Sidebar.tsx          # Navigation sidebar
│   ├── AuthGuard.tsx        # Protected route wrapper
│   └── DashboardLayout.tsx  # Dashboard layout wrapper
└── lib/
    ├── api.ts               # Axios instance with interceptors
    ├── types.ts             # TypeScript interfaces
    └── auth-context.tsx     # Auth state management
```

## Styling Features

- **Dark Theme:** Slate-based color palette with purple/pink accents
- **Responsive:** Mobile-first design with Tailwind breakpoints
- **Smooth Animations:** Gradient borders, smooth transitions
- **Professional Look:** Similar to 91 Club and TC Lottery
- **Accessibility:** Proper contrast ratios and semantic HTML

## Authentication Flow

1. User enters credentials on login page
2. Credentials sent to backend: `POST /auth/admin/login`
3. Backend returns JWT token and admin data
4. Token stored in localStorage
5. Token attached to all API requests via axios interceptor
6. Invalid token (401) redirects to login
7. Protected routes use AuthGuard component

## Building for Production

```bash
npm run build
npm start
```

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:5000  # Backend API URL
```

## Next Steps

1. Implement dashboard statistics and charts
2. Build user management functionality
3. Create games management interface
4. Build withdrawals approval system
5. Implement transactions history
6. Create settings management

## License

Proprietary - All rights reserved
