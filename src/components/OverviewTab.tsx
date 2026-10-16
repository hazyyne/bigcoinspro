import React, { useMemo, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  AlertCircle,
  Clock,
  PiggyBank,
  CheckCircle2,
  ChevronRight,
  Plus,
  Lock,
  LogIn,
  Edit3,
  X,
} from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';
import { formatVND, formatCompactVND, formatDateVi } from '../utils/format';
import { CategoryIcon } from './CategoryIcon';

export const OverviewTab: React.FC = () => {
  const {
    transactions,
    categories,
    accounts,
    updateAccount,
    budgets,
    selectedMonth,
    totalBalance,
    monthlyIncome,
    monthlyExpense,
    monthlyNet,
    setActiveTab,
    setIsAddTxModalOpen,
    setEditingTransaction,
    isAuthenticated,
    setIsAuthModalOpen,
    setAuthModalMode,
  } = useExpense();

  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [balanceInputs, setBalanceInputs] = useState<Record<string, string>>({});

  const openBalanceEditor = () => {
    if (!isAuthenticated) {
      setAuthModalMode('login');
      setIsAuthModalOpen(true);
      return;
    }
    const initial: Record<string, string> = {};
    accounts.forEach((acc) => {
      initial[acc.id] = acc.balance > 0 ? String(acc.balance) : '';
    });
    setBalanceInputs(initial);
    setIsBalanceModalOpen(true);
  };

  const handleSaveBalances = (e: React.FormEvent) => {
    e.preventDefault();
    accounts.forEach((acc) => {
      const val = Number(balanceInputs[acc.id] || 0);
      if (val !== acc.balance) {
        updateAccount({ ...acc, balance: val });
      }
    });
    setIsBalanceModalOpen(false);
  };

  // Transactions in current month
  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // Total monthly budget
  const totalBudget = useMemo(() => {
    const found = budgets.find((b) => b.month === selectedMonth && !b.categoryId);
    return found ? found.limitAmount : 0;
  }, [budgets, selectedMonth]);

  const budgetSpentPercent = totalBudget > 0 ? Math.min(Math.round((monthlyExpense / totalBudget) * 100), 100) : 0;
  const budgetRemaining = Math.max(totalBudget - monthlyExpense, 0);

  // Group expenses by category for top spending list
  const categorySpending = useMemo(() => {
    const map: Record<string, number> = {};
    monthTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        map[t.categoryId] = (map[t.categoryId] || 0) + t.amount;
      });

    return Object.entries(map)
      .map(([catId, amount]) => {
        const cat = categories.find((c) => c.id === catId);
        return {
          category: cat,
          amount,
          percentage: monthlyExpense > 0 ? Math.round((amount / monthlyExpense) * 100) : 0,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [monthTransactions, categories, monthlyExpense]);

  // Calculate daily spending over the month for the SVG chart
  const dailySpendingChart = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const dailyMap: Record<number, number> = {};

    for (let day = 1; day <= daysInMonth; day++) {
      dailyMap[day] = 0;
    }

    monthTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const day = parseInt(t.date.split('-')[2], 10);
        if (day) {
          dailyMap[day] = (dailyMap[day] || 0) + t.amount;
        }
      });

    const maxDayAmount = Math.max(...Object.values(dailyMap), 100000);
    return {
      days: Object.entries(dailyMap).map(([day, amount]) => ({
        day: Number(day),
        amount,
        heightRatio: amount / maxDayAmount,
      })),
      maxAmount: maxDayAmount,
    };
  }, [selectedMonth, monthTransactions]);

  // Recent 6 transactions
  const recentTransactions = transactions.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Guest Mode Call-To-Action Card when not logged in */}
      {!isAuthenticated && (
        <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-r from-sky-100/75 via-white to-pink-100/75 border border-sky-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/90 text-sky-600 flex items-center justify-center shrink-0 border border-sky-200 shadow-2xs">
              <Lock className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-800">
                  Đang ở chế độ Chức năng Cơ bản (Ẩn số tiền)
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-pink-100/90 text-pink-700 border border-pink-200">
                  Chưa đăng nhập
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Bạn có thể trải nghiệm tất cả các chức năng cơ bản, danh mục và công cụ sinh viên. Hãy đăng nhập để hiển thị đầy đủ số dư, số tiền thu chi và biểu đồ chi tiết!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setAuthModalMode('login');
              setIsAuthModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-linear-to-r from-sky-200 to-pink-200 hover:from-sky-300/80 hover:to-pink-300/80 text-slate-800 border border-sky-300/70 transition shadow-2xs shrink-0 cursor-pointer"
          >
            <LogIn className="w-4 h-4 text-sky-700" />
            <span>Đăng nhập để xem số tiền</span>
          </button>
        </div>
      )}

      {/* Overview Metric Cards (Soft Pastel Light Blue & Light Pink Tones) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tổng số dư hiện tại */}
        <div className="p-5 rounded-2xl bg-linear-to-br from-sky-50/90 via-white to-sky-100/50 border border-sky-200/80 shadow-xs hover:border-sky-300 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-800/80">Tổng số dư hiện tại</span>
            <button
              type="button"
              onClick={openBalanceEditor}
              title="Tự điền / Cập nhật số dư các ví"
              className="w-9 h-9 rounded-xl bg-sky-100/90 text-sky-600 hover:bg-sky-200/80 flex items-center justify-center border border-sky-200/70 group-hover:scale-105 transition cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
              {formatVND(totalBalance)}
            </h3>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-slate-500">Số dư khả dụng</span>
              <button
                type="button"
                onClick={openBalanceEditor}
                className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 underline cursor-pointer"
              >
                Nhập số dư ví
              </button>
            </div>
          </div>
        </div>

        {/* Thu nhập trong tháng */}
        <div className="p-5 rounded-2xl bg-linear-to-br from-sky-50/80 via-white to-teal-50/50 border border-sky-200/80 shadow-xs hover:border-sky-300 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-800/80">Thu nhập tháng này</span>
            <div className="w-9 h-9 rounded-xl bg-sky-100/90 text-sky-600 flex items-center justify-center border border-sky-200/70 group-hover:scale-105 transition">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-sky-600 tracking-tight">
              +{formatVND(monthlyIncome)}
            </h3>
            <p className="text-xs text-sky-600/80 mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              Lương + Phụ cấp gia đình
            </p>
          </div>
        </div>

        {/* Chi tiêu trong tháng */}
        <div className="p-5 rounded-2xl bg-linear-to-br from-pink-50/90 via-white to-rose-50/60 border border-pink-200/80 shadow-xs hover:border-pink-300 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-pink-800/80">Chi tiêu tháng này</span>
            <div className="w-9 h-9 rounded-xl bg-pink-100/90 text-pink-600 flex items-center justify-center border border-pink-200/70 group-hover:scale-105 transition">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-pink-500 tracking-tight">
              -{formatVND(monthlyExpense)}
            </h3>
            <p className="text-xs text-pink-500/90 mt-1 flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>{monthTransactions.filter((t) => t.type === 'expense').length} khoản chi sinh viên</span>
            </p>
          </div>
        </div>

        {/* Thặng dư / Tiết kiệm */}
        <div className="p-5 rounded-2xl bg-linear-to-br from-sky-50/80 via-white to-pink-50/80 border border-pink-200/80 shadow-xs hover:border-pink-300 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-800/80">Tích lũy / Dư tháng</span>
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-sky-100 to-pink-100 text-pink-600 flex items-center justify-center border border-pink-200/70 group-hover:scale-105 transition">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className={`text-2xl font-bold tracking-tight ${monthlyNet >= 0 ? 'text-sky-600' : 'text-pink-500'}`}>
              {monthlyNet >= 0 ? `+${formatVND(monthlyNet)}` : `-${formatVND(Math.abs(monthlyNet))}`}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {monthlyNet >= 0 ? (
                <span className="text-sky-600 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Quản lý chi tiêu rất tốt!
                </span>
              ) : (
                <span className="text-pink-500 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" /> Chi đang vượt thu
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Progress & Alert Banner: Ngân sách tháng */}
      <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-r from-sky-50/90 via-white to-pink-50/90 border border-sky-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-slate-800">
                Tiến độ ngân sách tháng
              </h4>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  budgetSpentPercent > 90
                    ? 'bg-pink-100 text-pink-700 border border-pink-200'
                    : budgetSpentPercent > 75
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-sky-100 text-sky-800 border border-sky-200'
                }`}
              >
                {isAuthenticated ? `Đã dùng ${budgetSpentPercent}%` : 'Đã ẩn %'}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Đã chi <strong className="text-pink-600">{formatVND(monthlyExpense)}</strong> / Hạn mức{' '}
              <strong className="text-slate-800">{formatVND(totalBudget)}</strong>. Còn lại:{' '}
              <strong className="text-sky-700 font-semibold">{formatVND(budgetRemaining)}</strong>.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('budget')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 bg-white hover:bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-200 transition shrink-0"
          >
            Quản lý ngân sách
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-200/70 rounded-full h-2.5 mt-3 overflow-hidden">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${
              !isAuthenticated
                ? 'bg-sky-200'
                : budgetSpentPercent > 90
                ? 'bg-pink-500'
                : budgetSpentPercent > 75
                ? 'bg-pink-400'
                : 'bg-linear-to-r from-sky-400 to-pink-400'
            }`}
            style={{ width: `${isAuthenticated ? Math.min(budgetSpentPercent, 100) : 35}%` }}
          />
        </div>
      </div>

      {/* Main Charts & Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Biểu đồ chi tiêu (Daily bar chart) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-sky-200/70 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-800">Biểu đồ chi tiêu theo ngày</h3>
              <p className="text-xs text-slate-500">Mức chi từng ngày trong tháng hiện tại</p>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-pink-50 text-pink-700 border border-pink-200/60">
              Cao nhất: {isAuthenticated ? `${formatCompactVND(dailySpendingChart.maxAmount)}₫` : '••••••• ₫'}
            </span>
          </div>

          {/* Interactive SVG Bar chart */}
          <div className="relative pt-6 pb-2">
            <div className="h-44 flex items-end gap-1 sm:gap-1.5 px-1 border-b border-slate-200">
              {dailySpendingChart.days.map((item) => {
                const heightPercent = isAuthenticated ? Math.max(item.heightRatio * 100, 4) : 15;
                return (
                  <div
                    key={item.day}
                    className="flex-1 flex flex-col items-center h-full justify-end group relative"
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                      <div className="bg-slate-900 text-white text-[11px] rounded-lg py-1 px-2 shadow-lg whitespace-nowrap">
                        <div className="font-semibold">Ngày {item.day}:</div>
                        <div>{formatVND(item.amount)}</div>
                      </div>
                      <div className="w-2 h-1 bg-slate-900 rotate-45 -mt-0.5" />
                    </div>

                    <div
                      className={`w-full rounded-t-sm transition-all duration-300 ${
                        item.amount > 0
                          ? 'bg-pink-300 group-hover:bg-pink-400'
                          : 'bg-sky-50'
                      }`}
                      style={{ height: `${item.amount > 0 ? heightPercent : 4}%` }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Day indices footer */}
            <div className="flex justify-between text-[10px] text-slate-400 mt-2 px-1">
              <span>Ngày 1</span>
              <span>Ngày 5</span>
              <span>Ngày 10</span>
              <span>Ngày 15</span>
              <span>Ngày 20</span>
              <span>Ngày 25</span>
              <span>Ngày {dailySpendingChart.days.length}</span>
            </div>
          </div>
        </div>

        {/* Top Danh mục chi tiêu */}
        <div className="p-5 rounded-2xl bg-white border border-pink-200/70 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-800">Cơ cấu chi tiêu</h3>
              <button
                onClick={() => setActiveTab('statistics')}
                className="text-xs font-medium text-sky-600 hover:underline"
              >
                Xem chi tiết
              </button>
            </div>

            <div className="space-y-3.5">
              {categorySpending.slice(0, 5).map((item, idx) => {
                const cat = item.category;
                if (!cat) return null;
                return (
                  <div key={cat.id || idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: cat.bgLight }}
                        >
                          <CategoryIcon icon={cat.icon} className="w-3.5 h-3.5" color={cat.color} />
                        </div>
                        <span className="font-medium text-slate-700">{cat.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-slate-800">{formatVND(item.amount)}</span>
                        <span className="text-slate-400 ml-1">
                          ({isAuthenticated ? `${item.percentage}%` : '••%'})
                        </span>
                      </div>
                    </div>
                    {/* Progress line */}
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${isAuthenticated ? item.percentage : 30}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}

              {categorySpending.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Chưa có khoản chi tiêu nào trong tháng này.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <button
              onClick={() => setIsAddTxModalOpen(true)}
              className="w-full py-2 px-3 rounded-xl text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200/80 transition flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Ghi chép chi tiêu ngay
            </button>
          </div>
        </div>
      </div>

      {/* Các giao dịch gần đây */}
      <div className="p-5 rounded-2xl bg-white border border-sky-200/70 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-500" />
            <h3 className="text-base font-semibold text-slate-800">Các giao dịch gần đây</h3>
          </div>
          <button
            onClick={() => setActiveTab('transactions')}
            className="text-xs font-medium text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1"
          >
            Xem tất cả ({transactions.length})
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {recentTransactions.map((tx) => {
            const cat = categories.find((c) => c.id === tx.categoryId);
            const acc = accounts.find((a) => a.id === tx.accountId);
            const isExpense = tx.type === 'expense';

            return (
              <div
                key={tx.id}
                onClick={() => setEditingTransaction(tx)}
                className="py-3 flex items-center justify-between hover:bg-sky-50/40 px-2 rounded-xl transition cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
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
                      <h4 className="text-sm font-semibold text-slate-800 group-hover:text-sky-700 transition">
                        {cat?.name || 'Giao dịch'}
                      </h4>
                      {tx.isRecurring && (
                        <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-sky-50 text-sky-700 border border-sky-200">
                          Định kỳ
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      {tx.note || 'Không có ghi chú'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-sm font-bold block ${
                      isExpense ? 'text-pink-600' : 'text-sky-600'
                    }`}
                  >
                    {isExpense ? '-' : '+'}
                    {formatVND(tx.amount)}
                  </span>
                  <div className="text-[11px] text-slate-400 mt-0.5 flex items-center justify-end gap-1.5">
                    <span>{acc?.name}</span>
                    <span>•</span>
                    <span>{formatDateVi(tx.date)}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {recentTransactions.length === 0 && (
            <div className="py-8 text-center text-slate-400 text-xs">
              Chưa có giao dịch nào được ghi lại. Hãy nhấn <strong>"+ Ghi thu chi"</strong> hoặc <strong>"Nhập số dư ví"</strong> để bắt đầu!
            </div>
          )}
        </div>
      </div>

      {/* Modal Tự điền số dư các ví / tài khoản */}
      {isBalanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-sky-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-sky-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    Tự điền số dư các ví
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Nhập số tiền hiện có của bạn trong từng tài khoản
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBalanceModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-sky-50 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBalances} className="space-y-3.5">
              {accounts.map((acc) => (
                <div key={acc.id}>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    {acc.name} (VNĐ):
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="Nhập số tiền hiện có (VD: 500000)..."
                    value={balanceInputs[acc.id] ?? ''}
                    onChange={(e) =>
                      setBalanceInputs((prev) => ({
                        ...prev,
                        [acc.id]: e.target.value,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 bg-sky-50/40 rounded-xl border border-sky-200 text-sm font-bold text-slate-800 placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition"
                  />
                </div>
              ))}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBalanceModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-linear-to-r from-sky-500 to-pink-500 hover:from-sky-600 hover:to-pink-600 text-white transition shadow-xs cursor-pointer"
                >
                  Lưu số dư
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
