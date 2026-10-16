import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Transaction,
  Category,
  Account,
  Budget,
  RecurringTransaction,
  NotificationItem,
  TabType,
  UserProfile,
  LoginResult,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_ACCOUNTS,
  EMPTY_ACCOUNTS,
  INITIAL_TRANSACTIONS,
  INITIAL_BUDGETS,
  INITIAL_RECURRING,
  INITIAL_NOTIFICATIONS,
  DEFAULT_USERS,
} from '../mockData';
import { getCurrentMonthStr, setGlobalShowMoney } from '../utils/format';
import {
  exportTransactionsToCSV,
  exportTransactionsToExcel,
} from '../utils/exportTransactions';

interface ExpenseContextType {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  budgets: Budget[];
  recurring: RecurringTransaction[];
  notifications: NotificationItem[];
  unreadCount: number;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;

  // Authentication state
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  savedUsers: UserProfile[];
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'register' | 'profile' | 'forgot_password' | 'change_password';
  setAuthModalMode: (mode: 'login' | 'register' | 'profile' | 'forgot_password' | 'change_password') => void;
  login: (
    emailOrId: string,
    password?: string,
    autoCreate?: boolean,
    bypassPassword?: boolean
  ) => LoginResult;
  loginAsDemoUser: (user: UserProfile) => void;
  register: (data: Omit<UserProfile, 'id' | 'joinedDate'>, password?: string) => boolean;
  logout: () => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  changePassword: (oldPassword: string, newPassword: string) => { success: boolean; message: string };
  resetPassword: (
    identifier: string,
    newPassword: string
  ) => { success: boolean; message: string; user?: UserProfile };

  // Modals state
  isAddTxModalOpen: boolean;
  setIsAddTxModalOpen: (open: boolean) => void;
  editingTransaction: Transaction | null;
  setEditingTransaction: (tx: Transaction | null) => void;
  isTransferModalOpen: boolean;
  setIsTransferModalOpen: (open: boolean) => void;
  isStudentToolOpen: boolean;
  setIsStudentToolOpen: (open: boolean) => void;

  // Actions
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (data: Transaction) => void;
  deleteTransaction: (id: string) => void;

  transferFunds: (
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    fee: number,
    note: string
  ) => void;

  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateCategory: (cat: Category) => void;
  deleteCategory: (id: string) => void;

  addAccount: (acc: Omit<Account, 'id'>) => void;
  updateAccount: (acc: Account) => void;
  deleteAccount: (id: string) => void;

  setBudgetLimit: (categoryId: string | undefined, limitAmount: number, threshold?: number) => void;

  addRecurring: (r: Omit<RecurringTransaction, 'id'>) => void;
  updateRecurring: (r: RecurringTransaction) => void;
  deleteRecurring: (id: string) => void;
  executeRecurring: (id: string) => void;

  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;

  resetToDefaults: () => void;
  exportJSON: () => void;
  importJSON: (jsonStr: string) => boolean;

  // Transaction export helpers (CSV & Excel)
  isExportModalOpen: boolean;
  setIsExportModalOpen: (open: boolean) => void;
  exportTransactionsCSV: (txs?: Transaction[], title?: string) => void;
  exportTransactionsExcel: (txs?: Transaction[], title?: string) => void;

