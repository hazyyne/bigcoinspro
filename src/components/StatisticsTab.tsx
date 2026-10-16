import React, { useState, useMemo } from 'react';
import {
  PieChart as PieIcon,
  TrendingUp,
  TrendingDown,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  Award,
} from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';
import { formatVND, formatCompactVND, getMonthLabel } from '../utils/format';
import { CategoryIcon } from './CategoryIcon';

export const StatisticsTab: React.FC = () => {
  const {
    transactions,
    categories,
    selectedMonth,
    monthlyIncome,
    monthlyExpense,
    monthlyNet,
    isAuthenticated,
    setIsAuthModalOpen,
    setAuthModalMode,
  } = useExpense();
  const [activeStatSubTab, setActiveStatSubTab] = useState<'category' | 'time' | 'comparison' | 'income-expense'>('category');

  // Month-filtered transactions
  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // 1. Chi tiêu theo danh mục
  const categoryStats = useMemo(() => {
    const expenseTxs = monthTransactions.filter((t) => t.type === 'expense');
    const totalExp = expenseTxs.reduce((sum, t) => sum + t.amount, 0);
    const map: Record<string, { count: number; amount: number }> = {};

    expenseTxs.forEach((tx) => {
      if (!map[tx.categoryId]) {
        map[tx.categoryId] = { count: 0, amount: 0 };
      }
      map[tx.categoryId].count += 1;
      map[tx.categoryId].amount += tx.amount;
    });

    const list = Object.entries(map).map(([catId, data]) => {
      const cat = categories.find((c) => c.id === catId);
      const percentage = totalExp > 0 ? (data.amount / totalExp) * 100 : 0;
      return {
        categoryId: catId,
        category: cat,
        count: data.count,
        amount: data.amount,
        percentage,
      };
    }).sort((a, b) => b.amount - a.amount);

    return { list, totalExp };
  }, [monthTransactions, categories]);

  // 2. Chi tiêu theo thời gian (Tuần 1, Tuần 2, Tuần 3, Tuần 4, Tuần 5)
  const weeklyStats = useMemo(() => {
    const weeks = [
      { label: 'Tuần 1 (1-7)', income: 0, expense: 0 },
      { label: 'Tuần 2 (8-14)', income: 0, expense: 0 },
      { label: 'Tuần 3 (15-21)', income: 0, expense: 0 },
      { label: 'Tuần 4 (22-28)', income: 0, expense: 0 },
      { label: 'Tuần 5 (29-hết)', income: 0, expense: 0 },
    ];

    monthTransactions.forEach((tx) => {
      const day = parseInt(tx.date.split('-')[2], 10);
      let weekIdx = 0;
      if (day <= 7) weekIdx = 0;
      else if (day <= 14) weekIdx = 1;
      else if (day <= 21) weekIdx = 2;
      else if (day <= 28) weekIdx = 3;
      else weekIdx = 4;

      if (tx.type === 'expense') {
        weeks[weekIdx].expense += tx.amount;
      } else {
        weeks[weekIdx].income += tx.amount;
      }
    });

    const maxVal = Math.max(...weeks.map((w) => Math.max(w.expense, w.income)), 100000);
    return { weeks, maxVal };
  }, [monthTransactions]);

  // 3. So sánh các tháng gần nhất (last 4 months)
  const monthlyComparison = useMemo(() => {
    const [yearNum, monthNum] = selectedMonth.split('-').map(Number);
    const monthsData = [];

    for (let i = 3; i >= 0; i--) {
      const d = new Date(yearNum, monthNum - 1 - i, 1);
      const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const txs = transactions.filter((t) => t.date.startsWith(mStr));
      const inc = txs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const exp = txs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

      monthsData.push({
        monthStr: mStr,
        label: `Tháng ${d.getMonth() + 1}`,
        income: inc,
        expense: exp,
        net: inc - exp,
        isCurrent: mStr === selectedMonth,
      });
    }

    const maxVal = Math.max(...monthsData.map((m) => Math.max(m.income, m.expense)), 500000);
    return { monthsData, maxVal };
  }, [selectedMonth, transactions]);

  // Savings rate calculation
  const savingsRate = monthlyIncome > 0 ? Math.round((monthlyNet / monthlyIncome) * 100) : 0;

  // Pie chart calculation (SVG angles)
  let cumulativeAngle = 0;
  const pieSlices = categoryStats.list.map((item) => {
    const angle = (item.percentage / 100) * 360;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;
    return {
      ...item,
      startAngle,
      angle,
      endAngle: cumulativeAngle,
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Savings Score for Student */}
      <div className="p-5 rounded-2xl bg-white border border-sky-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-800">Báo cáo & Thống kê chi tiêu</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 font-medium border border-sky-200">
              {getMonthLabel(selectedMonth)}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Phân tích số liệu trực quan giúp bạn nắm bắt dòng tiền và chi tiêu hợp lý
          </p>
        </div>

        {/* Student Saving badge */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-linear-to-r from-sky-100/80 to-pink-100/80 border border-sky-200/80">
          <div className="w-10 h-10 rounded-xl bg-white text-sky-600 border border-sky-200 flex items-center justify-center shrink-0 shadow-2xs">
            <Award className="w-5 h-5 text-pink-500" />
          </div>
          <div>
            <span className="text-[11px] text-sky-800 font-semibold uppercase tracking-wider block">
              Tỷ lệ tiết kiệm sinh viên
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-sky-900">
                {isAuthenticated ? (savingsRate >= 0 ? `${savingsRate}%` : '0%') : '••%'}
              </span>
              <span className="text-xs text-pink-600 font-medium">
                ({formatVND(Math.max(monthlyNet, 0))})
              </span>
            </div>
          </div>
        </div>
      </div>

      {!isAuthenticated && (
        <div className="p-4 rounded-2xl bg-linear-to-r from-sky-100/70 via-white to-pink-100/70 border border-pink-200/80 flex items-center justify-between gap-3 text-xs text-slate-700">
          <span>
            Bạn đang xem <strong>khung thống kê cơ bản</strong>. Hãy đăng nhập để hiển thị số tiền, tỷ lệ phần trăm và biểu đồ thu chi thực tế!
          </span>
          <button
            type="button"
            onClick={() => {
              setAuthModalMode('login');
              setIsAuthModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-linear-to-r from-sky-200 to-pink-200 text-slate-800 border border-sky-300/70 font-semibold hover:from-sky-300/80 hover:to-pink-300/80 transition shrink-0 cursor-pointer"
          >
            Đăng nhập ngay
          </button>
        </div>
      )}

      {/* Sub tabs: Chi tiêu theo danh mục / Chi tiêu theo thời gian / So sánh các tháng / Biểu đồ thu - chi */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-sky-200/70">
        <button
          onClick={() => setActiveStatSubTab('category')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeStatSubTab === 'category'
              ? 'bg-linear-to-r from-sky-200/90 to-pink-200/90 text-slate-800 border border-sky-300/70 shadow-2xs'
              : 'text-slate-600 hover:bg-sky-50 hover:text-sky-700'
          }`}
        >
          1. Chi tiêu theo danh mục
        </button>
        <button
          onClick={() => setActiveStatSubTab('time')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeStatSubTab === 'time'
              ? 'bg-linear-to-r from-sky-200/90 to-pink-200/90 text-slate-800 border border-sky-300/70 shadow-2xs'
              : 'text-slate-600 hover:bg-sky-50 hover:text-sky-700'
          }`}
        >
          2. Chi tiêu theo thời gian
        </button>
        <button
          onClick={() => setActiveStatSubTab('comparison')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeStatSubTab === 'comparison'
              ? 'bg-linear-to-r from-sky-200/90 to-pink-200/90 text-slate-800 border border-sky-300/70 shadow-2xs'
              : 'text-slate-600 hover:bg-sky-50 hover:text-sky-700'
          }`}
        >
          3. So sánh các tháng
        </button>
        <button
          onClick={() => setActiveStatSubTab('income-expense')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeStatSubTab === 'income-expense'
              ? 'bg-linear-to-r from-sky-200/90 to-pink-200/90 text-slate-800 border border-sky-300/70 shadow-2xs'
              : 'text-slate-600 hover:bg-sky-50 hover:text-sky-700'
          }`}
        >
          4. Biểu đồ thu – chi
        </button>
      </div>

      {/* View 1: Chi tiêu theo danh mục */}
      {activeStatSubTab === 'category' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Donut chart visual */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col items-center justify-center">
            <h3 className="text-sm font-bold text-slate-800 self-start mb-2">Tỷ trọng chi tiêu</h3>
            <p className="text-xs text-slate-400 self-start mb-6">Phân bổ ngân sách vào từng nhóm nhu cầu</p>

            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {categoryStats.totalExp > 0 ? (
                  pieSlices.map((slice, i) => {
                    // SVG stroke-dasharray for donut slices
                    const radius = 38;
                    const circumference = 2 * Math.PI * radius;
                    const strokeDash = (slice.percentage / 100) * circumference;
                    const strokeOffset = -((slice.startAngle / 360) * circumference);

                    return (
                      <circle
                        key={slice.categoryId || i}
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="transparent"
                        stroke={slice.category?.color || '#94a3b8'}
                        strokeWidth="16"
                        strokeDasharray={`${strokeDash} ${circumference}`}
                        strokeDashoffset={strokeOffset}
                        className="transition-all duration-300 hover:opacity-85"
                      />
                    );
                  })
                ) : (
                  <circle cx="50" cy="50" r="38" fill="transparent" stroke="#e2e8f0" strokeWidth="16" />
                )}
              </svg>

              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-[11px] text-slate-400">Tổng chi</span>
                <span className="text-sm font-bold text-slate-800">
                  {isAuthenticated ? `${formatCompactVND(categoryStats.totalExp)}₫` : '••••••• ₫'}
                </span>
              </div>
            </div>

            <div className="mt-6 w-full pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Số danh mục có chi:</span>
              <strong className="text-slate-800">{categoryStats.list.length} danh mục</strong>
            </div>
          </div>

          {/* Breakdown List */}
          <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Chi tiết các danh mục</h3>

            <div className="space-y-3.5">
              {categoryStats.list.map((item) => {
                const cat = item.category;
                if (!cat) return null;

                return (
                  <div key={item.categoryId} className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: cat.bgLight }}
                        >
                          <CategoryIcon icon={cat.icon} className="w-4 h-4" color={cat.color} />
                        </div>
                        <div>
                          <span className="font-semibold text-slate-800 block">{cat.name}</span>
                          <span className="text-[11px] text-slate-400">{item.count} giao dịch</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-slate-800 text-sm block">
                          {formatVND(item.amount)}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500">
                          {isAuthenticated ? `${item.percentage.toFixed(1)}% tổng chi` : '••% tổng chi'}
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-200/70 rounded-full h-2 overflow-hidden mt-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${isAuthenticated ? item.percentage : 30}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}

              {categoryStats.list.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Chưa có chi tiêu nào trong tháng {selectedMonth}.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* View 2: Chi tiêu theo thời gian (Theo từng tuần trong tháng) */}
      {activeStatSubTab === 'time' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-800">Chi tiêu theo các tuần trong tháng</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Theo dõi nhịp độ chi tiêu từng tuần để tránh tình trạng "đầu tháng rủng rỉnh, cuối tháng ăn mì gói"
            </p>
          </div>

          <div className="space-y-5">
            {weeklyStats.weeks.map((week, idx) => {
              const expRatio = weeklyStats.maxVal > 0 ? (week.expense / weeklyStats.maxVal) * 100 : 0;
              const incRatio = weeklyStats.maxVal > 0 ? (week.income / weeklyStats.maxVal) * 100 : 0;

              return (
                <div key={idx} className="p-4 rounded-xl bg-slate-50/70 border border-slate-100">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {week.label}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-sky-600 font-medium">Thu: +{formatVND(week.income)}</span>
                      <span className="text-pink-600 font-semibold">Chi: -{formatVND(week.expense)}</span>
                    </div>
                  </div>

                  {/* Dual Bar (Thu vs Chi) */}
                  <div className="space-y-1">
                    <div className="w-full bg-slate-200/60 rounded-full h-2 overflow-hidden flex">
                      <div
                        className="bg-pink-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${isAuthenticated ? expRatio : 30}%` }}
                        title={`Chi tiêu: ${formatVND(week.expense)}`}
                      />
                    </div>
                    {week.income > 0 && (
                      <div className="w-full bg-slate-200/60 rounded-full h-1.5 overflow-hidden flex">
                        <div
                          className="bg-sky-400 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${isAuthenticated ? incRatio : 40}%` }}
                          title={`Thu nhập: ${formatVND(week.income)}`}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* View 3: So sánh các tháng */}
      {activeStatSubTab === 'comparison' && (
        <div className="bg-white p-5 rounded-2xl border border-sky-200/80 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-800">So sánh 4 tháng gần nhất</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              So sánh quy mô dòng tiền thu - chi qua từng tháng
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {monthlyComparison.monthsData.map((m) => {
              return (
                <div
                  key={m.monthStr}
                  className={`p-4 rounded-2xl border transition ${
                    m.isCurrent
                      ? 'bg-linear-to-br from-sky-50/70 to-pink-50/70 border-sky-300 shadow-xs'
                      : 'bg-slate-50/70 border-slate-200/70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-slate-800">{m.label}</h4>
                    {m.isCurrent && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500 text-white">
                        Đang chọn
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Thu nhập:</span>
                      <strong className="text-sky-600 font-semibold">+{formatVND(m.income)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Chi tiêu:</span>
                      <strong className="text-pink-600 font-semibold">-{formatVND(m.expense)}</strong>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-200">
                      <span className="text-slate-600 font-medium">Chênh lệch:</span>
                      <strong className={`font-bold ${m.net >= 0 ? 'text-sky-700' : 'text-pink-600'}`}>
                        {m.net >= 0 ? `+${formatVND(m.net)}` : `-${formatVND(Math.abs(m.net))}`}
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* View 4: Biểu đồ thu - chi */}
      {activeStatSubTab === 'income-expense' && (
        <div className="bg-white p-5 rounded-2xl border border-sky-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800">Biểu đồ tổng quan Thu – Chi</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Đối sánh trực diện giữa tiền vào và tiền ra trong tháng
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-slate-600">
                <span className="w-3 h-3 rounded bg-sky-400 inline-block" /> Thu nhập
              </span>
              <span className="flex items-center gap-1 text-slate-600">
                <span className="w-3 h-3 rounded bg-pink-400 inline-block" /> Chi tiêu
              </span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-linear-to-br from-sky-50/50 via-white to-pink-50/50 border border-sky-100 flex flex-col items-center">
            <div className="h-56 w-full max-w-md flex items-end justify-center gap-12 border-b border-slate-200 pb-4">
              {/* Income Column */}
              <div className="flex flex-col items-center h-full justify-end group">
                <span className="text-xs font-bold text-sky-600 mb-2 group-hover:scale-105 transition">
                  +{formatVND(monthlyIncome)}
                </span>
                <div
                  className="w-16 sm:w-20 bg-sky-400 rounded-t-xl transition-all duration-500 shadow-xs"
                  style={{
                    height: `${
                      !isAuthenticated
                        ? 45
                        : Math.max(monthlyIncome, monthlyExpense) > 0
                        ? (monthlyIncome / Math.max(monthlyIncome, monthlyExpense)) * 100
                        : 10
                    }%`,
                  }}
                />
                <span className="text-xs font-medium text-slate-700 mt-2">Tổng Thu</span>
              </div>

              {/* Expense Column */}
              <div className="flex flex-col items-center h-full justify-end group">
                <span className="text-xs font-bold text-pink-600 mb-2 group-hover:scale-105 transition">
                  -{formatVND(monthlyExpense)}
                </span>
                <div
                  className="w-16 sm:w-20 bg-pink-400 rounded-t-xl transition-all duration-500 shadow-xs"
                  style={{
                    height: `${
                      !isAuthenticated
                        ? 35
                        : Math.max(monthlyIncome, monthlyExpense) > 0
                        ? (monthlyExpense / Math.max(monthlyIncome, monthlyExpense)) * 100
                        : 10
                    }%`,
                  }}
                />
                <span className="text-xs font-medium text-slate-700 mt-2">Tổng Chi</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-slate-500">
                Hiệu số ròng tháng này:
              </p>
              <h4 className={`text-lg font-bold mt-0.5 ${monthlyNet >= 0 ? 'text-sky-600' : 'text-pink-600'}`}>
                {monthlyNet >= 0 ? `Dư ${formatVND(monthlyNet)}` : `Âm ${formatVND(Math.abs(monthlyNet))}`}
              </h4>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
