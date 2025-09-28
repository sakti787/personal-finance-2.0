import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { Category, Transaction, Budget, Goal, TransactionWithCategory } from '@/lib/types';

const supabase = createClient();

type DataState = {
  categories: Category[];
  transactions: TransactionWithCategory[];
  budgets: Budget[];
  goals: Goal[];
  loading: boolean;
  error: string | null;
};

type DataActions = {
  fetchCategories: () => Promise<void>;
  addCategory: (category: Omit<Category, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  fetchTransactions: () => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  
  fetchBudgets: () => Promise<void>;
  addBudget: (budget: Omit<Budget, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateBudget: (id: string, updates: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  
  fetchGoals: () => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  updateGoalAmount: (id: string, amount: number) => Promise<void>;
  
  reset: () => void;
};

export const useDataStore = create<DataState & DataActions>((set) => ({
  categories: [],
  transactions: [],
  budgets: [],
  goals: [],
  loading: false,
  error: null,

  fetchCategories: async () => {
    set({ loading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      set({ categories: data || [], loading: false });
    } catch (error: unknown) {
      set({ error: error instanceof Error ? error.message : String(error), loading: false });
    }
  },

  addCategory: async (category) => {
    set({ loading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const newCategory = {
        ...category,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('categories')
        .insert([newCategory])
        .select()
        .single();

      if (error) throw error;

      set((state) => ({ categories: [...state.categories, data], loading: false }));
    } catch (error: unknown) {
      set({ error: error instanceof Error ? error.message : String(error), loading: false });
    }
  },

  updateCategory: async (id, updates) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        categories: state.categories.map(cat => cat.id === id ? data : cat),
        loading: false
      }));
    } catch (error: unknown) {
      set({ error: error instanceof Error ? error.message : String(error), loading: false });
    }
  },

  deleteCategory: async (id) => {
    set({ loading: true });
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        categories: state.categories.filter(cat => cat.id !== id),
        loading: false
      }));
    } catch (error: unknown) {
      set({ error: error instanceof Error ? error.message : String(error), loading: false });
    }
  },

  fetchTransactions: async () => {
    set({ loading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          category:categories(name)
        `)
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false });

      if (error) throw error;

      set({ transactions: data || [], loading: false });
    } catch (error: unknown) {
      set({ error: error instanceof Error ? error.message : String(error), loading: false });
    }
  },

  addTransaction: async (transaction) => {
    set({ loading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const newTransaction = {
        ...transaction,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('transactions')
        .insert([newTransaction])
        .select(`
          *,
          category:categories(name)
        `)
        .single();

      if (error) throw error;

      set((state) => ({ transactions: [data, ...state.transactions], loading: false }));
    } catch (error: unknown) {
      set({ error: error instanceof Error ? error.message : String(error), loading: false });
    }
  },

  updateTransaction: async (id, updates) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          category:categories(name)
        `)
        .single();

      if (error) throw error;

      set((state) => ({
        transactions: state.transactions.map(trans => trans.id === id ? data : trans),
        loading: false
      }));
    } catch (error: unknown) {
      set({ error: error instanceof Error ? error.message : String(error), loading: false });
    }
  },

  deleteTransaction: async (id) => {
    set({ loading: true });
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        transactions: state.transactions.filter(trans => trans.id !== id),
        loading: false
      }));
    } catch (error: unknown) {
      set({ error: error instanceof Error ? error.message : String(error), loading: false });
    }
  },

  fetchBudgets: async () => {
    set({ loading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      set({ budgets: data || [], loading: false });
    } catch (error: unknown) {
      set({ error: error instanceof Error ? error.message : String(error), loading: false });
    }
  },

  addBudget: async (budget) => {
    set({ loading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const newBudget = {
        ...budget,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('budgets')
        .insert([newBudget])
        .select()
        .single();

      if (error) throw error;

      set((state) => ({ budgets: [...state.budgets, data], loading: false }));
    } catch (error: unknown) {
      set({ error: error instanceof Error ? error.message : String(error), loading: false });
    }
  },

  updateBudget: async (id, updates) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('budgets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        budgets: state.budgets.map(b => b.id === id ? data : b),
        loading: false
      }));
    } catch (error: unknown) {
      set({ error: error instanceof Error ? error.message : String(error), loading: false });
    }
  },

  deleteBudget: async (id) => {
    set({ loading: true });
    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        budgets: state.budgets.filter(b => b.id !== id),
        loading: false
      }));
    } catch (error: unknown) {
      set({ error: error instanceof Error ? error.message : String(error), loading: false });
    }
  },

  fetchGoals: async () => {
    set({ loading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      set({ goals: data || [], loading: false });
    } catch (error: unknown) {
      set({ error: error instanceof Error ? error.message : String(error), loading: false });
    }
  },

  addGoal: async (goal) => {
    set({ loading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const newGoal = {
        ...goal,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('goals')
        .insert([newGoal])
        .select()
        .single();

      if (error) throw error;

      set((state) => ({ goals: [...state.goals, data], loading: false }));
    } catch (error: unknown) {
      set({ error: error instanceof Error ? error.message : String(error), loading: false });
    }
  },

  updateGoal: async (id, updates) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        goals: state.goals.map(g => g.id === id ? data : g),
        loading: false
      }));
    } catch (error: unknown) {
      set({ error: error instanceof Error ? error.message : String(error), loading: false });
    }
  },

  updateGoalAmount: async (id, amount) => {
    set({ loading: true });
    try {
      // Get current goal to check the existing current amount
      const { data: currentGoal, error: fetchError } = await supabase
        .from('goals')
        .select('current_amount, target_amount')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Calculate new amount (add to current amount)
      const newAmount = Math.min(
        currentGoal.current_amount + amount,
        currentGoal.target_amount
      );

      const { data, error } = await supabase
        .from('goals')
        .update({ current_amount: newAmount })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        goals: state.goals.map(g => g.id === id ? data : g),
        loading: false
      }));
    } catch (error: unknown) {
      set({ error: error instanceof Error ? error.message : String(error), loading: false });
    }
  },

  deleteGoal: async (id) => {
    set({ loading: true });
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        goals: state.goals.filter(g => g.id !== id),
        loading: false
      }));
    } catch (error: unknown) {
      set({ error: error instanceof Error ? error.message : String(error), loading: false });
    }
  },

  reset: () => set({ 
    categories: [], 
    transactions: [], 
    budgets: [], 
    goals: [], 
    loading: false,
    error: null
  }),
}));