  // Computations
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlyNet: number;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TRANSACTIONS: 'qlct_transactions_v2',
  CATEGORIES: 'qlct_categories_pastel_v3',
  ACCOUNTS: 'qlct_accounts_pastel_v3',
  BUDGETS: 'qlct_budgets_v2',
  RECURRING: 'qlct_recurring_v2',
  NOTIFICATIONS: 'qlct_notifications_v2',
  CURRENT_USER: 'qlct_current_user_v3',
  ALL_USERS: 'qlct_all_users_v2',
};

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentMonth = getCurrentMonthStr();
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Modal controls
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState<boolean>(false);
  const [isStudentToolOpen, setIsStudentToolOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<
    'login' | 'register' | 'profile' | 'forgot_password' | 'change_password'
  >('login');
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Authentication State (Defaults to null so user is in Guest/Basic mode until login)
  const [savedUsers, setSavedUsers] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ALL_USERS);
      if (saved) {
        const parsed: UserProfile[] = JSON.parse(saved);
        return parsed.map((u) => ({
          ...u,
          password: u.password || '123456',
        }));
      }
      return DEFAULT_USERS;
    } catch {
      return DEFAULT_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (!saved || saved === 'null') return null;
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });

  const isAuthenticated = !!currentUser;
  // Sync global currency visibility synchronously before children render
  setGlobalShowMoney(isAuthenticated);

  // Sync users to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(savedUsers));
  }, [savedUsers]);

  // Helper to get per-user storage key
  const getUserKey = (baseKey: string, userId?: string | null) =>
    userId ? `${baseKey}_${userId}` : baseKey;

  const isDemoUser = (userId?: string | null) =>
    !!userId && DEFAULT_USERS.some((u) => u.id === userId);

  const initializeFreshUserData = (userId: string, userName: string) => {
    const freshAccounts = EMPTY_ACCOUNTS.map((acc) => ({ ...acc, balance: 0 }));
    const freshTransactions: Transaction[] = [];
    const freshBudgets: Budget[] = [];
    const freshRecurring: RecurringTransaction[] = [];
    const welcomeNotif: NotificationItem[] = [
      {
        id: `notif-welcome-${Date.now()}`,
        type: 'input_reminder',
        title: `Chào mừng ${userName}!`,
        message:
          'Tài khoản mới của bạn đã sẵn sàng. Hãy tự điền số dư ban đầu, ngân sách tháng và ghi chép giao dịch đầu tiên nhé!',
        date: new Date().toISOString().slice(0, 10),
        isRead: false,
        priority: 'medium',
      },
    ];

    setCategories(INITIAL_CATEGORIES);
    setAccounts(freshAccounts);
    setTransactions(freshTransactions);
    setBudgets(freshBudgets);
    setRecurring(freshRecurring);
    setNotifications(welcomeNotif);

    localStorage.setItem(getUserKey(STORAGE_KEYS.CATEGORIES, userId), JSON.stringify(INITIAL_CATEGORIES));
    localStorage.setItem(getUserKey(STORAGE_KEYS.ACCOUNTS, userId), JSON.stringify(freshAccounts));
    localStorage.setItem(getUserKey(STORAGE_KEYS.TRANSACTIONS, userId), JSON.stringify(freshTransactions));
    localStorage.setItem(getUserKey(STORAGE_KEYS.BUDGETS, userId), JSON.stringify(freshBudgets));
    localStorage.setItem(getUserKey(STORAGE_KEYS.RECURRING, userId), JSON.stringify(freshRecurring));
    localStorage.setItem(getUserKey(STORAGE_KEYS.NOTIFICATIONS, userId), JSON.stringify(welcomeNotif));
  };

  const loadUserData = (user: UserProfile | null) => {
    if (!user) {
      setCategories(INITIAL_CATEGORIES);
      setAccounts(EMPTY_ACCOUNTS);
      setTransactions([]);
      setBudgets([]);
      setRecurring([]);
      setNotifications([]);
      return;
    }

    const uid = user.id;
    const demo = isDemoUser(uid);
    try {
      const savedCats = localStorage.getItem(getUserKey(STORAGE_KEYS.CATEGORIES, uid));
      const savedAccs = localStorage.getItem(getUserKey(STORAGE_KEYS.ACCOUNTS, uid));
      const savedTxs = localStorage.getItem(getUserKey(STORAGE_KEYS.TRANSACTIONS, uid));
      const savedBudgets = localStorage.getItem(getUserKey(STORAGE_KEYS.BUDGETS, uid));
      const savedRec = localStorage.getItem(getUserKey(STORAGE_KEYS.RECURRING, uid));
      const savedNotifs = localStorage.getItem(getUserKey(STORAGE_KEYS.NOTIFICATIONS, uid));

      setCategories(savedCats ? JSON.parse(savedCats) : INITIAL_CATEGORIES);
      setAccounts(savedAccs ? JSON.parse(savedAccs) : demo ? INITIAL_ACCOUNTS : EMPTY_ACCOUNTS);
      setTransactions(savedTxs ? JSON.parse(savedTxs) : demo ? INITIAL_TRANSACTIONS : []);
      setBudgets(savedBudgets ? JSON.parse(savedBudgets) : demo ? INITIAL_BUDGETS : []);
      setRecurring(savedRec ? JSON.parse(savedRec) : demo ? INITIAL_RECURRING : []);
      setNotifications(savedNotifs ? JSON.parse(savedNotifs) : demo ? INITIAL_NOTIFICATIONS : []);
    } catch {
      setCategories(INITIAL_CATEGORIES);
      setAccounts(demo ? INITIAL_ACCOUNTS : EMPTY_ACCOUNTS);
      setTransactions(demo ? INITIAL_TRANSACTIONS : []);
      setBudgets(demo ? INITIAL_BUDGETS : []);
      setRecurring(demo ? INITIAL_RECURRING : []);
      setNotifications(demo ? INITIAL_NOTIFICATIONS : []);
    }
  };

  const login = (
    identifierInput: string,
    password?: string,
    autoCreate = false,
    bypassPassword = false
  ): LoginResult => {
    const trimmed = identifierInput.trim();
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
    const cleanedPhone = trimmed.replace(/[\s.-]/g, '').replace(/^\+84/, '0');
    const phoneRegex = /^0\d{8,10}$/;

    const isGmail = gmailRegex.test(trimmed.toLowerCase());
    const isPhone = phoneRegex.test(cleanedPhone);

    if (!isGmail && !isPhone) {
      return {
        success: false,
        error: 'invalid_input',
        message: 'Vui lòng nhập số điện thoại hoặc Gmail hợp lệ!',
      };
    }

    const found = savedUsers.find((u) => {
      if (isGmail && u.email) {
        return u.email.toLowerCase() === trimmed.toLowerCase();
      }
      if (isPhone) {
        const uPhone = (u.phone || '').replace(/[\s.-]/g, '').replace(/^\+84/, '0');
        return uPhone === cleanedPhone || u.email === cleanedPhone;
      }
      return false;
    });

    if (found) {
      // Password verification: If bypassPassword is true (e.g. 1-click Google SSO), skip password check
      if (!bypassPassword) {
        const enteredPassword = (password || '').trim();
        const expectedPassword = (found.password || '123456').trim();
        const isMatch =
          enteredPassword === expectedPassword ||
          (isDemoUser(found.id) &&
            (enteredPassword === '123456' || enteredPassword === 'password123'));

        if (!isMatch) {
          return {
            success: false,
            error: 'wrong_password',
            message: 'Sai mật khẩu! Vui lòng kiểm tra lại mật khẩu của bạn.',
          };
        }
      }

      const verifiedUser = {
        ...found,
        emailVerified: true,
        phone: isPhone ? cleanedPhone : found.phone,
      };
      setCurrentUser(verifiedUser);
      setSavedUsers((prev) => prev.map((u) => (u.id === found.id ? verifiedUser : u)));
      loadUserData(verifiedUser);
      try {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
      } catch {
        // ignore
      }
      return { success: true };
    } else if (autoCreate) {
      // Dynamic login by Gmail or Phone Number -> New User starts with clean 0 data
      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        name: isGmail ? trimmed.split('@')[0] : `Người dùng ${cleanedPhone.slice(-4)}`,
        email: isGmail ? trimmed.toLowerCase() : `${cleanedPhone}@phone.vn`,
        phone: isPhone ? cleanedPhone : undefined,
        password: password?.trim() || '123456',
        emailVerified: true,
        gender: 'female',
        bgTheme: 'sky-pink',
        avatarColor: '#38bdf8',
        joinedDate: new Date().toISOString().slice(0, 10),
      };
      setSavedUsers((prev) => [...prev, newUser]);
      setCurrentUser(newUser);
      initializeFreshUserData(newUser.id, newUser.name);
      try {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
      } catch {
        // ignore
      }
      return { success: true };
    } else {
      return {
        success: false,
        error: 'not_found',
        message: 'Tài khoản chưa được đăng ký trong hệ thống!',
      };
    }
  };

  const loginAsDemoUser = (user: UserProfile) => {
    setCurrentUser(user);
    loadUserData(user);
    try {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
  };

  const register = (data: Omit<UserProfile, 'id' | 'joinedDate'>, password?: string) => {
    const cleanedPhone = data.phone
      ? data.phone.trim().replace(/[\s.-]/g, '').replace(/^\+84/, '0')
      : undefined;
    const newUser: UserProfile = {
      ...data,
      email: (data.email || (cleanedPhone ? `${cleanedPhone}@phone.vn` : '')).trim().toLowerCase(),
      phone: cleanedPhone,
      password: password?.trim() || '123456',
      emailVerified: true,
      id: `user-${Date.now()}`,
      joinedDate: new Date().toISOString().slice(0, 10),
      gender: data.gender || 'female',
      bgTheme: data.bgTheme || 'sky-pink',
      avatarColor: data.avatarColor || '#38bdf8',
    };
    setSavedUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    initializeFreshUserData(newUser.id, newUser.name);
    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateUserProfile = (profile: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...profile };
    setCurrentUser(updated);
    setSavedUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  };

  const changePassword = (
    oldPassword: string,
    newPassword: string
  ): { success: boolean; message: string } => {
    if (!currentUser) {
      return { success: false, message: 'Vui lòng đăng nhập trước khi đổi mật khẩu!' };
    }
    const currentPass = currentUser.password || '123456';
    if (oldPassword.trim() !== currentPass) {
      return { success: false, message: 'Mật khẩu hiện tại không chính xác!' };
    }
    if (newPassword.trim().length < 4) {
      return { success: false, message: 'Mật khẩu mới phải có ít nhất 4 ký tự!' };
    }
    if (newPassword.trim() === currentPass) {
      return { success: false, message: 'Mật khẩu mới phải khác mật khẩu hiện tại!' };
    }

    const updatedUser = { ...currentUser, password: newPassword.trim() };
    setCurrentUser(updatedUser);
    setSavedUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    return { success: true, message: 'Đổi mật khẩu thành công!' };
  };

  const resetPassword = (
    identifier: string,
    newPassword: string
  ): { success: boolean; message: string; user?: UserProfile } => {
    const trimmed = identifier.trim();
    if (!trimmed) {
      return { success: false, message: 'Vui lòng nhập Số điện thoại hoặc Gmail!' };
    }
    if (newPassword.trim().length < 4) {
      return { success: false, message: 'Mật khẩu mới phải có ít nhất 4 ký tự!' };
    }

    const cleanedPhone = trimmed.replace(/[\s.-]/g, '').replace(/^\+84/, '0');
    const emailLower = trimmed.toLowerCase();

    const targetUser = savedUsers.find((u) => {
      const uPhone = u.phone ? u.phone.replace(/[\s.-]/g, '').replace(/^\+84/, '0') : '';
      if (cleanedPhone && uPhone && uPhone === cleanedPhone) return true;
      if (u.email && u.email.toLowerCase() === emailLower) return true;
      return false;
    });

    if (!targetUser) {
      return {
        success: false,
        message: `Không tìm thấy tài khoản với thông tin "${trimmed}". Vui lòng kiểm tra lại số điện thoại hoặc Gmail!`,
      };
    }

    const updated: UserProfile = { ...targetUser, password: newPassword.trim() };
    setSavedUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    if (currentUser?.id === updated.id) {
      setCurrentUser(updated);
    }
    return {
      success: true,
      message: `Đặt lại mật khẩu thành công cho tài khoản "${targetUser.name}"! Bạn có thể đăng nhập ngay.`,
      user: updated,
    };
  };


  // Load state from localStorage with per-user isolation (new accounts start with 0 instead of sample amounts)
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const uid = currentUser?.id;
      const saved = localStorage.getItem(getUserKey(STORAGE_KEYS.CATEGORIES, uid));
      return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    try {
      const uid = currentUser?.id;
      const saved = localStorage.getItem(getUserKey(STORAGE_KEYS.ACCOUNTS, uid));
      if (saved) return JSON.parse(saved);
      return isDemoUser(uid) ? INITIAL_ACCOUNTS : EMPTY_ACCOUNTS;
    } catch {
      return EMPTY_ACCOUNTS;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const uid = currentUser?.id;
      const saved = localStorage.getItem(getUserKey(STORAGE_KEYS.TRANSACTIONS, uid));
      if (saved) return JSON.parse(saved);
      return isDemoUser(uid) ? INITIAL_TRANSACTIONS : [];
    } catch {
      return [];
    }
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    try {
      const uid = currentUser?.id;
      const saved = localStorage.getItem(getUserKey(STORAGE_KEYS.BUDGETS, uid));
      if (saved) return JSON.parse(saved);
      return isDemoUser(uid) ? INITIAL_BUDGETS : [];
    } catch {
      return [];
    }
  });

  const [recurring, setRecurring] = useState<RecurringTransaction[]>(() => {
    try {
      const uid = currentUser?.id;
      const saved = localStorage.getItem(getUserKey(STORAGE_KEYS.RECURRING, uid));
      if (saved) return JSON.parse(saved);
      return isDemoUser(uid) ? INITIAL_RECURRING : [];
    } catch {
      return [];
    }
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const uid = currentUser?.id;
      const saved = localStorage.getItem(getUserKey(STORAGE_KEYS.NOTIFICATIONS, uid));
      if (saved) return JSON.parse(saved);
      return isDemoUser(uid) ? INITIAL_NOTIFICATIONS : [];
    } catch {
      return [];
    }
  });

  // Sync state changes to localStorage per user
  useEffect(() => {
    if (!currentUser) return;
    localStorage.setItem(getUserKey(STORAGE_KEYS.CATEGORIES, currentUser.id), JSON.stringify(categories));
  }, [categories, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    localStorage.setItem(getUserKey(STORAGE_KEYS.ACCOUNTS, currentUser.id), JSON.stringify(accounts));
  }, [accounts, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    localStorage.setItem(getUserKey(STORAGE_KEYS.TRANSACTIONS, currentUser.id), JSON.stringify(transactions));
  }, [transactions, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    localStorage.setItem(getUserKey(STORAGE_KEYS.BUDGETS, currentUser.id), JSON.stringify(budgets));
  }, [budgets, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    localStorage.setItem(getUserKey(STORAGE_KEYS.RECURRING, currentUser.id), JSON.stringify(recurring));
  }, [recurring, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    localStorage.setItem(getUserKey(STORAGE_KEYS.NOTIFICATIONS, currentUser.id), JSON.stringify(notifications));
  }, [notifications, currentUser]);

  // Derived calculations
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const currentMonthTransactions = transactions.filter((tx) =>
    tx.date.startsWith(selectedMonth)
  );

  const monthlyIncome = currentMonthTransactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const monthlyExpense = currentMonthTransactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const monthlyNet = monthlyIncome - monthlyExpense;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Add transaction & update account balance
  const addTransaction = (data: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...data,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Update account balance
    setAccounts((prevAccounts) =>
      prevAccounts.map((acc) => {
        if (acc.id === data.accountId) {
          const delta = data.type === 'income' ? data.amount : -data.amount;
          return { ...acc, balance: acc.balance + delta };
        }
        return acc;
      })
    );

    // Check budget alert
    if (data.type === 'expense') {
      const monthStr = data.date.slice(0, 7);
      const catBudget = budgets.find(
        (b) => b.month === monthStr && b.categoryId === data.categoryId
      );
      if (catBudget) {
        const catSpent =
          transactions
            .filter(
              (tx) =>
                tx.date.startsWith(monthStr) &&
                tx.categoryId === data.categoryId &&
                tx.type === 'expense'
            )
            .reduce((s, tx) => s + tx.amount, 0) + data.amount;

        const ratio = (catSpent / catBudget.limitAmount) * 100;
        if (ratio >= catBudget.alertThreshold && ratio < 100) {
          const cat = categories.find((c) => c.id === data.categoryId);
          const newAlert: NotificationItem = {
            id: `notif-${Date.now()}`,
            type: 'budget_warning',
            title: `Cảnh báo ngân sách ${cat?.name || ''}`,
            message: `Bạn đã chi ${ratio.toFixed(0)}% định mức ngân sách cho danh mục ${cat?.name || ''} tháng này.`,
            date: data.date,
            isRead: false,
            priority: 'medium',
          };
          setNotifications((prev) => [newAlert, ...prev]);
        } else if (ratio >= 100) {
          const cat = categories.find((c) => c.id === data.categoryId);
          const newAlert: NotificationItem = {
            id: `notif-${Date.now()}`,
            type: 'budget_warning',
            title: `VƯỢT NGÂN SÁCH: ${cat?.name || ''}`,
            message: `Bạn đã vượt ngân sách dự kiến ${cat?.name || ''} (${catSpent.toLocaleString('vi-VN')}đ / ${catBudget.limitAmount.toLocaleString('vi-VN')}đ). Hãy cân nhắc cắt giảm chi tiêu khác!`,
            date: data.date,
            isRead: false,
            priority: 'high',
          };
          setNotifications((prev) => [newAlert, ...prev]);
        }
      }
    }
  };

  // Update existing transaction
  const updateTransaction = (updatedTx: Transaction) => {
    const oldTx = transactions.find((t) => t.id === updatedTx.id);
    if (!oldTx) return;

    // Rollback old balance and apply new balance
    setAccounts((prevAccounts) =>
      prevAccounts.map((acc) => {
        let bal = acc.balance;
        if (acc.id === oldTx.accountId) {
          bal -= oldTx.type === 'income' ? oldTx.amount : -oldTx.amount;
        }
        if (acc.id === updatedTx.accountId) {
          bal += updatedTx.type === 'income' ? updatedTx.amount : -updatedTx.amount;
        }
        return { ...acc, balance: bal };
      })
    );

    setTransactions((prev) =>
      prev.map((tx) => (tx.id === updatedTx.id ? updatedTx : tx))
    );
  };

  // Delete transaction & restore account balance
  const deleteTransaction = (id: string) => {
    const txToDelete = transactions.find((t) => t.id === id);
    if (!txToDelete) return;

    setAccounts((prevAccounts) =>
      prevAccounts.map((acc) => {
        if (acc.id === txToDelete.accountId) {
          const delta = txToDelete.type === 'income' ? -txToDelete.amount : txToDelete.amount;
          return { ...acc, balance: acc.balance + delta };
        }
        return acc;
      })
    );

    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Transfer funds between accounts
  const transferFunds = (
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    fee: number,
    note: string
  ) => {
    const fromAcc = accounts.find((a) => a.id === fromAccountId);
    const toAcc = accounts.find((a) => a.id === toAccountId);
    if (!fromAcc || !toAcc || amount <= 0) return;

    const todayStr = new Date().toISOString().slice(0, 10);

    // Create 2 paired transactions: expense on fromAccount, income on toAccount
    const outTx: Transaction = {
      id: `tx-tf-out-${Date.now()}`,
      type: 'expense',
      amount: amount + fee,
      categoryId: 'cat-other-exp',
      accountId: fromAccountId,
      date: todayStr,
      note: `Chuyển sang ${toAcc.name}${note ? `: ${note}` : ''}${fee > 0 ? ` (Phí: ${fee}đ)` : ''}`,
      createdAt: new Date().toISOString(),
    };

    const inTx: Transaction = {
      id: `tx-tf-in-${Date.now()}`,
      type: 'income',
      amount: amount,
      categoryId: 'cat-other-inc',
      accountId: toAccountId,
      date: todayStr,
      note: `Nhận từ ${fromAcc.name}${note ? `: ${note}` : ''}`,
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [outTx, inTx, ...prev]);

    // Update account balances
    setAccounts((prevAccounts) =>
      prevAccounts.map((acc) => {
        if (acc.id === fromAccountId) {
          return { ...acc, balance: acc.balance - (amount + fee) };
        }
        if (acc.id === toAccountId) {
          return { ...acc, balance: acc.balance + amount };
        }
        return acc;
      })
    );

    try {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    } catch {
      // safe fallback
    }
  };

  // Category management
  const addCategory = (cat: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...cat,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCat]);
  };

  const updateCategory = (cat: Category) => {
    setCategories((prev) => prev.map((c) => (c.id === cat.id ? cat : c)));
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // Account management
  const addAccount = (acc: Omit<Account, 'id'>) => {
    const newAcc: Account = {
      ...acc,
      id: `acc-${Date.now()}`,
    };
    setAccounts((prev) => [...prev, newAcc]);
  };

  const updateAccount = (acc: Account) => {
    setAccounts((prev) => prev.map((a) => (a.id === acc.id ? acc : a)));
  };

  const deleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  // Budget management
  const setBudgetLimit = (
    categoryId: string | undefined,
    limitAmount: number,
    threshold: number = 80
  ) => {
    setBudgets((prev) => {
      const existingIdx = prev.findIndex(
        (b) => b.month === selectedMonth && b.categoryId === categoryId
      );
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = {
          ...copy[existingIdx],
          limitAmount,
          alertThreshold: threshold,
        };
        return copy;
      } else {
        return [
          ...prev,
          {
            id: `b-${Date.now()}`,
            month: selectedMonth,
            categoryId,
            limitAmount,
            alertThreshold: threshold,
          },
        ];
      }
    });
  };

  // Recurring transactions management
  const addRecurring = (r: Omit<RecurringTransaction, 'id'>) => {
    const newRec: RecurringTransaction = {
      ...r,
      id: `rec-${Date.now()}`,
    };
    setRecurring((prev) => [...prev, newRec]);
  };

  const updateRecurring = (r: RecurringTransaction) => {
    setRecurring((prev) => prev.map((item) => (item.id === r.id ? r : item)));
  };

  const deleteRecurring = (id: string) => {
    setRecurring((prev) => prev.filter((item) => item.id !== id));
  };

  const executeRecurring = (recurringId: string) => {
    const rec = recurring.find((r) => r.id === recurringId);
    if (!rec) return;

    const todayStr = new Date().toISOString().slice(0, 10);
    addTransaction({
      type: rec.type,
      amount: rec.amount,
      categoryId: rec.categoryId,
      accountId: rec.accountId,
      date: todayStr,
      note: `${rec.name} (Định kỳ hàng tháng)`,
      isRecurring: true,
      recurringId: rec.id,
    });

    setRecurring((prev) =>
      prev.map((item) =>
        item.id === recurringId
          ? { ...item, lastAppliedMonth: selectedMonth }
          : item
      )
    );

    try {
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
  };

  // Notification actions
  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Reset to initial sample data
  const resetToDefaults = () => {
    setCategories(INITIAL_CATEGORIES);
    setAccounts(INITIAL_ACCOUNTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setBudgets(INITIAL_BUDGETS);
    setRecurring(INITIAL_RECURRING);
    setNotifications(INITIAL_NOTIFICATIONS);
  };

  // Export & Import
  const exportJSON = () => {
    const data = {
      version: 2,
      exportedAt: new Date().toISOString(),
      categories,
      accounts,
      transactions,
      budgets,
      recurring,
      notifications,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quan-ly-chi-tieu-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (Array.isArray(data.transactions) && Array.isArray(data.categories)) {
        setTransactions(data.transactions);
        setCategories(data.categories);
        if (Array.isArray(data.accounts)) setAccounts(data.accounts);
        if (Array.isArray(data.budgets)) setBudgets(data.budgets);
        if (Array.isArray(data.recurring)) setRecurring(data.recurring);
        if (Array.isArray(data.notifications)) setNotifications(data.notifications);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const exportTransactionsCSV = (txs?: Transaction[], title?: string) => {
    if (!currentUser) {
      setAuthModalMode('login');
      setIsAuthModalOpen(true);
      return;
    }
    const list = txs || transactions;
    exportTransactionsToCSV(list, categories, accounts, {
      title: title || 'BÁO CÁO GIAO DỊCH TÀI CHÍNH',
      user: currentUser,
      periodLabel: selectedMonth ? `Tháng ${selectedMonth}` : 'Tất cả các tháng',
    });
    try {
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
    } catch {
      // ignore
    }
  };

  const exportTransactionsExcel = (txs?: Transaction[], title?: string) => {
    if (!currentUser) {
      setAuthModalMode('login');
      setIsAuthModalOpen(true);
      return;
    }
    const list = txs || transactions;
    exportTransactionsToExcel(list, categories, accounts, {
      title: title || 'BÁO CÁO GIAO DỊCH TÀI CHÍNH CÁ NHÂN',
      user: currentUser,
      periodLabel: selectedMonth ? `Tháng ${selectedMonth}` : 'Tất cả các tháng',
    });
    try {
      confetti({ particleCount: 45, spread: 70, origin: { y: 0.7 } });
    } catch {
      // ignore
    }
  };

  return (
    <ExpenseContext.Provider
      value={{
        transactions,
        categories,
        accounts,
        budgets,
        recurring,
        notifications,
        unreadCount,
        activeTab,
        setActiveTab,
        selectedMonth,
        setSelectedMonth,

        currentUser,
        isAuthenticated,
        savedUsers,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        login,
        loginAsDemoUser,
        register,
        logout,
        updateUserProfile,
        changePassword,
        resetPassword,

        isAddTxModalOpen,
        setIsAddTxModalOpen,
        editingTransaction,
        setEditingTransaction,
        isTransferModalOpen,
        setIsTransferModalOpen,
        isStudentToolOpen,
        setIsStudentToolOpen,
        isExportModalOpen,
        setIsExportModalOpen,
        exportTransactionsCSV,
        exportTransactionsExcel,

        addTransaction,
        updateTransaction,
        deleteTransaction,
        transferFunds,

        addCategory,
        updateCategory,
        deleteCategory,

        addAccount,
        updateAccount,
        deleteAccount,

        setBudgetLimit,

        addRecurring,
        updateRecurring,
        deleteRecurring,
        executeRecurring,

        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,

        resetToDefaults,
        exportJSON,
        importJSON,

        totalBalance,
        monthlyIncome,
        monthlyExpense,
        monthlyNet,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
};
