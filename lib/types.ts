export type Role =
  | 'admin'
  | 'sales'
  | 'sanction'
  | 'disbursement'
  | 'collection'
  | 'borrower';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
}

export type EmploymentMode = 'salaried' | 'self_employed' | 'unemployed';

export interface BorrowerProfile {
  _id: string;
  user: string;
  fullName: string;
  pan: string;
  dob: string;
  monthlySalary: number;
  employmentMode: EmploymentMode;
  salarySlipPath?: string;
  breCleared: boolean;
}

export type LoanStatus =
  | 'applied'
  | 'sanctioned'
  | 'rejected'
  | 'disbursed'
  | 'closed';

export interface Loan {
  _id: string;
  user: any;
  profile: any;
  amount: number;
  tenureDays: number;
  interestRate: number;
  totalInterest: number;
  totalRepayment: number;
  amountPaid: number;
  status: LoanStatus;
  rejectionReason?: string;
  sanctionedAt?: string;
  disbursedAt?: string;
  closedAt?: string;
  createdAt: string;
}

export interface Payment {
  _id: string;
  loan: string;
  utrNumber: string;
  amount: number;
  paymentDate: string;
}

export interface Lead {
  userId: string;
  name: string;
  email: string;
  registeredAt: string;
  hasProfile: boolean;
  salarySlipUploaded: boolean;
  breCleared: boolean;
}
