import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ClipboardList, Target, TrendingUp } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Full Width */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-primary/10 py-12 md:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-3 md:mb-4">
                UangSakti
              </h1>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 md:mb-6 leading-tight">
                Kelola Keuangan Jadi <span className="text-primary">Simpel & Cerdas</span>
              </h2>
              <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Platform intuitif khusus untuk <strong>anak muda Indonesia</strong>.
                <strong>Lacak pengeluaran</strong>, atur budget, dan <strong>capai tujuan finansial</strong> Anda dengan mudah.
              </p>

              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3 md:gap-4">
                <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 md:px-8 py-3 text-base md:text-lg w-full sm:w-auto">
                  <Link href="/auth/signup">Get Started</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-6 md:px-8 py-3 text-base md:text-lg w-full sm:w-auto">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
              </div>
            </div>

            {/* Right Content - Mockup Placeholder */}
            <div className="flex justify-center lg:justify-end order-1 lg:order-2">
              <div className="relative w-full max-w-sm md:max-w-md">
                <div className="bg-card border-2 border-primary/20 rounded-lg p-3 md:p-4 shadow-2xl">
                  <div className="bg-primary/10 rounded-md p-2 md:p-3 mb-3 md:mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs md:text-sm font-semibold text-primary">Dashboard</div>
                      <div className="w-2 h-2 md:w-3 md:h-3 bg-primary rounded-full"></div>
                    </div>
                    <div className="space-y-1 md:space-y-2">
                      <div className="h-2 md:h-3 bg-primary/20 rounded"></div>
                      <div className="h-2 md:h-3 bg-primary/20 rounded w-3/4"></div>
                      <div className="h-2 md:h-3 bg-primary/30 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-1 md:gap-2">
                    <div className="bg-primary/10 rounded p-1 md:p-2 text-center">
                      <TrendingUp className="w-4 h-4 md:w-6 md:h-6 text-primary mx-auto mb-1" />
                      <div className="text-xs text-primary font-medium">Income</div>
                    </div>
                    <div className="bg-red-500/10 rounded p-1 md:p-2 text-center">
                      <TrendingUp className="w-4 h-4 md:w-6 md:h-6 text-red-500 mx-auto mb-1 rotate-180" />
                      <div className="text-xs text-red-500 font-medium">Expense</div>
                    </div>
                    <div className="bg-green-500/10 rounded p-1 md:p-2 text-center">
                      <Target className="w-4 h-4 md:w-6 md:h-6 text-green-500 mx-auto mb-1" />
                      <div className="text-xs text-green-500 font-medium">Goal</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3 md:mb-4">Fitur Unggulan</h3>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Semua yang Anda butuhkan untuk mengelola keuangan dengan bijak
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-card p-6 md:p-8 rounded-lg border border-primary/10 hover:border-primary/30 transition-colors text-center">
              <div className="bg-primary/10 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                <ClipboardList className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              </div>
              <h4 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-primary">Track Expenses</h4>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                Monitor your spending habits across different categories with detailed insights
              </p>
            </div>

            <div className="bg-card p-6 md:p-8 rounded-lg border border-primary/10 hover:border-primary/30 transition-colors text-center">
              <div className="bg-primary/10 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              </div>
              <h4 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-primary">Set Budgets</h4>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                Create monthly budgets and stay within your limits with smart notifications
              </p>
            </div>

            <div className="bg-card p-6 md:p-8 rounded-lg border border-primary/10 hover:border-primary/30 transition-colors text-center">
              <div className="bg-primary/10 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                <Target className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              </div>
              <h4 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-primary">Achieve Goals</h4>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                Track your progress toward your financial goals with visual progress indicators
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-primary/10 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-muted-foreground">
            © {new Date().getFullYear()} UangSakti. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}