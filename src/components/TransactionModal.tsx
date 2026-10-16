import React, { useState, useEffect } from 'react';
import { X, Plus, Calendar, Tag, CreditCard, AlignLeft, Check } from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';
import { TransactionType } from '../types';
import { formatVND } from '../utils/format';
import { CategoryIcon } from './CategoryIcon';

export const TransactionModal: React.FC = () => {
  const {
    isAddTxModalOpen,
    setIsAddTxModalOpen,
    editingTransaction,
    setEditingTransaction,
    categories,
    accounts,
    addTransaction,
    updateTransaction,
  } = useExpense();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<number>(0);
  const [categoryId, setCategoryId] = useState<string>('');
  const [accountId, setAccountId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState<string>('');
  const [isRecurring, setIsRecurring] = useState<boolean>(false);

  // Sync state when editing or opening
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(editingTransaction.amount);
      setCategoryId(editingTransaction.categoryId);
      setAccountId(editingTransaction.accountId);
      setDate(editingTransaction.date);
      setNote(editingTransaction.note);
      setIsRecurring(!!editingTransaction.isRecurring);
    } else {
      setType('expense');
      setAmount(0);
      const defaultCat = categories.find((c) => c.type === 'expense');
      setCategoryId(defaultCat ? defaultCat.id : categories[0]?.id || '');
      setAccountId(accounts[0]?.id || '');
      setDate(new Date().toISOString().slice(0, 10));
      setNote('');
      setIsRecurring(false);
    }
  }, [editingTransaction, isAddTxModalOpen, categories, accounts]);

  // Adjust category if type changes
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const validCat = categories.find((c) => c.type === newType);
    if (validCat) {
      setCategoryId(validCat.id);
    }
  };

  const handleClose = () => {
    setIsAddTxModalOpen(false);
    setEditingTransaction(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !categoryId || !accountId || !date) return;

    if (editingTransaction) {
      updateTransaction({
        ...editingTransaction,
        type,
        amount,
        categoryId,
        accountId,
        date,
        note: note.trim(),
        isRecurring,
      });
    } else {
      addTransaction({
        type,
        amount,
        categoryId,
        accountId,
        date,
        note: note.trim(),
        isRecurring,
      });
    }

    handleClose();
  };

  const availableCategories = categories.filter((c) => c.type === type);

  // Quick amount helper for students
  const addAmountDelta = (delta: number) => {
    setAmount((prev) => Math.max(prev + delta, 0));
  };

  if (!isAddTxModalOpen && !editingTransaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-sky-200 animate-in fade-in zoom-in-95 duration-150 max-h-[92dvh] overflow-y-auto pb-safe">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-sky-100 mb-4">
          <h3 className="text-base font-bold text-slate-800">
            {editingTransaction ? 'Chỉnh sửa giao dịch' : 'Thêm giao dịch mới'}
          </h3>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-sky-50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Switch Khoản chi / Khoản thu */}
          <div className="flex items-center p-1 bg-sky-50/80 rounded-2xl border border-sky-100">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                type === 'expense'
                  ? 'bg-white text-pink-600 shadow-xs border border-pink-200/70'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Khoản chi (-)
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                type === 'income'
                  ? 'bg-white text-sky-700 shadow-xs border border-sky-200/70'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Khoản thu (+)
            </button>
          </div>

          {/* Amount input */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Số tiền (VNĐ):
            </label>
            <div className="relative">
              <input
                type="number"
                step="1000"
                min="1000"
                required
                placeholder="Nhập số tiền..."
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full pl-4 pr-12 py-3 bg-sky-50/40 rounded-2xl border border-sky-200 text-xl font-bold text-slate-900 placeholder:text-sm placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                ₫
              </span>
            </div>

            {/* Quick student amount increments */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[10000, 20000, 35000, 50000, 100000, 500000].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setAmount(v)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-sky-50 text-sky-700 hover:bg-pink-50 hover:text-pink-700 hover:border-pink-200 border border-sky-100 transition"
                >
                  +{formatVND(v)}
                </button>
              ))}
            </div>
          </div>

          {/* Category Picker */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Danh mục:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto p-1">
              {availableCategories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`p-2 rounded-xl text-xs font-medium flex items-center gap-2 border transition text-left ${
                      isSelected
                        ? 'border-sky-400 bg-sky-50/70 text-sky-800 ring-1 ring-sky-300'
                        : 'border-slate-200/80 bg-white text-slate-700 hover:bg-sky-50/40'
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: cat.bgLight }}
                    >
                      <CategoryIcon icon={cat.icon} className="w-3.5 h-3.5" color={cat.color} />
                    </div>
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Account & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Ví / Tài khoản:
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({formatVND(acc.balance)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Ngày giao dịch:
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Ghi chú chi tiêu:
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Cơm trưa trường, Đổ xăng xe máy, Mua giáo trình..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Recurring toggle */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="cb-recurring"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            <label htmlFor="cb-recurring" className="text-xs text-slate-600 cursor-pointer select-none">
              Khoản chi/thu này lặp lại hàng tháng (Định kỳ)
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-linear-to-r from-sky-500 to-pink-500 hover:from-sky-600 hover:to-pink-600 text-white transition shadow-sm"
            >
              {editingTransaction ? 'Cập nhật giao dịch' : 'Lưu giao dịch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
