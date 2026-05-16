// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  admin: Admin;
}

export interface Admin {
  _id: string;
  email: string;
  name: string;
  role: "admin" | "super_admin";
}

// User Types
export interface User {
  _id: string;
  email: string;
  username: string;
  walletBalance: number;
  isBanned?: boolean;
  createdAt: string;
  updatedAt?: string;
  referralCode?: string;
}

export interface UserListResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminTransaction {
  _id: string;
  userId: string;
  userEmail: string;
  username: string;
  type: string;
  amount: number;
  balanceAfter: number;
  createdAt: string;
  meta?: Record<string, any>;
}

export interface AdminTransactionListResponse {
  data: AdminTransaction[];
  total: number;
  page: number;
  limit: number;
}


// Game Types
export interface ColorPredictionRound {
  _id: string;
  roundNumber: number;
  status: "waiting" | "running" | "completed";
  manualResult?: string;
  result?: string;
  timestamp: number;
  createdAt: string;
}

export interface AviatorRound {
  _id: string;
  roundNumber: number;
  status: "waiting" | "running" | "crashed";
  crashMultiplier?: number;
  manualCrashMultiplier?: number;
  createdAt: string;
}

// Withdrawal Types
export interface Withdrawal {
  _id: string;
  userId: string | { email?: string; username?: string; walletBalance?: number };
  userEmail?: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  withdrawalMethod?: string;
  accountDetails?: Record<string, any>;
  reason?: string;
  approvedBy?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WithdrawalListResponse {
  data: Withdrawal[];
  total: number;
  page: number;
  pages: number;
}

// Transaction Types
export interface Transaction {
  _id: string;
  userId: string;
  userEmail: string;
  type: "deposit" | "withdrawal" | "bet" | "win" | "referral";
  amount: number;
  game?: string;
  roundId?: string;
  status: "success" | "pending" | "failed";
  description?: string;
  createdAt: string;
}

export interface TransactionListResponse {
  data: Transaction[];
  total: number;
  page: number;
  pages: number;
}

// Dashboard Stats
export interface DashboardStats {
  totalUsers: number;
  totalBalance: number;
  todaysProfit: number;
  activeGames: number;
  pendingWithdrawals: number;
  totalDeposits: number;
  totalWithdrawals: number;
  revenueByDay?: Array<{ date: string; revenue: number }>;
}

// Settings Types
export interface Settings {
  _id: string;
  commissionRates: {
    colorPrediction: number;
    aviator: number;
  };
  referralLevels: Array<{
    level: number;
    percentage: number;
  }>;
  maintenanceMode: boolean;
  minWithdrawal: number;
  maxWithdrawal: number;
}
