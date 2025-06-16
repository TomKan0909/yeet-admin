'use client';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import CurrencyInput from 'react-currency-input-field';
import { toast } from 'sonner';
import { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Define the User type
type User = {
  id: string;
  username: string;
  email: string;
  balance: number;
  created_at: string; // ISO date string
};

// Define the balance adjustment type
type BalanceAdjustment = {
  userId: string;
  amount: number;
  description?: string;
};

// Define columns
const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'username',
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Username
        <ArrowUpDown className='ml-2 h-4 w-4' />
      </Button>
    ),
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Email
        <ArrowUpDown className='ml-2 h-4 w-4' />
      </Button>
    ),
  },
  {
    accessorKey: 'balance',
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Balance
        <ArrowUpDown className='ml-2 h-4 w-4' />
      </Button>
    ),
    cell: ({ row }) => {
      const balance = parseFloat(row.getValue('balance'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(balance);
      return formatted;
    },
    sortingFn: (rowA, rowB, columnId) => {
      return Number(rowA.getValue(columnId)) - Number(rowB.getValue(columnId));
    },
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Created At
        <ArrowUpDown className='ml-2 h-4 w-4' />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue('created_at'));
      return date.toLocaleDateString();
    },
  },
  {
    id: 'credit',
    header: 'Credit User',
    cell: ({ row }) => {
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [amount, setAmount] = useState<string | undefined>('0.00');
      const queryClient = useQueryClient();

      const creditMutation = useMutation({
        mutationFn: async ({ userId, amount }: BalanceAdjustment) => {
          const response = await fetch(`${API_BASE_URL}/api/${userId}/credit`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ amount }),
          });
          if (!response.ok) {
            throw new Error('Failed to credit user');
          }
          return response.json();
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['users'] });
          toast.success('User credited successfully');
          setAmount('0.00');
          setIsModalOpen(false);
        },
        onError: (error) => {
          toast.error('Failed to credit user');
          console.error('Error crediting user:', error);
        },
      });

      const handleCredit = () => {
        if (!amount || parseFloat(amount) <= 0) {
          toast.error('Please enter a valid amount');
          return;
        }

        creditMutation.mutate({
          userId: row.original.id,
          amount: parseFloat(amount),
        });
      };

      return (
        <>
          <Button
            variant='outline'
            onClick={() => setIsModalOpen(true)}
            disabled={creditMutation.isPending}>
            Credit
          </Button>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Credit User</DialogTitle>
              </DialogHeader>
              <CurrencyInput
                value={amount}
                onValueChange={(value) => setAmount(value)}
                prefix='$'
                step={1}
                placeholder='$0.00'
                className='mb-2'
                disabled={creditMutation.isPending}
              />
              <DialogFooter>
                <Button
                  variant='outline'
                  onClick={() => setIsModalOpen(false)}
                  disabled={creditMutation.isPending}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCredit}
                  disabled={creditMutation.isPending}>
                  {creditMutation.isPending ? 'Crediting...' : 'Confirm'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      );
    },
  },
  {
    id: 'debit',
    header: 'Debit User',
    cell: ({ row }) => {
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [amount, setAmount] = useState<string | undefined>('0.00');
      const queryClient = useQueryClient();

      const debitMutation = useMutation({
        mutationFn: async ({ userId, amount }: BalanceAdjustment) => {
          const response = await fetch(`${API_BASE_URL}/api/${userId}/debit`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ amount }),
          });
          if (!response.ok) {
            throw new Error('Failed to debit user');
          }
          return response.json();
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['users'] });
          toast.success('User debited successfully');
          setAmount('0.00');
          setIsModalOpen(false);
        },
        onError: (error) => {
          toast.error('Failed to debit user');
          console.error('Error debiting user:', error);
        },
      });

      const handleDebit = () => {
        if (!amount || parseFloat(amount) <= 0) {
          toast.error('Please enter a valid amount');
          return;
        }

        debitMutation.mutate({
          userId: row.original.id,
          amount: parseFloat(amount),
        });
      };

      return (
        <>
          <Button
            variant='outline'
            onClick={() => setIsModalOpen(true)}
            disabled={debitMutation.isPending}>
            Debit
          </Button>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Debit User</DialogTitle>
              </DialogHeader>
              <CurrencyInput
                value={amount}
                onValueChange={(value) => setAmount(value)}
                prefix='$'
                step={1}
                placeholder='$0.00'
                className='mb-2'
                disabled={debitMutation.isPending}
              />
              <DialogFooter>
                <Button
                  variant='outline'
                  onClick={() => setIsModalOpen(false)}
                  disabled={debitMutation.isPending}>
                  Cancel
                </Button>
                <Button
                  onClick={handleDebit}
                  disabled={debitMutation.isPending}>
                  {debitMutation.isPending ? 'Debiting...' : 'Confirm'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      );
    },
  },
];

const PAGE_SIZE = 10;

export function UsersTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [page, setPage] = useState(0);

  // Get the current sort state
  const currentSort = sorting[0] || { id: 'created_at', desc: true };
  const sortBy = currentSort.id;
  const sortOrder = currentSort.desc ? 'desc' : 'asc';

  // Fetch users with pagination and sorting
  const { data, isLoading, isError } = getUsersPaginated(
    page,
    PAGE_SIZE,
    sortBy,
    sortOrder
  );

  const table = useReactTable({
    data: data?.users || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    manualPagination: true,
    pageCount: data?.totalPages || 0,
  });

  if (isError) {
    return <div className='text-center p-4'>Error loading users</div>;
  }

  if (isLoading && !data) {
    return <div className='text-center p-4'>Loading...</div>;
  }

  return (
    <div className='rounded-md border shadow-md overflow-hidden'>
      <Table>
        <TableHeader className='bg-muted'>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className='hover:bg-muted/50'>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className='h-24 text-center'>
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {/* Pagination Footer */}
      <div className='flex items-center justify-between px-4 py-2 border-t bg-muted'>
        <span>
          Page {page + 1} of {data?.totalPages || 0}
        </span>
        <div className='space-x-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setPage((p) => Math.max(p - 1, 0))}
            disabled={page === 0 || isLoading}>
            Previous
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() =>
              setPage((p) => Math.min(p + 1, (data?.totalPages || 0) - 1))
            }
            disabled={page === (data?.totalPages || 0) - 1 || isLoading}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

function getUsersPaginated(
  page: number,
  pageSize: number,
  sortBy: string = 'created_at',
  sortOrder: 'asc' | 'desc' = 'desc'
) {
  return useQuery({
    queryKey: ['users', page, sortBy, sortOrder],
    queryFn: async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/users?page=${
            page + 1
          }&limit=${pageSize}&sortBy=${sortBy}&sortOrder=${sortOrder}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        console.log('data', data);
        return {
          users: data.users,
          totalPages: Math.ceil(data.totalUsers / pageSize),
          totalItems: data.totalUsers,
        };
      } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
    },
    placeholderData: (previousData) => previousData, // Keep previous data while loading
  });
}
