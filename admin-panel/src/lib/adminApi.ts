import api from './api';

export async function getDashboardStats() {
  const response = await api.get('/admin/stats');
  return response.data;
}

export async function getUsers(params = {}) {
  const response = await api.get('/admin/users', { params });
  return response.data;
}

export async function updateUserBalance(userId: string, amount: number) {
  const response = await api.patch(`/admin/users/${userId}/balance`, { amount });
  return response.data;
}

export async function toggleUserBan(userId: string, banned: boolean) {
  const response = await api.patch(`/admin/users/${userId}/ban`, { banned });
  return response.data;
}

export async function getAdminTransactions(params = {}) {
  const response = await api.get('/admin/transactions', { params });
  return response.data;
}

export async function getAdminWithdrawals(params = {}) {
  const response = await api.get('/admin/withdrawals', { params });
  return response.data;
}

export async function approveWithdrawal(withdrawalId: string, adminNote?: string) {
  const response = await api.post(`/admin/withdrawals/${withdrawalId}/approve`, { adminNote });
  return response.data;
}

export async function rejectWithdrawal(withdrawalId: string, adminNote?: string) {
  const response = await api.post(`/admin/withdrawals/${withdrawalId}/reject`, { adminNote });
  return response.data;
}

export async function forceColorOutcome(roundId: string, outcome: string) {
  const response = await api.post('/admin/color-prediction/force-outcome', { roundId, outcome });
  return response.data;
}

export async function forceAviatorCrash(roundId: string, crashMultiplier: number) {
  const response = await api.post('/admin/aviator/force-crash', { roundId, crashMultiplier });
  return response.data;
}
