import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Trash2,
  Edit2,
  Calendar,
  Layers,
  CreditCard,
  RotateCcw,
} from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';
import { formatVND, formatDateVi, getMonthLabel } from '../utils/format';
import { CategoryIcon } from './CategoryIcon';
import { TransactionType } from '../types';

export const TransactionsTab: React.FC = () => {
  const {
    transactions,
    categories,
    accounts,
    deleteTransaction,
    setIsAddTxModalOpen,
    setEditingTransaction,
    selectedMonth,
    isAuthenticated,
    setIsAuthModalOpen,
    setAuthModalMode,
  } = useExpense();

  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  const [onlyCurrentMonth, setOnlyCurrentMonth] = useState<boolean>(true);

  // Filtered and sorted transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Month filter
      if (onlyCurrentMonth && !tx.date.startsWith(selectedMonth)) {
        return false;
      }
      // Type filter (Tất cả, Khoản thu, Khoản chi)
      if (filterType !== 'all' && tx.type !== filterType) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'all' && tx.categoryId !== selectedCategory) {
        return false;
      }
      // Account filter
      if (selectedAccount !== 'all' && tx.accountId !== selectedAccount) {
        return false;
      }
      // Search note or amount
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const cat = categories.find((c) => c.id === tx.categoryId);
        const matchNote = tx.note.toLowerCase().includes(term);
        const matchCat = cat?.name.toLowerCase().includes(term);
        const matchAmount = isAuthenticated && tx.amount.toString().includes(term);
        if (!matchNote && !matchCat && !matchAmount) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      return 0;
    });
  }, [
    transactions,
    onlyCurrentMonth,
    selectedMonth,
    filterType,
    selectedCategory,
    selectedAccount,
    searchTerm,
    sortBy,
    categories,
  ]);

  // Aggregate stats for current view
  const totalFilteredIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFilteredExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const resetFilters = () => {
    setFilterType('all');
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedAccount('all');
    setSortBy('date-desc');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-sky-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Quản lý giao dịch</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Xem, tìm kiếm, lọc và phân loại các khoản thu chi sinh viên
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-add-tx-main"
            onClick={() => setIsAddTxModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-linear-to-r from-sky-200/90 to-pink-200/90 text-slate-800 border border-sky-300/80 hover:from-sky-200 hover:to-pink-200 transition shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-sky-700" />
            Thêm giao dịch mới
          </button>
        </div>
      </div>

      {/* Main Tabs: Tất cả giao dịch / Khoản thu / Khoản chi */}
      <div className="flex items-center gap-2 bg-sky-50/80 p-1.5 rounded-2xl border border-sky-200/70 max-w-md">
        <button
          onClick={() => setFilterType('all')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold transition ${
            filterType === 'all'
              ? 'bg-white text-sky-800 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Tất cả giao dịch ({transactions.length})
        </button>
        <button
          onClick={() => setFilterType('income')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold transition ${
            filterType === 'income'
              ? 'bg-white text-sky-700 shadow-xs'
              : 'text-slate-500 hover:text-sky-700'
          }`}
        >
          <ArrowDownLeft className="w-3.5 h-3.5 text-sky-600" />
          Khoản thu
        </button>
        <button
          onClick={() => setFilterType('expense')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold transition ${
            filterType === 'expense'
              ? 'bg-white text-pink-700 shadow-xs'
              : 'text-slate-500 hover:text-pink-700'
          }`}
        >
          <ArrowUpRight className="w-3.5 h-3.5 text-pink-600" />
          Khoản chi
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search input */}
        <div className="relative lg:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo ghi chú, tên danh mục, số tiền..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition shadow-2xs"
          />
        </div>

        {/* Category filter */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-sky-400 transition shadow-2xs"
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} ({cat.type === 'income' ? 'Thu' : 'Chi'})
              </option>
            ))}
          </select>
        </div>

        {/* Account filter */}
        <div>
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-sky-400 transition shadow-2xs"
          >
            <option value="all">Tất cả ví & tài khoản</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort by */}
        <div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-sky-400 transition shadow-2xs"
          >
            <option value="date-desc">Mới nhất trước</option>
            <option value="date-asc">Cũ nhất trước</option>
            <option value="amount-desc">Số tiền cao nhất</option>
            <option value="amount-asc">Số tiền thấp nhất</option>
          </select>
        </div>
      </div>

      {/* Quick month toggle button */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={onlyCurrentMonth}
            onChange={(e) => setOnlyCurrentMonth(e.target.checked)}
            className="rounded border-slate-300 text-sky-500 focus:ring-sky-400"
          />
          <span>Chỉ hiển thị giao dịch trong tháng đang chọn</span>
        </label>

        {(searchTerm || selectedCategory !== 'all' || selectedAccount !== 'all' || filterType !== 'all') && (
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-700 hover:underline"
          >
            <RotateCcw className="w-3 h-3" />
            Đặt lại bộ lọc
          </button>
        )}
      </div>

      {/* Filter Summary Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-linear-to-r from-sky-50/70 via-white to-pink-50/70 rounded-2xl border border-sky-200/70 text-xs">
        <div className="grid grid-cols-3 gap-3 flex-1">
          <div>
            <span className="text-slate-400 block">Số lượng kết quả:</span>
            <strong className="text-slate-700 font-semibold">{filteredTransactions.length} giao dịch</strong>
          </div>
          <div>
            <span className="text-slate-400 block">Tổng thu danh sách:</span>
            <strong className="text-sky-600 font-semibold">+{formatVND(totalFilteredIncome)}</strong>
          </div>
          <div>
            <span className="text-slate-400 block">Tổng chi danh sách:</span>
            <strong className="text-pink-600 font-semibold">-{formatVND(totalFilteredExpense)}</strong>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-2xl border border-sky-200/80 shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filteredTransactions.map((tx) => {
            const cat = categories.find((c) => c.id === tx.categoryId);
            const acc = accounts.find((a) => a.id === tx.accountId);
            const isExpense = tx.type === 'expense';

            return (
              <div
                key={tx.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-sky-50/40 transition"
              >
                {/* Left: Icon & Info */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs"
                    style={{ backgroundColor: cat?.bgLight || '#f1f5f9' }}
                  >
                    <CategoryIcon
                      icon={cat?.icon || 'HelpCircle'}
                      className="w-5 h-5"
                      color={cat?.color || '#64748b'}
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-slate-800">
                        {cat?.name || 'Giao dịch'}
                      </h4>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          isExpense
                            ? 'bg-pink-50 text-pink-700 border border-pink-200/60'
                            : 'bg-sky-50 text-sky-700 border border-sky-200/60'
                        }`}
                      >
                        {isExpense ? 'Khoản chi' : 'Khoản thu'}
                      </span>
                      {tx.isRecurring && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                          Định kỳ
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{tx.note || 'Không có ghi chú'}</p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <CreditCard className="w-3 h-3" />
                        {acc?.name || 'Ví/Tài khoản'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDateVi(tx.date)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="sm:text-right">
                    <span
                      className={`text-base font-bold block ${
                        isExpense ? 'text-pink-600' : 'text-sky-600'
                      }`}
                    >
                      {isExpense ? '-' : '+'}
                      {formatVND(tx.amount)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {tx.date}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingTransaction(tx)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition"
                      title="Chỉnh sửa giao dịch"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Bạn có chắc chắn muốn xóa giao dịch này? Số dư ví sẽ được hoàn lại.')) {
                          deleteTransaction(tx.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-pink-600 hover:bg-pink-50 transition"
                      title="Xóa giao dịch"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredTransactions.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-400 flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-slate-700">Không tìm thấy giao dịch nào</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Thử đổi từ khóa tìm kiếm hoặc bấm Đặt lại bộ lọc để xem đầy đủ giao dịch.
              </p>
              <button
                onClick={() => setIsAddTxModalOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-sky-500 text-white hover:bg-sky-600 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm giao dịch ngay
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
