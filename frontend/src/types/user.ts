export type UserRole = 'admin' | 'passenger';

export interface User {
  uid: string;
  email: string;
  role: 'admin' | 'passenger';
  name: string;
}