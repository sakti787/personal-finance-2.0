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
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useDataStore } from '@/lib/store/data-store';
import type { Transaction } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function TransactionsPage() {
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

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageTransition>
      <div className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Transactions</h1>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditTransaction(null);
          }}>
            <DialogTrigger asChild>
              <button
                type="button"
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded flex items-center gap-2"
                onClick={() => {
                  setEditTransaction(null);
                  setIsDialogOpen(true);
                }}
              >
                <span className="font-semibold">Add Transaction</span>
              </button>
            </DialogTrigger>
            <DialogContent className="p-0 border-none bg-transparent shadow-none w-auto h-auto">
              <DialogTitle className="sr-only">{editTransaction ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
              <AddTransactionContainer
                onSuccess={() => {
                  setIsDialogOpen(false);
                  setEditTransaction(null);
                }}
                editData={editTransaction}
              />
            </DialogContent>
          </Dialog>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : (
          <AnimatedCard title="Transaction List" description="All your income and expense records">
            <CardContent>
              {transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-sm hidden md:table">
                    <thead>
                      <tr className="border-b border-primary/20">
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
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b border-primary/10 last:border-b-0">
                          <td className="py-3">{transaction.description}</td>
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
                            <Button variant="outline" size="sm" className="mr-2">Edit</Button>
                            <Button variant="outline" size="sm" className="text-red-500 hover:text-red-500"><Trash2 className="h-4 w-4" /></Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {/* Mobile Card List */}
                  <div className="flex flex-col gap-3 md:hidden">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="rounded-lg border bg-card p-4 shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                          <div className="font-semibold">{transaction.description}</div>
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