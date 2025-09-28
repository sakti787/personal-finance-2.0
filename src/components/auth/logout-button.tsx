'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from './auth-provider';
import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const { signOut, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Button 
      onClick={handleSignOut} 
      variant="outline" 
      className="w-full"
      disabled={loading}
    >
      {loading ? 'Signing out...' : 'Sign out'}
    </Button>
  );
}