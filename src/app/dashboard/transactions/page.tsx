'use client';

import AddTransactionContainer from '@/components/auth/add-transaction-container';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogTrigger } from '@/components/ui/dialog';
import { AnimatedCard } from '@/components/ui/animated-card';
import { CardContent } from '@/components/ui/card';
import { PageTransition } from '@/components/ui/page-transition';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useDataStore } from '@/lib/store/data-store';
import type { Transaction } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function TransactionsPage() {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  // Default: show newest (most recent date) first -> descending
  const [sortDateAsc, setSortDateAsc] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const {
    transactions,
    loading,
    fetchTransactions,
    deleteTransaction,
    // ...other states and functions
  } = useDataStore();

  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
  const [filterMonth, setFilterMonth] = useState<number>(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll lock no longer needed after layout refactor; removed.


  // Dynamic years & months based on existing transactions
  const availableYearsSet = new Set<number>();
  const yearToMonths: Record<number, Set<number>> = {};
  transactions.forEach(t => {
    const d = new Date(t.transaction_date);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    availableYearsSet.add(y);
    if (!yearToMonths[y]) yearToMonths[y] = new Set<number>();
    yearToMonths[y].add(m);
  });
  const years = Array.from(availableYearsSet).sort((a,b)=>a-b);
  const months = (yearToMonths[filterYear] ? Array.from(yearToMonths[filterYear]) : [])
    .sort((a,b)=>a-b)
    .map(m => ({ value: m, label: new Date(0, m-1).toLocaleString('default', { month: 'long' }) }));

  // Ensure current selected year/month remain valid
  useEffect(() => {
    if (years.length && !years.includes(filterYear)) {
      setFilterYear(years[years.length - 1]); // pick latest year
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions]);

  useEffect(() => {
    if (months.length && !months.find(m => m.value === filterMonth)) {
      setFilterMonth(months[months.length - 1].value); // pick latest month existing in that year
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterYear, transactions]);

  // Ambil semua kategori unik dari transaksi
  const categories = Array.from(new Set(transactions.map(t => t.category?.name).filter(Boolean)));

  // Filter + search + sort memoized
  const filteredTransactions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const base = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.transaction_date);
      const transactionMonth = transactionDate.getMonth() + 1;
      const transactionYear = transactionDate.getFullYear();
      const matchMonthYear = transactionMonth === filterMonth && transactionYear === filterYear;
      const matchCategory = filterCategory === 'all' || (transaction.category?.name === filterCategory);
      const matchSearch = q === '' || (transaction.description || '').toLowerCase().includes(q);
      return matchMonthYear && matchCategory && matchSearch;
    });
    return base.sort((a, b) => {
      const dateA = new Date(a.transaction_date).getTime();
      const dateB = new Date(b.transaction_date).getTime();
      return sortDateAsc ? dateA - dateB : dateB - dateA;
    });
  }, [transactions, filterMonth, filterYear, filterCategory, searchQuery, sortDateAsc]);

  // Reset filters & search back to initial defaults (current month/year, all category, newest first)
  const handleResetFilters = () => {
    setFilterCategory('all');
    setSearchQuery('');
    setSortDateAsc(false); // newest first
    const now = new Date();
    setFilterMonth(now.getMonth() + 1);
    setFilterYear(now.getFullYear());
  };

  return (
    <PageTransition>
      <div className="min-h-screen aurora-background p-4 md:p-6">
        <div className="mb-4 md:mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Transactions</h1>
          {/* Unified Dialog for desktop & mobile */}
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditTransaction(null);
          }}>
            {/* Desktop trigger */}
            <div className="hidden sm:block mt-3">
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="mt-2 bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2 rounded font-semibold"
                  onClick={() => {
                    setEditTransaction(null);
                    setIsDialogOpen(true);
                  }}
                >
                  Add Transaction
                </button>
              </DialogTrigger>
            </div>
            <DialogContent transparent className="p-0">
              <DialogTitle className="sr-only">{editTransaction ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
              <AddTransactionContainer
                onSuccess={() => {
                  setIsDialogOpen(false);
                  setEditTransaction(null);
                }}
                editData={editTransaction}
              />
            </DialogContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mt-4 sm:mt-6">
            {/* Filter Dropdowns */}
            {/* Desktop: horizontal filter */}
            <div className="hidden sm:flex flex-col gap-2">
              <div className="flex gap-2">
              {/* Filter kategori */}
              <Select
                value={filterCategory}
                onValueChange={setFilterCategory}
              >
                <SelectTrigger className="w-[140px] bg-card border border-primary/20">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    cat ? <SelectItem key={cat} value={cat}>{cat}</SelectItem> : null
                  ))}
                </SelectContent>
              </Select>
              {/* Filter bulan */}
              <Select
                value={filterMonth.toString()}
                onValueChange={(value) => setFilterMonth(parseInt(value))}
                disabled={!months.length}
              >
                <SelectTrigger className="w-[120px] bg-card border border-primary/20">
                  <SelectValue placeholder={months.length ? 'Month' : 'No Month'} />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month.value} value={month.value.toString()}>{month.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filterYear.toString()}
                onValueChange={(value) => setFilterYear(parseInt(value))}
                disabled={!years.length}
              >
                <SelectTrigger className="w-[100px] bg-card border border-primary/20">
                  <SelectValue placeholder={years.length ? 'Year' : 'No Year'} />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              </div>
              {/* Search box desktop */}
              <div className="w-full flex gap-2 items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search description..."
                  className="flex-1 bg-card border border-primary/20 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary/60"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={handleResetFilters}
                  title="Reset filters & search"
                >
                  Reset
                </Button>
              </div>
            </div>
            {/* Mobile: vertical filter, urutan sesuai permintaan */}
            <div className="flex flex-col gap-2 sm:hidden w-full">
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded font-semibold"
                  onClick={() => {
                    setEditTransaction(null);
                    setIsDialogOpen(true);
                  }}
                >
                  Add Transaction
                </button>
              </DialogTrigger>
              {/* Filter bulan dan tahun */}
              <div className="flex gap-2 w-full">
                <Select
                  value={filterMonth.toString()}
                  onValueChange={(value) => setFilterMonth(parseInt(value))}
                  disabled={!months.length}
                >
                  <SelectTrigger className="w-[120px] bg-card border border-primary/20">
                    <SelectValue placeholder={months.length ? 'Month' : 'No Month'} />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map(month => (
                      <SelectItem key={month.value} value={month.value.toString()}>{month.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={filterYear.toString()}
                  onValueChange={(value) => setFilterYear(parseInt(value))}
                  disabled={!years.length}
                >
                  <SelectTrigger className="w-[100px] bg-card border border-primary/20">
                    <SelectValue placeholder={years.length ? 'Year' : 'No Year'} />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Filter kategori di bawahnya */}
              <Select
                value={filterCategory}
                onValueChange={setFilterCategory}
              >
                <SelectTrigger className="w-full bg-card border border-primary/20">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    cat ? <SelectItem key={cat} value={cat}>{cat}</SelectItem> : null
                  ))}
                </SelectContent>
              </Select>
              {/* Search box + reset mobile */}
              <div className="flex gap-2 w-full items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="   Search description..."
                  className="flex-1 bg-card border border-primary/20 rounded px-0 py-2 text-sm focus:outline-none focus:border-primary/60"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={handleResetFilters}
                  title="Reset filters & search"
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
          </Dialog>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : (
          <AnimatedCard title="Transaction List" className="font-bold text-lg md:text-xl w-full min-h-[400px]">
            <CardContent className="p-0">
              {/* Baris judul dan tombol sort sejajar */}
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-base md:text-lg">Your Records</div>
                <Button
                  variant="outline"
                  size="sm"
                  style={{ marginTop: '-4px' }}
                  title="Toggle date order"
                  onClick={() => setSortDateAsc((prev) => !prev)}
                >
                  Date {sortDateAsc ? '▲' : '▼'}
                </Button>
              </div>
              {filteredTransactions.length > 0 ? (
                <div className="w-full">
                  <table className="w-full text-sm hidden md:table">
                    <thead>
                      <tr className="border-b border-primary/20">
                        <th className="text-left py-2 text-muted-foreground w-10">No</th>
                        <th className="text-left py-2 text-muted-foreground">Description</th>
                        <th className="text-left py-2 text-muted-foreground">Category</th>
                        <th className="text-left py-2 text-muted-foreground">Type</th>
                        <th className="text-left py-2 text-muted-foreground">Date</th>
                        <th className="text-center py-2 text-muted-foreground">Bukti</th>
                        <th className="text-right py-2 text-muted-foreground">Amount</th>
                        <th className="text-right py-2 text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((transaction, idx) => (
                        <tr key={transaction.id} className="border-b border-primary/10 last:border-b-0">
                          <td className="py-3 text-muted-foreground font-semibold text-center">{idx + 1}</td>
                          <td className="py-3 pl-2">{transaction.description}</td>
                          <td className="py-3">{transaction.category?.name || 'Uncategorized'}</td>
                          <td className="py-3">{transaction.type}</td>
                          <td className="py-3">{new Date(transaction.transaction_date).toLocaleDateString()}</td>
                          <td className="py-3 text-center">
                            {transaction.proof_url ? (
                              <Image
                                src={transaction.proof_url}
                                alt="Bukti"
                                className="h-10 max-w-[50px] object-contain mx-auto rounded border cursor-pointer hover:brightness-90"
                                width={50}
                                height={40}
                                onClick={() => {
                                  setPreviewImageUrl(transaction.proof_url ?? null);
                                  setPreviewModalOpen(true);
                                }}
                              />
                            ) : (
                              <span className="text-xs text-muted-foreground italic">-</span>
                            )}
                          </td>
                          <td className={`py-3 text-right ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>{transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}</td>
                          <td className="py-3 text-right flex gap-2 justify-end">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mr-2"
                              onClick={() => {
                                setEditTransaction(transaction);
                                setIsDialogOpen(true);
                              }}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-500 hover:text-red-500"
                              onClick={() => {
                                setDeleteId(transaction.id);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {/* Mobile Card List */}
                  <div className="flex flex-col gap-4 md:hidden w-full">
                    {filteredTransactions.map((transaction, idx) => (
                      <div key={transaction.id} className="rounded-lg border bg-card shadow-sm w-full p-2">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground font-semibold text-center w-6">{idx + 1}</span>
                            <span className="font-semibold pl-2">{transaction.description}</span>
                          </div>
                          <div className={`text-xs px-2 py-1 rounded-full ${transaction.type === 'income' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>{transaction.type}</div>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mb-2">
                          <div><span className="text-muted-foreground">Category:</span> {transaction.category?.name || 'Uncategorized'}</div>
                          <div><span className="text-muted-foreground">Date:</span> {new Date(transaction.transaction_date).toLocaleDateString()}</div>
                          <div><span className="text-muted-foreground">Amount:</span> <span className={transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}>{transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}</span></div>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-muted-foreground">Bukti:</span>
                          {transaction.proof_url ? (
                            <Image
                              src={transaction.proof_url}
                              alt="Bukti"
                              className="h-10 max-w-[50px] object-contain rounded border cursor-pointer hover:brightness-90"
                              width={50}
                              height={40}
                              onClick={() => {
                                setPreviewImageUrl(transaction.proof_url ?? null);
                                setPreviewModalOpen(true);
                              }}
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground italic">-</span>
                          )}
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditTransaction(transaction);
                              setIsDialogOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-500"
                            onClick={() => {
                              setDeleteId(transaction.id);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No transactions yet. Add your first transaction!</p>
                </div>
              )}
            </CardContent>
          </AnimatedCard>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="bg-card text-foreground">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the transaction.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-500 hover:bg-red-500/90"
                onClick={async () => {
                  if (deleteId) {
                    await deleteTransaction(deleteId);
                  }
                  setDeleteId(null);
                  setIsDeleteDialogOpen(false);
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Preview Bukti Modal */}
        <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
          <DialogContent className="flex flex-col items-center max-w-xl">
            <DialogHeader>
              <DialogTitle>Preview Bukti</DialogTitle>
            </DialogHeader>
            {previewImageUrl && (
              <Image
                src={previewImageUrl || ''}
                alt="Preview Bukti"
                className="max-h-[60vh] w-auto rounded border shadow-lg"
                style={{ maxWidth: '100%' }}
                width={600}
                height={400}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}