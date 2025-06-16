// A representation of the User entity from the database
export type User = {
  id: string;
  username: string;
  password: string;
  email: string;
  balance: string; // pg returns decimal as string by default for precision
  created_at: Date;
};
