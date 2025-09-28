import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <Card className="bg-card text-foreground text-center">
          <CardHeader>
            <CardTitle className="text-4xl font-bold text-primary">UangSakti</CardTitle>
            <CardDescription className="text-xl mt-2">Your Personal Finance Tracker</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Take control of your finances with our intuitive platform designed specifically 
              for young Indonesians. Track expenses, set budgets, and achieve your financial goals.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/auth/signup">Get Started</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">Track Expenses</h3>
                <p className="text-muted-foreground text-sm">
                  Monitor your spending habits across different categories
                </p>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">Set Budgets</h3>
                <p className="text-muted-foreground text-sm">
                  Create monthly budgets and stay within your limits
                </p>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">Achieve Goals</h3>
                <p className="text-muted-foreground text-sm">
                  Track your progress toward your financial goals
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center text-muted-foreground text-sm mt-8">
          <p>© {new Date().getFullYear()} UangSakti. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}