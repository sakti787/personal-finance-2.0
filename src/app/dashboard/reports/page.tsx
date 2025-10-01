'use client';

import { useEffect, useState, useRef } from 'react';
import { useDataStore } from '@/lib/store/data-store';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { PageTransition } from '@/components/ui/page-transition';
import {
  BarChart, 
  Bar, 
  XAxis, 
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Sector,
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

  const [selectedMonth, setSelectedMonth] = useState<'all' | string>('all'); // format: YYYY-MM or 'all'
  const [selectedYear, setSelectedYear] = useState<'all' | number>('all');
  const [isMobile, setIsMobile] = useState(false);
  const [activeSlice, setActiveSlice] = useState<number | null>(null);
  const pieWrapperRef = useRef<HTMLDivElement | null>(null);
  const mobilePanelRef = useRef<HTMLDivElement | null>(null);
  const initialMonthSet = useRef(false);

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

  // After transactions loaded, set default to current month if exists and not yet set
  useEffect(() => {
    if (initialMonthSet.current) return;
    if (!transactions.length) return;
    const now = new Date();
    const currentKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    const hasCurrent = transactions.some(t => {
      const d = new Date(t.transaction_date);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });
    if (hasCurrent) {
      setSelectedMonth(currentKey);
      setSelectedYear(now.getFullYear());
    }
    initialMonthSet.current = true;
  }, [transactions]);


  // Global outside tap/click listener for mobile panel
  useEffect(() => {
    if (!isMobile) return;
    function handlePointerDown(e: MouseEvent | TouchEvent) {
      if (activeSlice === null) return;
      const target = e.target as Node;
      const inChart = pieWrapperRef.current?.contains(target);
      const inPanel = mobilePanelRef.current?.contains(target);
      if (!inChart && !inPanel) {
        setActiveSlice(null);
      }
    }
    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('touchstart', handlePointerDown, { passive: true });
    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('touchstart', handlePointerDown);
    };
  }, [isMobile, activeSlice]);

  // Derive available years & months
  const allMonthsRaw = transactions.map(t => {
    const d = new Date(t.transaction_date);
    const ym = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    return ym;
  });
  const uniqueMonths = Array.from(new Set(allMonthsRaw)).sort(); // ascending
  const uniqueYears = Array.from(new Set(uniqueMonths.map(m => m.split('-')[0]))).sort();

  // Filter transactions based on selected month/year
  const filteredByYear = selectedYear === 'all'
    ? transactions
    : transactions.filter(t => new Date(t.transaction_date).getFullYear() === selectedYear);

  const filteredTransactions = selectedMonth === 'all'
    ? filteredByYear
    : filteredByYear.filter(t => {
        const d = new Date(t.transaction_date);
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
        return key === selectedMonth;
      });

  // Prepare data for expense by category pie chart
  const expenseByCategory = filteredTransactions
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
  const totalExpense = pieData.reduce((s, d) => s + d.value, 0);

  // Close active slice when filters change or data size changes
  useEffect(() => {
    setActiveSlice(null);
  }, [selectedMonth, selectedYear, pieData.length]);

  // Income vs Expenses chart data: if a specific month selected -> single point; else build last 12 months timeline
  const buildTimelineData = () => {
    if (selectedMonth !== 'all') {
      const [y, m] = selectedMonth.split('-');
      const monthLabel = new Date(parseInt(y), parseInt(m)-1).toLocaleString('default', { month: 'short', year: 'numeric' });
      const monthTx = filteredTransactions;
      return [{
        name: monthLabel,
        Income: monthTx.filter(t => t.type==='income').reduce((s,t)=>s+t.amount,0),
        Expenses: monthTx.filter(t => t.type==='expense').reduce((s,t)=>s+t.amount,0),
      }];
    }
    // Build last up to 12 months from now constrained by selectedYear if set
    const now = new Date();
    const points: { name: string; Income: number; Expenses: number }[] = [];
    for (let i=11;i>=0;i--) {
      const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
      if (selectedYear !== 'all' && d.getFullYear() !== selectedYear) continue;
      const monthTx = filteredTransactions.filter(t => {
        const td = new Date(t.transaction_date);
        return td.getFullYear() === d.getFullYear() && td.getMonth() === d.getMonth();
      });
      const label = d.toLocaleString('default', { month: 'short' });
      points.push({
        name: `${label} ${d.getFullYear()}`,
        Income: monthTx.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0),
        Expenses: monthTx.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0),
      });
    }
    // Remove leading empty months if all zero
    return points.filter(p => p.Income>0 || p.Expenses>0 || points.every(x=>x.Income===0 && x.Expenses===0));
  };
  const incomeExpenseData = buildTimelineData();

  // Prepare data for monthly summary
  const monthlySummary = filteredTransactions.reduce((acc: Record<string, { income: number, expenses: number }>, transaction) => {
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
                {formatCurrency(filteredTransactions
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
                {formatCurrency(filteredTransactions
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
                {formatCurrency(filteredTransactions
                  .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters: Month & Year */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 sm:items-end">
          <div className="flex flex-col w-full sm:w-60">
            <label className="text-xs font-medium mb-1 text-muted-foreground">Month</label>
            <Select value={selectedMonth} onValueChange={(val) => setSelectedMonth(val === 'all' ? 'all' : val)}>
              <SelectTrigger className="bg-background border border-primary/20">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                {uniqueMonths.map(m => {
                  const [y, mo] = m.split('-');
                  const label = new Date(parseInt(y), parseInt(mo)-1).toLocaleString('default', { month: 'long' });
                  return <SelectItem key={m} value={m}>{label}</SelectItem>;
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col w-full sm:w-40">
            <label className="text-xs font-medium mb-1 text-muted-foreground">Year</label>
            <Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(val === 'all' ? 'all' : parseInt(val))}>
              <SelectTrigger className="bg-background border border-primary/20">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {uniqueYears.map(y => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                <>
                <div ref={pieWrapperRef}>
                  <ChartContainer
                    config={chartConfig}
                    className={`[&_.recharts-pie-label-text]:fill-foreground mx-auto ${isMobile ? 'aspect-square max-h-[200px]' : 'aspect-square max-h-[340px]'} pb-0 overflow-visible relative`}
                  >
                    <PieChart margin={{ top: 16, right: 40, bottom: 16, left: 40 }}>
                      {!isMobile && (
                        <ChartTooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                                  <p className="font-medium text-foreground">{data.name}</p>
                                  <p className="text-sm text-muted-foreground">{formatCurrency(Number(data.value))}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      )}
                      <Pie
                        data={pieData}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={isMobile ? undefined : ({ percent }: PieLabelRenderProps) => {
                          const pct = typeof percent === 'number' ? percent : 0;
                          return `${(pct * 100).toFixed(0)}%`;
                        }}
                        nameKey="name"
                        outerRadius={isMobile ? 60 : 110}
                        activeIndex={activeSlice === null ? undefined : activeSlice}
                        onClick={(_, index) => {
                          if (!isMobile) return;
                          setActiveSlice(prev => prev === index ? null : index);
                        }}
                        activeShape={(props: unknown) => {
                          interface ActiveShapeData {
                            outerRadius?: number;
                            [key: string]: unknown;
                          }
                          const p = props as ActiveShapeData;
                          const outer = (typeof p.outerRadius === 'number' ? p.outerRadius : 0) + 6;
                          return <Sector {...(p as object)} outerRadius={outer} />;
                        }}
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            strokeWidth={activeSlice === index ? 2 : 1}
                            className={isMobile ? 'cursor-pointer' : ''}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                </div>
                  {/* Mobile persistent info panel */}
                  {isMobile && activeSlice !== null && pieData[activeSlice] && (
                    <div ref={mobilePanelRef} className="mt-3 text-xs sm:text-sm bg-white/5 dark:bg-neutral-900/30 px-3 py-2 rounded-lg border border-white/10 flex flex-col items-center animate-fade-in">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="h-3 w-3 rounded-full" style={{ background: COLORS[activeSlice % COLORS.length] }} />
                        <span className="font-medium">{pieData[activeSlice].name}</span>
                      </div>
                      <div className="text-muted-foreground font-mono">{formatCurrency(pieData[activeSlice].value)}</div>
                      <button
                        onClick={() => setActiveSlice(null)}
                        className="mt-2 text-[10px] uppercase tracking-wide text-primary hover:underline"
                      >Tutup</button>
                    </div>
                  )}
                  <div className="mt-4 flex flex-wrap gap-3 justify-center text-xs sm:text-sm">
                    {pieData.map((d, i) => {
                      const pct = totalExpense > 0 ? (d.value / totalExpense) * 100 : 0;
                      return (
                        <div key={d.name} className="flex items-center gap-2 bg-white/5 dark:bg-neutral-900/30 px-2 py-1 rounded-full border border-white/10">
                          <span className="h-3 w-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                          <span className="font-medium truncate max-w-[6rem] sm:max-w-[10rem]" title={d.name}>{d.name}</span>
                          <span className="text-muted-foreground">{pct.toFixed(0)}%</span>
                        </div>
                      );
                    })}
                  </div>
                </>
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
                {selectedMonth === 'all' && selectedYear === 'all' ? 'Showing all available data' : selectedMonth === 'all' ? `Showing data for year ${selectedYear}` : (() => { const [y,m]=selectedMonth.split('-'); return `Showing data for ${new Date(parseInt(y), parseInt(m)-1).toLocaleString('default',{ month:'long', year:'numeric'})}` })()}
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