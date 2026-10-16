import React, { useState, useMemo } from 'react';
import {
  Target,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit3,
  TrendingDown,
  Sparkles,
  Info,
} from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';
import { formatVND, getMonthLabel } from '../utils/format';
import { CategoryIcon } from './CategoryIcon';

export const BudgetTab: React.FC = () => {
  const {
    categories,
    transactions,
    budgets,
    setBudgetLimit,
    selectedMonth,
    monthlyExpense,
    isAuthenticated,
    setIsAuthModalOpen,
    setAuthModalMode,
  } = useExpense();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCatForEdit, setSelectedCatForEdit] = useState<string | undefined>(undefined);
  const [editLimitAmount, setEditLimitAmount] = useState<number>(0);
  const [editThreshold, setEditThreshold] = useState<number>(80);

  // Month-filtered expense transactions
  const monthExpenseTransactions = useMemo(() => {
    return transactions.filter(
      (t) => t.date.startsWith(selectedMonth) && t.type === 'expense'
    );
  }, [transactions, selectedMonth]);

  // Overall monthly budget
  const totalBudget = useMemo(() => {
    const b = budgets.find((item) => item.month === selectedMonth && !item.categoryId);
    return b ? b.limitAmount : 0;
  }, [budgets, selectedMonth]);

  const totalUsed = monthlyExpense;
  const totalRemaining = Math.max(totalBudget - totalUsed, 0);
  const totalPercentage = totalBudget > 0 ? Math.round((totalUsed / totalBudget) * 100) : 0;

  // Category budgets
  const categoryBudgetList = useMemo(() => {
    const expenseCategories = categories.filter((c) => c.type === 'expense');

    return expenseCategories.map((cat) => {
      const budgetItem = budgets.find(
        (b) => b.month === selectedMonth && b.categoryId === cat.id
      );
      const limit = budgetItem ? budgetItem.limitAmount : 0;
      const threshold = budgetItem ? budgetItem.alertThreshold : 80;

      const used = monthExpenseTransactions
        .filter((t) => t.categoryId === cat.id)
        .reduce((sum, t) => sum + t.amount, 0);

      const remaining = Math.max(limit - used, 0);
      const percentage = limit > 0 ? Math.round((used / limit) * 100) : 0;

      let status: 'safe' | 'warning' | 'danger' | 'no-budget' = 'safe';
      if (limit === 0) {
        status = 'no-budget';
      } else if (percentage >= 100) {
        status = 'danger';
      } else if (percentage >= threshold) {
        status = 'warning';
      }

      return {
        category: cat,
        limit,
        used,
        remaining,
        percentage,
        threshold,
        status,
        budgetId: budgetItem?.id,
      };
    }).sort((a, b) => b.percentage - a.percentage);
  }, [categories, budgets, selectedMonth, monthExpenseTransactions]);

  const openEditor = (catId?: string) => {
    setSelectedCatForEdit(catId);
    if (!catId) {
      // Total monthly budget
      setEditLimitAmount(totalBudget);
      setEditThreshold(85);
    } else {
      const existing = budgets.find((b) => b.month === selectedMonth && b.categoryId === catId);
      setEditLimitAmount(existing ? existing.limitAmount : 0);
      setEditThreshold(existing ? existing.alertThreshold : 80);
    }
    setIsEditModalOpen(true);
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (editLimitAmount <= 0) return;
    setBudgetLimit(selectedCatForEdit, editLimitAmount, editThreshold);
    setIsEditModalOpen(false);
  };

  // Warning count
  const warningCount = categoryBudgetList.filter((b) => b.status === 'warning' || b.status === 'danger').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Budget Health */}
      <div className="p-5 rounded-2xl bg-white border border-sky-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-800">Quản lý ngân sách sinh viên</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 font-medium border border-sky-200">
              {getMonthLabel(selectedMonth)}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Đặt giới hạn chi tiêu để không bị cạn túi trước ngày nhận trợ cấp hoặc lương
          </p>
        </div>

        {warningCount > 0 ? (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-pink-50 border border-pink-200 text-pink-800 text-xs font-medium">
            <AlertTriangle className="w-4 h-4 text-pink-600 shrink-0" />
            <span>Có {warningCount} danh mục đang tiệm cận hoặc vượt ngân sách!</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
            <span>Ngân sách tháng này đang ở mức an toàn</span>
          </div>
        )}
      </div>

      {/* 1. Ngân sách theo tháng (Tổng quan) */}
      <div className="p-6 rounded-2xl bg-linear-to-br from-sky-50/70 via-white to-pink-50/70 border border-sky-200/90 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-100/90 text-sky-700 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Tổng ngân sách trong tháng</h3>
              <p className="text-xs text-slate-500">Hạn mức chi tiêu tối đa dự kiến cho cả tháng</p>
            </div>
          </div>

          <button
            onClick={() => openEditor(undefined)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-sky-700 bg-white hover:bg-sky-50 border border-sky-300 transition shadow-2xs self-start sm:self-auto"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Chỉnh sửa hạn mức tháng
          </button>
        </div>

        {/* Numbers grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
          <div className="p-3.5 rounded-xl bg-white border border-sky-200/70">
            <span className="text-xs text-slate-500 block">Hạn mức định sẵn:</span>
            <span className="text-lg font-bold text-slate-800">{formatVND(totalBudget)}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-white border border-pink-200/70">
            <span className="text-xs text-slate-500 block">Số tiền đã sử dụng:</span>
            <span className="text-lg font-bold text-pink-600">{formatVND(totalUsed)}</span>
            <span className="text-xs text-slate-400 ml-1">
              ({isAuthenticated ? `${totalPercentage}%` : '••%'})
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-white border border-sky-200/70">
            <span className="text-xs text-slate-500 block">Số tiền còn lại:</span>
            <span className="text-lg font-bold text-sky-700">{formatVND(totalRemaining)}</span>
          </div>
        </div>

        {/* Progress Bar with safe/warning/danger color */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Tiến độ tiêu dùng</span>
            <span className="font-semibold text-slate-700">
              {isAuthenticated ? `${totalPercentage}%` : '••%'}
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                !isAuthenticated
                  ? 'bg-sky-200'
                  : totalPercentage >= 100
                  ? 'bg-pink-500'
                  : totalPercentage >= 80
                  ? 'bg-pink-400'
                  : 'bg-linear-to-r from-sky-400 to-pink-400'
              }`}
              style={{ width: `${isAuthenticated ? Math.min(totalPercentage, 100) : 35}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Ngân sách theo từng danh mục */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">Ngân sách theo danh mục chi tiêu</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Phân bổ số tiền cho tiền trọ, ăn uống, di chuyển, mua sắm...
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categoryBudgetList.map((item) => {
            const cat = item.category;

            return (
              <div
                key={cat.id}
                className={`p-5 rounded-2xl bg-white border transition-all ${
                  item.status === 'danger'
                    ? 'border-pink-300 ring-1 ring-pink-200 shadow-xs'
                    : item.status === 'warning'
                    ? 'border-amber-300 ring-1 ring-amber-200 shadow-xs'
                    : 'border-sky-200/80 shadow-xs'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: cat.bgLight }}
                    >
                      <CategoryIcon icon={cat.icon} className="w-5 h-5" color={cat.color} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{cat.name}</h4>
                      <span className="text-[11px] text-slate-400">
                        Cảnh báo khi đạt {item.threshold}%
                      </span>
                    </div>
                  </div>

                  {/* Status Badge & Edit */}
                  <div className="flex items-center gap-2">
                    {item.status === 'danger' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 border border-pink-200">
                        <AlertCircle className="w-3 h-3" /> Đã vượt
                      </span>
                    )}
                    {item.status === 'warning' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                        <AlertTriangle className="w-3 h-3" /> Sắp vượt
                      </span>
                    )}
                    {item.status === 'safe' && item.limit > 0 && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                        <CheckCircle2 className="w-3 h-3" /> An toàn
                      </span>
                    )}

                    <button
                      onClick={() => openEditor(cat.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-sky-700 hover:bg-sky-50 transition"
                      title="Thiết lập hạn mức"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Amount details */}
                {item.limit > 0 ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-xs py-2 px-3 rounded-xl bg-sky-50/40 border border-sky-100">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Hạn mức:</span>
                        <strong className="text-slate-700 font-semibold">{formatVND(item.limit)}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Đã dùng:</span>
                        <strong className={item.status === 'danger' ? 'text-pink-600' : 'text-slate-700'}>
                          {formatVND(item.used)}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Còn lại:</span>
                        <strong className="text-sky-700 font-semibold">
                          {formatVND(item.remaining)}
                        </strong>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>Đã chi:</span>
                        <span className="font-bold">
                          {isAuthenticated ? `${item.percentage}%` : '••%'}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            !isAuthenticated
                              ? 'bg-sky-200'
                              : item.status === 'danger'
                              ? 'bg-pink-500'
                              : item.status === 'warning'
                              ? 'bg-amber-500'
                              : 'bg-sky-400'
                          }`}
                          style={{ width: `${isAuthenticated ? Math.min(item.percentage, 100) : 30}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center border-t border-slate-100 mt-2">
                    <p className="text-xs text-slate-400 mb-2">Chưa thiết lập ngân sách cho danh mục này.</p>
                    <button
                      onClick={() => openEditor(cat.id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700"
                    >
                      <Plus className="w-3.5 h-3.5" /> Đặt hạn mức ngay
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-sky-200">
            <h3 className="text-base font-bold text-slate-800 mb-1">
              {selectedCatForEdit
                ? `Đặt hạn mức: ${categories.find((c) => c.id === selectedCatForEdit)?.name}`
                : 'Đặt tổng ngân sách tháng'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Hạn mức áp dụng cho tháng {selectedMonth}
            </p>

            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Số tiền hạn mức (VNĐ):
                </label>
                <input
                  type="number"
                  step="10000"
                  min="0"
                  required
                  placeholder="Nhập hạn mức chi tiêu (VD: 3000000)..."
                  value={editLimitAmount || ''}
                  onChange={(e) => setEditLimitAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
                <span className="text-xs text-sky-700 font-medium mt-1 block">
                  ≈ {formatVND(editLimitAmount, true)}
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Ngưỡng cảnh báo trước khi vượt (%):
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="50"
                    max="95"
                    step="5"
                    value={editThreshold}
                    onChange={(e) => setEditThreshold(Number(e.target.value))}
                    className="w-full accent-sky-500"
                  />
                  <span className="text-xs font-bold text-slate-700 w-12 text-right">
                    {editThreshold}%
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Ứng dụng sẽ gửi thông báo cảnh báo khi bạn chi tiêu chạm {editThreshold}% hạn mức.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-600 text-white transition shadow-xs"
                >
                  Lưu ngân sách
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
