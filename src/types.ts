export type TransactionType = 'income' | 'expense';

export type AccountType = 'cash' | 'bank' | 'e-wallet' | 'credit';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  bgLight: string;
  isDefault?: boolean;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  accountNumber?: string;
  color: string;
  bgLight: string;
  icon: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  accountId: string;
  date: string; // YYYY-MM-DD
  note: string;
  isRecurring?: boolean;
  recurringId?: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  categoryId?: string; // undefined means total monthly budget
  month: string; // YYYY-MM
  limitAmount: number;
  alertThreshold: number; // e.g. 80 (%)
}

export type RecurringFrequency = 'monthly' | 'weekly' | 'daily';

export interface RecurringTransaction {
  id: string;
  name: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  accountId: string;
  frequency: RecurringFrequency;
  dueDay: number; // Day in month (1-31)
  lastAppliedMonth?: string; // YYYY-MM
  isActive: boolean;
  notes?: string;
}

export type NotificationType = 'payment_reminder' | 'budget_warning' | 'input_reminder' | 'tip';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface TransferRecord {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  fee: number;
  date: string;
  note: string;
}

export type TabType =
  | 'overview'
  | 'transactions'
  | 'statistics'
  | 'budget'
  | 'categories'
  | 'notifications';

export type GenderType = 'female' | 'male' | 'other';

export type BgThemeType = 'sky-pink' | 'blue-dream' | 'pink-blossom' | 'lavender-mint' | 'peach-cream';

export interface LoginResult {
  success: boolean;
  error?: 'not_found' | 'wrong_password' | 'invalid_input' | 'empty_password';
  message?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string; // Số điện thoại đăng nhập
  password?: string; // Mật khẩu tài khoản
  emailVerified?: boolean;
  gender?: GenderType; // Giới tính
  bgTheme?: BgThemeType; // Chế độ hình nền
  avatarColor?: string;
  avatarUrl?: string; // Ảnh đại diện từ album điện thoại (Data URL)
  joinedDate: string;
}
