'use client';

import { useEffect, useState } from 'react';
import { useDataStore } from '@/lib/store/data-store';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PageTransition } from '@/components/ui/page-transition';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  PieLabelRenderProps
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import PlexusBackground from '@/components/PlexusBackground';

export default function ReportsPage() {
  const { 
    transactions, 
    fetchTransactions, 
    loading 
  } = useDataStore();

  const [selectedPeriod, setSelectedPeriod] = useState<'6m' | '12m' | 'all'>('6m');

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Prepare data for expense by category pie chart
  const expenseByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc: Record<string, number>, transaction) => {
      const categoryName = transaction.category?.name || 'Uncategorized';
      acc[categoryName] = (acc[categoryName] || 0) + transaction.amount;
      return acc;
    }, {});

  const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({
    name,
    value
  }));

  // Prepare data for income vs expense chart based on selected period
  const getIncomeExpenseData = () => {
    let monthsToInclude = 6; // default to 6 months
    if (selectedPeriod === '12m') monthsToInclude = 12;
    else if (selectedPeriod === 'all') monthsToInclude = Infinity;

    // Create an array of months to show
    const monthsData = Array.from({ length: Math.min(monthsToInclude, 12) }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (monthsToInclude - 1 - i));
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      
      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.transaction_date);
        return tDate.getMonth() === date.getMonth() && tDate.getFullYear() === year;
      });
      
      const monthIncome = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const monthExpenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        name: `${month} ${year}`,
        Income: monthIncome,
        Expenses: monthExpenses
      };
    });

    return monthsData;
  };

  const incomeExpenseData = getIncomeExpenseData();

  // Prepare data for monthly summary
  const monthlySummary = transactions.reduce((acc: Record<string, { income: number, expenses: number }>, transaction) => {
    const date = new Date(transaction.transaction_date);
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    
    if (!acc[monthKey]) {
      acc[monthKey] = { income: 0, expenses: 0 };
    }
    
    if (transaction.type === 'income') {
      acc[monthKey].income += transaction.amount;
    } else {
      acc[monthKey].expenses += transaction.amount;
    }
    
    return acc;
  }, {});

  // Colors for the pie chart
  const COLORS = ['#7c3aed', '#a855f7', '#c084fc', '#ddd6fe', '#ede9fe', '#f3e8ff', '#faf5ff'];

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen aurora-background p-4 md:p-6">
        <PlexusBackground />
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4 md:mb-6">Financial Reports</h1>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {formatCurrency(transactions
                  .filter(t => t.type === 'income')
                  .reduce((sum, t) => sum + t.amount, 0))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {formatCurrency(transactions
                  .filter(t => t.type === 'expense')
                  .reduce((sum, t) => sum + t.amount, 0))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Net Savings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                transactions
                  .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0) >= 0 
                  ? 'text-primary' : 'text-red-500'
              }`}>
                {formatCurrency(transactions
                  .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Period Selector */}
        <div className="flex justify-end mb-6">
          <div className="inline-flex rounded-md bg-background border border-primary/20 p-1">
            <button
              className={`px-3 py-1 text-sm rounded-md ${
                selectedPeriod === '6m' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-foreground hover:bg-primary/10'
              }`}
              onClick={() => setSelectedPeriod('6m')}
            >
              6 Months
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-md ${
                selectedPeriod === '12m' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-foreground hover:bg-primary/10'
              }`}
              onClick={() => setSelectedPeriod('12m')}
            >
              12 Months
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-md ${
                selectedPeriod === 'all' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-foreground hover:bg-primary/10'
              }`}
              onClick={() => setSelectedPeriod('all')}
            >
              All Time
            </button>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Expense by Category Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Expenses by Category</CardTitle>
              <CardDescription>Breakdown of expenses by category</CardDescription>
            </CardHeader>
            <CardContent>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }: PieLabelRenderProps) => {
                        const pct = typeof percent === 'number' ? percent : 0;
                        return `${name} ${(pct * 100).toFixed(0)}%`;
                      }}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No expense data to display
                </div>
              )}
            </CardContent>
          </Card>

          {/* Income vs Expenses Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Income vs Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              {incomeExpenseData.some(d => d.Income > 0 || d.Expenses > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart accessibilityLayer data={incomeExpenseData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <Tooltip
                      cursor={false}
                      formatter={(value) => formatCurrency(Number(value))}
                      contentStyle={{ backgroundColor: '#000000', border: '1px solid #fca311' }}
                    />
                    <Bar dataKey="Income" fill="#7c3aed" radius={4} />
                    <Bar dataKey="Expenses" fill="#a855f7" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No monthly data to display
                </div>
              )}
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
              <div className="flex gap-2 leading-none font-medium">
                Financial overview <TrendingUp className="h-4 w-4" />
              </div>
              <div className="text-muted-foreground leading-none">
                Showing income and expenses for the last 6 months
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Monthly Summary Table */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Summary</CardTitle>
            <CardDescription>Detailed monthly financial overview</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(monthlySummary).length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-primary/20">
                      <th className="text-left py-2 text-muted-foreground">Month</th>
                      <th className="text-right py-2 text-muted-foreground">Income</th>
                      <th className="text-right py-2 text-muted-foreground">Expenses</th>
                      <th className="text-right py-2 text-muted-foreground">Savings</th>
                      <th className="text-right py-2 text-muted-foreground">Savings Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(monthlySummary)
                      .sort(([a], [b]) => b.localeCompare(a)) // Sort by date descending
                      .map(([month, summary]) => {
                        const [year, monthNum] = month.split('-');
                        const date = new Date(parseInt(year), parseInt(monthNum) - 1);
                        const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
                        const savings = summary.income - summary.expenses;
                        const savingsRate = summary.income > 0 ? (savings / summary.income) * 100 : 0;
                        
                        return (
                          <tr key={month} className="border-b border-primary/10 last:border-b-0">
                            <td className="py-3">{monthName}</td>
                            <td className="py-3 text-right text-green-500">{formatCurrency(summary.income)}</td>
                            <td className="py-3 text-right text-red-500">{formatCurrency(summary.expenses)}</td>
                            <td className={`py-3 text-right ${savings >= 0 ? 'text-primary' : 'text-red-500'}`}>
                              {formatCurrency(savings)}
                            </td>
                            <td className={`py-3 text-right ${savingsRate >= 0 ? 'text-foreground' : 'text-red-500'}`}>
                              {savingsRate.toFixed(1)}%
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No monthly data to display
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}