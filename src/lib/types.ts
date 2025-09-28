// Types for the UangSakti application

export type User = {
  id: string;
  email: string;
  username: string;
  created_at: string;
};

export type Category = {
  id: string;
  user_id: string;
  name: string;
  type: 'income' | 'expense';
  created_at: string;
};

export type Transaction = {
  id: string;
  user_id: string;
  category_id?: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  transaction_date: string;
  proof_url?: string;
  created_at: string;
};

export type Budget = {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  month: number;
  year: number;
  created_at: string;
};

export type Goal = {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  created_at: string;
};

export type MonthlySummary = {
  total_income: number;
  total_expense: number;
};

export type TransactionWithCategory = Transaction & {
  category?: Category;
};