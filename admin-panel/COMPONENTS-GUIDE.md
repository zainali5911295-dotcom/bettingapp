# BetAdmin Dashboard - Components & Utilities Reference

## Available Components

### 1. DashboardLayout
Wrapper component that provides sidebar and protected route functionality.

```tsx
import { DashboardLayout } from "@/components/DashboardLayout";

export default function MyPage() {
  return (
    <DashboardLayout>
      <h1>Page Title</h1>
      {/* Your content here */}
    </DashboardLayout>
  );
}
```

### 2. Sidebar
Navigation sidebar with menu items and logout button.
- Automatically highlights active routes
- Responsive mobile menu
- User info display

### 3. AuthGuard
Protects routes from unauthorized access.

```tsx
import { AuthGuard } from "@/components/AuthGuard";

export default function ProtectedPage() {
  return (
    <AuthGuard>
      {/* Protected content */}
    </AuthGuard>
  );
}
```

## Available Hooks

### useAuth()
Access authentication context.

```tsx
import { useAuth } from "@/lib/auth-context";

export default function MyComponent() {
  const { admin, token, isAuthenticated, logout } = useAuth();

  return (
    <div>
      <p>Logged in as: {admin?.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## API Client

### Default Export: api (axios instance)

Pre-configured axios instance with:
- Base URL: http://localhost:5000
- JWT token interceptor
- Error handling (401 redirects)

```tsx
import api from "@/lib/api";

// Example: Login
const response = await api.post("/auth/admin/login", {
  email: "admin@admin.com",
  password: "admin123"
});

// Example: Get data with auth
const users = await api.get("/api/users");

// Example: Update data
await api.put("/api/users/123", { balance: 5000 });
```

## TypeScript Types

All types are exported from `@/lib/types`:

```tsx
import {
  Admin,
  User,
  AuthResponse,
  LoginRequest,
  Withdrawal,
  Transaction,
  DashboardStats,
  Settings,
  ColorPredictionRound,
  AviatorRound
} from "@/lib/types";
```

### Common Types

```typescript
// Admin/Auth
Admin: { _id, email, name, role }
AuthResponse: { token, admin }
LoginRequest: { email, password }

// Users
User: { _id, email, balance, isActive, isBanned, ... }
UserListResponse: { data: User[], total, page, pages }

// Games
ColorPredictionRound: { _id, roundNumber, result, ... }
AviatorRound: { _id, roundNumber, crashMultiplier, ... }

// Withdrawals
Withdrawal: { _id, userId, amount, status, ... }
WithdrawalListResponse: { data: Withdrawal[], total, page, pages }

// Transactions
Transaction: { _id, userId, type, amount, ... }
TransactionListResponse: { data: Transaction[], total, page, pages }

// Dashboard
DashboardStats: { totalUsers, totalBalance, todaysProfit, ... }
```

## Styling Guide

### Color Palette

```css
/* Primary Colors */
bg-purple-600  /* Primary gradient start */
bg-pink-600    /* Primary gradient end */

/* Dark Theme */
bg-slate-950   /* Darkest background */
bg-slate-900   /* Dark card background */
bg-slate-800   /* Medium dark */
bg-slate-700   /* Lighter */

/* Text */
text-white     /* Primary text */
text-slate-300 /* Secondary text */
text-slate-400 /* Tertiary text */
```

### Common Classes

```tsx
// Gradient button
<button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
  Action
</button>

// Card
<div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
  Content
</div>

// Input
<input className="px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-slate-100 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20" />

// Loading spinner
<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
```

## Common Patterns

### Loading State
```tsx
const [isLoading, setIsLoading] = useState(false);

const handleAction = async () => {
  setIsLoading(true);
  try {
    // API call
  } catch (error) {
    // Handle error
  } finally {
    setIsLoading(false);
  }
};
```

### Data Fetching
```tsx
const [data, setData] = useState<User[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await api.get("/api/users");
      setData(response.data.data);
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };
  
  fetchData();
}, []);
```

### Error Handling
```tsx
try {
  await api.post("/endpoint", data);
} catch (err: any) {
  const message = err?.response?.data?.message || "An error occurred";
  setError(message);
}
```

## Icons Available

All icons from lucide-react:

```tsx
import {
  LayoutDashboard,
  Users,
  Gamepad2,
  CreditCard,
  LogOut,
  Menu,
  X,
  Settings,
  TrendingUp,
  AlertCircle,
  Eye,
  EyeOff
} from "lucide-react";

// Usage
<LayoutDashboard size={20} className="text-white" />
```

Browse all available icons: https://lucide.dev

## Page Template

Use this template for new dashboard pages:

```tsx
"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import api from "@/lib/api";
import { YourType } from "@/lib/types";

export default function YourPage() {
  const [data, setData] = useState<YourType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/api/endpoint");
        setData(response.data.data);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Page Title</h1>
          <p className="text-slate-400 mt-1">Description</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-slate-700 border-t-purple-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div>
            {/* Your page content */}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
```

## Development Tips

1. **Always wrap page content with DashboardLayout** - Provides sidebar and auth protection
2. **Use TypeScript types** - Import from @/lib/types for safety
3. **Handle loading states** - Show spinners while fetching data
4. **Error handling** - Always catch API errors and show user-friendly messages
5. **Responsive design** - Test on mobile using dev tools
6. **Dark theme** - Use provided color classes for consistency

## Useful Resources

- Tailwind CSS: https://tailwindcss.com/docs
- Next.js: https://nextjs.org/docs
- Lucide Icons: https://lucide.dev
- TypeScript: https://www.typescriptlang.org/docs
- Axios: https://axios-http.com/docs
