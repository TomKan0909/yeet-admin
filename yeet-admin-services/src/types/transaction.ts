// A representation of the Transaction entity
export interface Transaction {
  id: string;
  user_id: string;
  type: 'credit' | 'debit'; // can be extended to have different types in the future
  amount: string; // pg returns decimal as string
  description?: string;
  created_at: Date;
}
