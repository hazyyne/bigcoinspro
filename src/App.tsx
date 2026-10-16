import React from 'react';
import { ExpenseProvider, useExpense } from './context/ExpenseContext';
import { TopSlidebar } from './components/TopSlidebar';
import { OverviewTab } from './components/OverviewTab';
import { TransactionsTab } from './components/TransactionsTab';
import { StatisticsTab } from './components/StatisticsTab';
import { BudgetTab } from './components/BudgetTab';
import { CategoriesTab } from './components/CategoriesTab';
import { NotificationsTab } from './components/NotificationsTab';
import { TransactionModal } from './components/TransactionModal';
import { StudentToolsModal } from './components/StudentToolsModal';
import { AuthModal } from './components/AuthModal';
import {
  GraduationCap,
  Heart,
  Plus,
  LayoutDashboard,
  Receipt,
  PieChart,
  Target,
  Tags,
} from 'lucide-react';

const MainContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setIsAddTxModalOpen,
    isAuthenticated,
    setIsAuthModalOpen,
    setAuthModalMode,
    currentUser,
  } = useExpense();

  const bgTheme = currentUser?.bgTheme || 'sky-pink';

  const bgThemeClasses: Record<string, string> = {
    'sky-pink': 'bg-linear-to-br from-sky-100/75 via-white/90 to-pink-100/75',
    'blue-dream': 'bg-linear-to-br from-sky-200/75 via-cyan-50/90 to-blue-100/80',
    'pink-blossom': 'bg-linear-to-br from-pink-200/70 via-rose-50/90 to-pink-100/85',
    'lavender-mint': 'bg-linear-to-br from-purple-100/80 via-sky-50/90 to-emerald-100/75',
    'peach-cream': 'bg-linear-to-br from-rose-100/80 via-amber-50/85 to-pink-100/80',
  };

  const activeBgClass = bgThemeClasses[bgTheme] || bgThemeClasses['sky-pink'];

  if (!isAuthenticated) {
    return (
      <div className="min-h-dvh flex flex-col bg-linear-to-br from-sky-100/70 via-white/95 to-pink-100/70 text-slate-700">
        {/* Minimal Header with only Brand & Login button */}
        <header className="w-full px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-linear-to-br from-sky-100 to-pink-100 flex items-center justify-center border border-sky-200/80 shadow-2xs shrink-0">
              <GraduationCap className="w-5 h-5 text-sky-600" />
            </div>
            <span className="text-sm sm:text-base font-bold text-slate-800 tracking-tight truncate">
              Quản lý chi tiêu
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              id="btn-header-login"
              type="button"
              onClick={() => {
                setAuthModalMode('login');
                setIsAuthModalOpen(true);
              }}
              className="px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold bg-sky-100 hover:bg-sky-200/80 active:scale-95 text-sky-800 border border-sky-200 transition shadow-2xs cursor-pointer"
            >
              Đăng nhập
            </button>
            <button
              id="btn-header-register"
              type="button"
              onClick={() => {
                setAuthModalMode('register');
                setIsAuthModalOpen(true);
              }}
              className="px-3.5 sm:px-4 py-2 rounded-xl text-xs font-medium text-pink-700 bg-pink-100/70 hover:bg-pink-100 active:scale-95 border border-pink-200/80 transition cursor-pointer"
            >
              Đăng ký
            </button>
          </div>
        </header>

        {/* Centered Screen with prominent Login & Register buttons */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 text-center">
          <div className="p-7 sm:p-12 rounded-3xl bg-white/85 backdrop-blur-md border border-sky-200/80 shadow-sm hover:shadow-md transition-all max-w-xl w-full">
            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-sky-100 to-pink-100 border border-sky-200/70 flex items-center justify-center mx-auto mb-4 sm:mb-5 shadow-2xs">
              <Heart className="w-6 h-6 text-pink-500" />
            </div>
            <h1 className="text-xl sm:text-3xl font-bold bg-linear-to-r from-sky-600 to-pink-500 bg-clip-text text-transparent tracking-tight leading-snug">
              Cùng nhau quản lý chi tiêu nhé
            </h1>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode('login');
                  setIsAuthModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-sky-500 hover:bg-sky-600 text-white shadow-xs transition active:scale-95 cursor-pointer"
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode('register');
                  setIsAuthModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-pink-500 hover:bg-pink-600 text-white shadow-xs transition active:scale-95 cursor-pointer"
              >
                Đăng ký tài khoản mới
              </button>
            </div>
          </div>
        </main>

        <AuthModal />
      </div>
    );
  }

  return (
    <div className={`min-h-dvh flex flex-col transition-colors duration-300 ${activeBgClass} text-slate-700 pb-24 md:pb-0`}>
      {/* Top slidebar navigation containing all requested tabs & functions */}
      <TopSlidebar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'transactions' && <TransactionsTab />}
        {activeTab === 'statistics' && <StatisticsTab />}
        {activeTab === 'budget' && <BudgetTab />}
        {activeTab === 'categories' && <CategoriesTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
      </main>

      {/* Mobile Bottom Navigation Bar + Quick Add Button */}
      <nav
        aria-label="Điều hướng di động"
        className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-sky-200/80 shadow-lg px-2 pb-safe"
      >
        <div className="max-w-md mx-auto relative">
          {/* Dấu cộng (+) nằm ở chính giữa trên cùng */}
          <div className="flex justify-center -mt-5 mb-0.5">
            <button
              type="button"
              id="btn-mobile-quick-add"
              onClick={() => setIsAddTxModalOpen(true)}
              className="w-11 h-11 rounded-full bg-linear-to-r from-sky-400 via-sky-300 to-pink-300 text-slate-800 border-[3px] border-white flex items-center justify-center shadow-md active:scale-95 transition cursor-pointer hover:scale-105"
              aria-label="Thêm giao dịch"
              title="Thêm giao dịch"
            >
              <Plus className="w-5 h-5 text-slate-800 stroke-[2.5]" />
            </button>
          </div>

          {/* 5 mục chia đều tỉ lệ ở dưới */}
          <div className="grid grid-cols-5 items-center gap-0.5 pb-1">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-semibold transition ${
                activeTab === 'overview'
                  ? 'text-sky-700 bg-sky-50/90'
                  : 'text-slate-500 active:bg-slate-50'
              }`}
            >
              <LayoutDashboard className={`w-4 h-4 mb-0.5 ${activeTab === 'overview' ? 'text-sky-600' : 'text-slate-400'}`} />
              <span className="truncate">Tổng quan</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('transactions')}
              className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-semibold transition ${
                activeTab === 'transactions'
                  ? 'text-sky-700 bg-sky-50/90'
                  : 'text-slate-500 active:bg-slate-50'
              }`}
            >
              <Receipt className={`w-4 h-4 mb-0.5 ${activeTab === 'transactions' ? 'text-sky-600' : 'text-slate-400'}`} />
              <span className="truncate">Giao dịch</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('statistics')}
              className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-semibold transition ${
                activeTab === 'statistics'
                  ? 'text-sky-700 bg-sky-50/90'
                  : 'text-slate-500 active:bg-slate-50'
              }`}
            >
              <PieChart className={`w-4 h-4 mb-0.5 ${activeTab === 'statistics' ? 'text-pink-500' : 'text-slate-400'}`} />
              <span className="truncate">Thống kê</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('budget')}
              className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-semibold transition ${
                activeTab === 'budget'
                  ? 'text-sky-700 bg-sky-50/90'
                  : 'text-slate-500 active:bg-slate-50'
              }`}
            >
              <Target className={`w-4 h-4 mb-0.5 ${activeTab === 'budget' ? 'text-pink-500' : 'text-slate-400'}`} />
              <span className="truncate">Ngân sách</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('categories')}
              className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-semibold transition ${
                activeTab === 'categories'
                  ? 'text-sky-700 bg-sky-50/90'
                  : 'text-slate-500 active:bg-slate-50'
              }`}
            >
              <Tags className={`w-4 h-4 mb-0.5 ${activeTab === 'categories' ? 'text-sky-600' : 'text-slate-400'}`} />
              <span className="truncate">Danh mục</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Footer */}
      <footer className="border-t border-sky-200/60 bg-white/85 backdrop-blur-md py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sky-700">Quản lý chi tiêu</span>
            <span>—</span>
            <span className="text-slate-500">Ứng dụng quản lý tài chính cá nhân</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-500">
            <span className="px-2.5 py-0.5 rounded-full bg-pink-100/80 text-pink-800 border border-pink-200/80 font-medium">
              Giao diện Pastel Xanh dương & Hồng phấn
            </span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <TransactionModal />
      <StudentToolsModal />
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <ExpenseProvider>
      <MainContent />
    </ExpenseProvider>
  );
}
