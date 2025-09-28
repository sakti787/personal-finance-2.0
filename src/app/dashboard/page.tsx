'use client';

import { useDataStore } from '@/lib/store/data-store';
import { useEffect, useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedCard } from '@/components/ui/animated-card';
import { PageTransition } from '@/components/ui/page-transition';
import AddTransactionContainer from '@/components/auth/add-transaction-container';


export default function DashboardPage() {
  // State untuk preview bukti di recent transaction
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const { 
    transactions, 
    fetchTransactions
  } = useDataStore();

  // Hitung summary
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpenses;

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageTransition>
      <div className="bg-[#14213d] min-h-screen py-8 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Dashboard</h1>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="bg-[#fca311] text-black hover:bg-[#ffb933] px-6 py-3 rounded-lg flex items-center gap-2 font-semibold shadow transition-colors duration-150"
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <AnimatedCard delay={0.1}>
              <CardHeader className="pb-2 flex flex-col items-center">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m0 0l-3-3m3 3l3-3" /></svg>
                  <CardTitle className="text-base font-semibold text-muted-foreground">Total Income</CardTitle>
                </div>
                <div className="text-4xl font-extrabold text-green-400 text-center">{formatCurrency(totalIncome)}</div>
              </CardHeader>
            </AnimatedCard>
            <AnimatedCard delay={0.2}>
              <CardHeader className="pb-2 flex flex-col items-center">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16V8m0 0l-3 3m3-3l3 3" /></svg>
                  <CardTitle className="text-base font-semibold text-muted-foreground">Total Expenses</CardTitle>
                </div>
                <div className="text-4xl font-extrabold text-red-400 text-center">{formatCurrency(totalExpenses)}</div>
              </CardHeader>
            </AnimatedCard>
            <AnimatedCard delay={0.3}>
              <CardHeader className="pb-2 flex flex-col items-center">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-[#fca311]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#fca311" strokeWidth="2" fill="none" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8" /></svg>
                  <CardTitle className="text-base font-semibold text-muted-foreground">Balance</CardTitle>
                </div>
                <div className={`text-4xl font-extrabold text-center ${balance >= 0 ? 'text-[#fca311]' : 'text-red-400'}`}>{formatCurrency(balance)}</div>
              </CardHeader>
            </AnimatedCard>
          </div>
          {/* Recent Transactions Preview */}
          <AnimatedCard title="Recent Transactions" delay={0.6}>
            <CardContent>
              {transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full rounded-lg overflow-hidden">
                    <thead>
                      <tr className="border-b border-slate-700 bg-[#1a2341]">
                        <th className="text-left py-3 px-4 font-semibold text-slate-400">Description</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-400">Category</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-400">Date</th>
                        <th className="text-center py-3 px-4 font-semibold text-slate-400">Bukti</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-400">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.slice(0, 5).map((transaction: import('@/lib/types').TransactionWithCategory) => (
                        <tr key={transaction.id} className="border-b border-slate-800 hover:bg-primary/5 transition-colors">
                          <td className="py-3 px-4 align-middle flex items-center gap-2">
                            {transaction.type === 'income' ? (
                              <ArrowUpCircle className="w-5 h-5 text-green-400" />
                            ) : (
                              <ArrowDownCircle className="w-5 h-5 text-red-400" />
                            )}
                            <span>{transaction.description}</span>
                          </td>
                          <td className="py-3 px-4 align-middle">{transaction.category?.name || <span className="text-xs text-muted-foreground italic">-</span>}</td>
                          <td className="py-3 px-4 align-middle">{transaction.transaction_date ? new Date(transaction.transaction_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : <span className="text-xs text-muted-foreground italic">-</span>}</td>
                          <td className="py-3 px-4 align-middle text-center">
                            {transaction.proof_url ? (
                              <button
                                className="underline text-primary hover:text-orange-500 text-xs"
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
                          <td className={`py-3 px-4 text-right align-middle font-bold ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No transactions yet. Add your first transaction!
                </div>
              )}
            </CardContent>
          </AnimatedCard>
          {/* Modal Preview Foto Bukti Recent Transaction */}
          <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
            <DialogContent className="flex flex-col items-center max-w-xl">
              <DialogHeader>
                <DialogTitle>Preview Bukti</DialogTitle>
              </DialogHeader>
              {previewImageUrl && (
                <Image
                  src={previewImageUrl}
                  alt="Preview Bukti"
                  className="max-h-[60vh] w-auto rounded-md border border-slate-700 shadow-lg"
                  style={{ maxWidth: '100%' }}
                  width={600}
                  height={400}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </PageTransition>
  );
}