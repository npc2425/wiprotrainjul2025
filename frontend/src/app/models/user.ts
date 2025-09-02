export interface User {
  id: number;
  firstName: string;
  lastName: string;
  emailId: string;
  userId: string;
  address: string;
  userType: number; // 0 for Customer, 1 for Admin
}
