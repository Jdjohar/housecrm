'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';

export default function ServicesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/settings');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500 space-y-3">
      <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
      <p className="text-sm font-medium">Redirecting to Settings & Pricing...</p>
    </div>
  );
}
