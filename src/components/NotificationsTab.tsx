import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  Clock,
  MessageSquare,
  Sparkles,
  Trash2,
  CheckCircle2,
  Calendar,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';
import { NotificationType } from '../types';
import { formatDateVi } from '../utils/format';

export const NotificationsTab: React.FC = () => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    setActiveTab,
    setIsAddTxModalOpen,
  } = useExpense();

  const [filterType, setFilterType] = useState<'all' | NotificationType>('all');

  const filtered = notifications.filter((n) => {
    if (filterType === 'all') return true;
    return n.type === filterType;
  });

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'payment_reminder':
        return <Clock className="w-5 h-5 text-pink-600" />;
      case 'budget_warning':
        return <AlertTriangle className="w-5 h-5 text-rose-600" />;
      case 'input_reminder':
        return <MessageSquare className="w-5 h-5 text-sky-600" />;
      case 'tip':
        return <Sparkles className="w-5 h-5 text-sky-600" />;
    }
  };

  const getBg = (type: NotificationType) => {
    switch (type) {
      case 'payment_reminder':
        return 'bg-pink-50 border-pink-200/80';
      case 'budget_warning':
        return 'bg-rose-50 border-rose-200/80';
      case 'input_reminder':
        return 'bg-sky-50 border-sky-200/80';
      case 'tip':
        return 'bg-sky-50 border-sky-200/80';
    }
  };

  const handleAction = (n: any) => {
    markNotificationRead(n.id);
    if (n.type === 'budget_warning') {
      setActiveTab('budget');
    } else if (n.type === 'payment_reminder') {
      setActiveTab('transactions');
    } else if (n.type === 'input_reminder') {
      setIsAddTxModalOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-sky-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-800">6. Trung tâm Thông báo</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Nhắc thanh toán hóa đơn, cảnh báo vượt hạn mức và nhắc ghi chép chi tiêu sinh viên
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={markAllNotificationsRead}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition"
          >
            <CheckCheck className="w-4 h-4" />
            Đánh dấu đã đọc tất cả
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-sky-200/70">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            filterType === 'all'
              ? 'bg-sky-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-sky-50'
          }`}
        >
          Tất cả ({notifications.length})
        </button>
        <button
          onClick={() => setFilterType('payment_reminder')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            filterType === 'payment_reminder'
              ? 'bg-pink-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-pink-50'
          }`}
        >
          Nhắc thanh toán
        </button>
        <button
          onClick={() => setFilterType('budget_warning')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            filterType === 'budget_warning'
              ? 'bg-rose-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-rose-50'
          }`}
        >
          Cảnh báo ngân sách
        </button>
        <button
          onClick={() => setFilterType('input_reminder')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            filterType === 'input_reminder'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-sky-50'
          }`}
        >
          Nhắc nhập giao dịch
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.map((item) => {
          return (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                item.isRead ? 'bg-white border-sky-100 opacity-80' : 'bg-white border-sky-300 ring-1 ring-sky-100 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${getBg(
                    item.type
                  )}`}
                >
                  {getIcon(item.type)}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4
                      className={`text-sm ${
                        item.isRead ? 'font-medium text-slate-700' : 'font-bold text-slate-900'
                      }`}
                    >
                      {item.title}
                    </h4>
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-pink-500 inline-block" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{item.message}</p>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    {formatDateVi(item.date)}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-sky-50">
                <button
                  onClick={() => handleAction(item)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-sky-50 text-sky-700 hover:bg-sky-100 transition border border-sky-200 flex items-center gap-1"
                >
                  <span>Xử lý ngay</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {!item.isRead && (
                  <button
                    onClick={() => markNotificationRead(item.id)}
                    className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg"
                    title="Đánh dấu đã đọc"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => deleteNotification(item.id)}
                  className="p-1.5 text-slate-400 hover:text-pink-600 rounded-lg"
                  title="Xóa thông báo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="bg-white p-12 rounded-2xl border border-sky-200/80 text-center">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-800">Không có thông báo nào</h4>
            <p className="text-xs text-slate-400 mt-1">
              Hệ thống sẽ hiển thị nhắc nhở khi đến hạn tiền trọ hoặc khi gần chạm ngân sách.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
