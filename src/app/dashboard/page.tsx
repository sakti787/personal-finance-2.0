'use client';

import { useDataStore } from '@/lib/store/data-store';
import { useEffect, useState, useMemo } from 'react';
import { formatCurrency } from '@/lib/utils';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedCard } from '@/components/ui/animated-card';
import { PageTransition } from '@/components/ui/page-transition';
import AddTransactionContainer from '@/components/auth/add-transaction-container';
import PlexusBackground from '@/components/PlexusBackground';


export default function DashboardPage() {
  // State untuk preview bukti di recent transaction
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { 
    transactions, 
    fetchTransactions
  } = useDataStore();

  // Memoized calculations untuk performa
  const totalIncome = useMemo(() => 
    transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );
  
  const totalExpenses = useMemo(() => 
    transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );
  
  const balance = useMemo(() => totalIncome - totalExpenses, [totalIncome, totalExpenses]);
  
  // Memoized recent transactions untuk performa
  const recentTransactions = useMemo(() => 
    transactions.slice(0, 5), 
    [transactions]
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchTransactions();
      setLoading(false);
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageTransition>
      <div className="min-h-screen aurora-background py-8 px-4 md:px-8">
        <PlexusBackground />
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">Dashboard</h1>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="bg-primary text-white hover:bg-primary/90 px-4 md:px-6 py-2 md:py-3 rounded-lg flex items-center gap-2 font-semibold shadow hover:shadow-lg transition-all duration-300 text-sm md:text-base w-full sm:w-auto justify-center"
                  onClick={() => setIsDialogOpen(true)}
                >
                  <span className="font-semibold">Add Transaction</span>
                </button>
              </DialogTrigger>
              <DialogContent className="p-0 border-none bg-transparent shadow-none w-auto h-auto">
                <DialogTitle className="sr-only">Add Transaction</DialogTitle>
                <AddTransactionContainer onSuccess={() => { setIsDialogOpen(false); fetchTransactions(); }} />
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
            <AnimatedCard delay={0.1} className="card-glass">
              <CardHeader className="pb-2 flex flex-col items-center">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-success" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m0 0l-3-3m3 3l3-3" /></svg>
                  <CardTitle className="text-sm md:text-base font-semibold text-muted-foreground">Total Income</CardTitle>
                </div>
                <div className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-success text-center">{formatCurrency(totalIncome)}</div>
              </CardHeader>
            </AnimatedCard>
            <AnimatedCard delay={0.2} className="card-glass">
              <CardHeader className="pb-2 flex flex-col items-center">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-danger" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16V8m0 0l-3 3m3-3l3 3" /></svg>
                  <CardTitle className="text-sm md:text-base font-semibold text-muted-foreground">Total Expenses</CardTitle>
                </div>
                <div className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-danger text-center">{formatCurrency(totalExpenses)}</div>
              </CardHeader>
            </AnimatedCard>
            <AnimatedCard delay={0.3} className="card-glass">
              <CardHeader className="pb-2 flex flex-col items-center">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#3B82F6" strokeWidth="2" fill="none" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8" /></svg>
                  <CardTitle className="text-sm md:text-base font-semibold text-muted-foreground">Balance</CardTitle>
                </div>
                <div className={`text-2xl md:text-3xl lg:text-4xl font-extrabold text-center ${balance >= 0 ? 'text-success' : 'text-danger'}`}>{formatCurrency(balance)}</div>
              </CardHeader>
            </AnimatedCard>
          </div>
          {/* Recent Transactions Preview */}
          <AnimatedCard title="Recent Transactions" delay={0.6} className="card-glass">
            <CardContent className="p-0 md:p-6">
              {recentTransactions.length > 0 ? (
                <div className="overflow-x-auto w-full p-1 md:p-0">
                  <table className="w-full min-w-[600px] rounded-lg overflow-hidden">
                    <thead>
                      <tr className="border-b border-border bg-card/50 backdrop-blur-sm">
                        <th className="text-left py-2 px-2 md:py-3 md:px-4 font-semibold text-muted-foreground text-xs md:text-sm">Description</th>
                        <th className="text-left py-2 px-2 md:py-3 md:px-4 font-semibold text-muted-foreground text-xs md:text-sm">Category</th>
                        <th className="text-left py-2 px-2 md:py-3 md:px-4 font-semibold text-muted-foreground text-xs md:text-sm">Date</th>
                        <th className="text-center py-2 px-2 md:py-3 md:px-4 font-semibold text-muted-foreground text-xs md:text-sm">Bukti</th>
                        <th className="text-right py-2 px-2 md:py-3 md:px-4 font-semibold text-muted-foreground text-xs md:text-sm">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTransactions.map((transaction: import('@/lib/types').TransactionWithCategory) => (
                        <tr key={transaction.id} className="border-b border-border/50 hover:bg-card/30 transition-colors backdrop-blur-sm">
                          <td className="py-2 px-2 md:py-3 md:px-4 align-middle flex items-center gap-1 md:gap-2">
                            {transaction.type === 'income' ? (
                              <ArrowUpCircle className="w-4 h-4 md:w-5 md:h-5 text-green-400 flex-shrink-0" />
                            ) : (
                              <ArrowDownCircle className="w-4 h-4 md:w-5 md:h-5 text-red-400 flex-shrink-0" />
                            )}
                            <span className="text-xs md:text-sm truncate max-w-[120px] md:max-w-none">{transaction.description}</span>
                          </td>
                          <td className="py-2 px-2 md:py-3 md:px-4 align-middle text-xs md:text-sm">{transaction.category?.name || <span className="text-xs text-muted-foreground italic">-</span>}</td>
                          <td className="py-2 px-2 md:py-3 md:px-4 align-middle text-xs md:text-sm">{transaction.transaction_date ? new Date(transaction.transaction_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : <span className="text-xs text-muted-foreground italic">-</span>}</td>
                          <td className="py-2 px-2 md:py-3 md:px-4 align-middle text-center">
                            {transaction.proof_url ? (
                              <button
                                className="text-primary hover:text-orange-500 text-xs"
                                onClick={() => {
                                  setPreviewImageUrl(transaction.proof_url ?? null);
                                  setPreviewModalOpen(true);
                                }}
                              >
                                Lihat
                              </button>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">-</span>
                            )}
                          </td>
                          <td className={`py-2 px-2 md:py-3 md:px-4 text-right align-middle font-bold text-xs md:text-sm ${transaction.type === 'income' ? 'text-success' : 'text-danger'}`}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground px-6">
                  No transactions yet. Add your first transaction!
                </div>
              )}
            </CardContent>
          </AnimatedCard>
          {/* Modal Preview Foto Bukti Recent Transaction */}
          <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
            <DialogContent className="card-glass flex flex-col items-center max-w-xl border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">Preview Bukti</DialogTitle>
              </DialogHeader>
              {previewImageUrl && (
                <Image
                  src={previewImageUrl}
                  alt="Preview Bukti"
                  className="max-h-[60vh] w-auto rounded-md border border-border shadow-lg"
                  style={{ maxWidth: '100%' }}
                  width={600}
                  height={400}
                  loading="lazy"
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </PageTransition>
  );
}