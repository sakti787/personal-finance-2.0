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
  PieChart,
  Pie,
  Cell,
  PieLabelRenderProps
} from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { TrendingUp } from 'lucide-react';
import PlexusBackground from '@/components/PlexusBackground';

export default function ReportsPage() {
  const { 
    transactions, 
    fetchTransactions, 
    loading 
  } = useDataStore();

  const [selectedPeriod, setSelectedPeriod] = useState<'6m' | '12m' | 'all'>('6m');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // Create chart config for pie chart
  const chartConfig = pieData.reduce((config, item, index) => {
    config[item.name.toLowerCase().replace(/\s+/g, '')] = {
      label: item.name,
      color: COLORS[index % COLORS.length],
    };
    return config;
  }, {
    value: {
      label: "Amount",
    },
  } as ChartConfig);

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
            <CardContent className="p-4 md:p-6">
              {pieData.length > 0 ? (
                <ChartContainer
                  config={chartConfig}
                  className={`[&_.recharts-pie-label-text]:fill-foreground mx-auto ${isMobile ? 'aspect-square max-h-[180px]' : 'aspect-square max-h-[300px]'} pb-0`}
                >
                  <PieChart margin={{ top: 20, right: 50, bottom: 20, left: 30 }}>
                    <ChartTooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                              <p className="font-medium text-foreground">{data.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatCurrency(Number(data.value))}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Pie 
                      data={pieData} 
                      dataKey="value" 
                      cx="50%"
                      cy="50%"
                      labelLine={isMobile ? true : true}
                      label={isMobile ? ({ percent }: PieLabelRenderProps) => {
                        const pct = typeof percent === 'number' ? percent : 0;
                        return `${(pct * 100).toFixed(0)}%`;
                      } : ({ name, percent }: PieLabelRenderProps) => {
                        const pct = typeof percent === 'number' ? percent : 0;
                        return `${name} ${(pct * 100).toFixed(0)}%`;
                      }}
                      nameKey="name"
                      outerRadius={isMobile ? 50 : 100}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
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
                <ChartContainer
                  config={{
                    Income: {
                      label: "Income",
                      color: "#7c3aed",
                    },
                    Expenses: {
                      label: "Expenses", 
                      color: "#a855f7",
                    },
                  }}
                  className="h-[300px] w-full"
                >
                  <BarChart accessibilityLayer data={incomeExpenseData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <ChartTooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                              <p className="font-medium text-foreground mb-2">{label}</p>
                              {payload.map((entry, index) => (
                                <p key={index} className="text-sm text-muted-foreground">
                                  <span style={{ color: entry.color }}>{entry.dataKey}:</span>  {formatCurrency(Number(entry.value))}
                                </p>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      }}
                      cursor={false}
                    />
                    <Bar dataKey="Income" fill="#7c3aed" radius={4} />
                    <Bar dataKey="Expenses" fill="#a855f7" radius={4} />
                  </BarChart>
                </ChartContainer>
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
          <CardContent className="p-0 md:p-6">
            {Object.keys(monthlySummary).length > 0 ? (
              <div className="overflow-x-auto w-full p-1 md:p-0">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-primary/20">
                      <th className="text-left py-2 px-2 md:py-2 md:px-0 text-muted-foreground text-xs md:text-sm">Month</th>
                      <th className="text-right py-2 px-2 md:py-2 md:px-0 text-muted-foreground text-xs md:text-sm">Income</th>
                      <th className="text-right py-2 px-2 md:py-2 md:px-0 text-muted-foreground text-xs md:text-sm">Expenses</th>
                      <th className="text-right py-2 px-2 md:py-2 md:px-0 text-muted-foreground text-xs md:text-sm">Savings</th>
                      <th className="text-right py-2 px-2 md:py-2 md:px-0 text-muted-foreground text-xs md:text-sm">Savings Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(monthlySummary)
                      .sort(([a], [b]) => b.localeCompare(a)) // Sort by date descending
                      .map(([month, summary]) => {
                        const [year, monthNum] = month.split('-');
                        const date = new Date(parseInt(year), parseInt(monthNum) - 1);
                        const monthName = date.toLocaleString('default', { month: 'short', year: 'numeric' });
                        const savings = summary.income - summary.expenses;
                        const savingsRate = summary.income > 0 ? (savings / summary.income) * 100 : 0;
                        
                        return (
                          <tr key={month} className="border-b border-primary/10 last:border-b-0">
                            <td className="py-2 px-2 md:py-3 md:px-0 text-xs md:text-sm">{monthName}</td>
                            <td className="py-2 px-2 md:py-3 md:px-0 text-right text-green-500 text-xs md:text-sm">{formatCurrency(summary.income)}</td>
                            <td className="py-2 px-2 md:py-3 md:px-0 text-right text-red-500 text-xs md:text-sm">{formatCurrency(summary.expenses)}</td>
                            <td className={`py-2 px-2 md:py-3 md:px-0 text-right text-xs md:text-sm ${savings >= 0 ? 'text-primary' : 'text-red-500'}`}>
                              {formatCurrency(savings)}
                            </td>
                            <td className={`py-2 px-2 md:py-3 md:px-0 text-right text-xs md:text-sm ${savingsRate >= 0 ? 'text-foreground' : 'text-red-500'}`}>
                              {savingsRate.toFixed(1)}%
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground px-6">
                No monthly data to display
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}