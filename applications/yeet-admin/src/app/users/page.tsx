'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { UsersTable } from '@/components/UsersTable';
export default function Page() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <UsersPage />
    </QueryClientProvider>
  );
}

function UsersPage() {
  return (
    <main className='p-8'>
      <h1 className='text-2xl font-bold mb-4'>Users</h1>
      <UsersTable />
    </main>
  );
}
