import React, { useRef, useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Target,
  Tags,
  Wallet,
  Bell,
  Plus,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  LogIn,
  LogOut,
  UserPlus,
  User,
  ShieldCheck,
  Palette,
  Users,
  CheckCheck,
  Trash2,
  Camera,
  ImagePlus,
  KeyRound,
} from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';
import { TabType, GenderType, BgThemeType } from '../types';
import { formatVND } from '../utils/format';

interface TabItem {
  id: TabType;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

export const TopSlidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    setIsAddTxModalOpen,
    setIsStudentToolOpen,
    selectedMonth,
    setSelectedMonth,
    totalBalance,
    monthlyExpense,
    resetToDefaults,
    currentUser,
    setIsAuthModalOpen,
    setAuthModalMode,
    logout,
    updateUserProfile,
  } = useExpense();

  const scrollRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);
  const [dismissGuestBanner, setDismissGuestBanner] = useState(false);

  // Compress and read image from phone photo album
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          updateUserProfile({ avatarUrl: dataUrl });
        }
      };
      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setIsNotifMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tabs: TabItem[] = [
    { id: 'overview', label: '1. Tổng quan', icon: LayoutDashboard },
    { id: 'transactions', label: '2. Giao dịch', icon: Receipt },
    { id: 'statistics', label: '3. Thống kê', icon: PieChart },
    { id: 'budget', label: '4. Ngân sách', icon: Target },
    { id: 'categories', label: '5. Danh mục', icon: Tags },
  ];

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Month navigation
  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const prevDate = new Date(year, month - 2, 1);
    const newMonthStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(newMonthStr);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const nextDate = new Date(year, month, 1);
    const newMonthStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(newMonthStr);
  };

  const [y, m] = selectedMonth.split('-');
  const displayMonthName = `Tháng ${parseInt(m, 10)} / ${y}`;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-sky-200/70 shadow-xs">
      {/* Top Main Brand Header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-2.5 pb-2.5">
        <div className="flex flex-col gap-2.5">
          {/* Row 1: Brand on Left + Top-Right Corner Controls (Bell & Circular Avatar always in top-right on both Mobile & Desktop) */}
          <div className="flex items-center justify-between gap-2">
            {/* Brand & Balance Summary */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-linear-to-br from-sky-100 to-pink-100 text-sky-700 flex items-center justify-center shadow-xs border border-sky-200/80 shrink-0">
                <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-xl font-bold tracking-tight text-slate-800 truncate">
                    Quản lý chi tiêu
                  </h1>
                </div>
                <div className="text-[11px] sm:text-xs text-slate-500 flex items-center flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                  {currentUser ? (
                    <>
                      <span className="truncate">
                        Số dư:{' '}
                        <strong className="text-sky-700 font-semibold">
                          {formatVND(totalBalance)}
                        </strong>
                      </span>
                      <span className="text-slate-300 hidden xs:inline">•</span>
                      <span className="truncate">
                        Chi:{' '}
                        <strong className="text-pink-600 font-medium">
                          {formatVND(monthlyExpense)}
                        </strong>
                      </span>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthModalMode('login');
                        setIsAuthModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 text-slate-500 hover:text-sky-700 transition cursor-pointer"
                      title="Đăng nhập để xem số dư và chi tiết tài chính"
                    >
                      <span>Số dư: <strong className="text-slate-400 font-mono">••••••• ₫</strong></span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Area: Desktop Action Tools + Always-Top-Right Bell & Circular User Avatar */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Desktop Month Switcher & Action Buttons */}
              <div className="hidden md:flex items-center gap-2">
                <div className="flex items-center bg-sky-50/80 rounded-xl p-1 border border-sky-200/70 text-xs text-slate-700">
                  <button
                    id="btn-prev-month"
                    onClick={handlePrevMonth}
                    className="p-1 rounded-lg hover:bg-white hover:shadow-xs transition text-sky-700"
                    title="Tháng trước"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-2 font-medium min-w-[95px] text-center text-slate-700">
                    {displayMonthName}
                  </span>
                  <button
                    id="btn-next-month"
                    onClick={handleNextMonth}
                    className="p-1 rounded-lg hover:bg-white hover:shadow-xs transition text-sky-700"
                    title="Tháng sau"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <button
                  id="btn-student-tools"
                  onClick={() => setIsStudentToolOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-pink-50 text-pink-700 border border-pink-200/80 hover:bg-pink-100 transition shadow-xs"
                  title="Công cụ chia tiền phòng trọ và mẹo tài chính"
                >
                  <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                  <span>Chia tiền & Mẹo</span>
                </button>

                <button
                  id="btn-add-transaction"
                  onClick={() => setIsAddTxModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-linear-to-r from-sky-200/90 to-pink-200/90 text-slate-800 border border-sky-300/80 hover:from-sky-200 hover:to-pink-200 transition shadow-2xs active:scale-95"
                >
                  <Plus className="w-4 h-4 text-sky-700" />
                  <span>Thêm giao dịch</span>
                </button>
              </div>

              {/* Top-Right Corner: Reset Sample Data, Compact Bell Notification Icon & Circular User Profile */}
              <div className="flex items-center gap-1.5 sm:gap-2 md:border-l md:border-sky-200/70 md:pl-2.5 md:ml-1">
                <button
                  id="btn-reset-data"
                  onClick={() => {
                    if (window.confirm('Khôi phục dữ liệu mẫu ban đầu?')) {
                      resetToDefaults();
                    }
                  }}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-slate-500 hover:text-pink-600 hover:bg-pink-50 transition cursor-pointer"
                  title="Khôi phục dữ liệu mẫu"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Compact Bell Icon (Thông báo thu nhỏ hình cái chuông ở góc phải trên cùng) */}
                <div className="relative" ref={notifMenuRef}>
                  <button
                    id="btn-top-right-bell"
                    type="button"
                    onClick={() => {
                      setIsNotifMenuOpen(!isNotifMenuOpen);
                      setIsUserMenuOpen(false);
                    }}
                    className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border transition-all cursor-pointer shadow-2xs ${
                      isNotifMenuOpen || activeTab === 'notifications'
                        ? 'bg-pink-100 border-pink-300 text-pink-700 shadow-xs'
                        : 'bg-sky-50/90 border-sky-200/80 text-sky-700 hover:bg-pink-50 hover:border-pink-200 hover:text-pink-600'
                    }`}
                    title="Thông báo"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-2xs">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Compact Bell Notification Popover (Mobile Responsive Width) */}
                  {isNotifMenuOpen && (
                    <div className="fixed sm:absolute right-3 sm:right-0 top-14 sm:top-auto sm:mt-2.5 w-[calc(100vw-1.5rem)] max-w-sm bg-white/95 backdrop-blur-md rounded-3xl shadow-xl border border-sky-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-sky-100">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center">
                            <Bell className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-bold text-slate-800">Thông báo</span>
                          {unreadCount > 0 && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
                              {unreadCount} mới
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={markAllNotificationsRead}
                            className="text-[11px] font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            Đọc tất cả
                          </button>
                        )}
                      </div>

                      <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-xs text-slate-400">
                            Không có thông báo nào
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => markNotificationRead(n.id)}
                              className={`p-2.5 rounded-2xl border transition cursor-pointer flex items-start justify-between gap-2 ${
                                n.isRead
                                  ? 'bg-slate-50/70 border-slate-100 text-slate-500'
                                  : 'bg-linear-to-r from-sky-50/80 to-pink-50/70 border-sky-200/80 text-slate-800 shadow-2xs'
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  {!n.isRead && (
                                    <span className="w-2 h-2 rounded-full bg-pink-500 shrink-0" />
                                  )}
                                  <p className="text-xs font-bold truncate">{n.title}</p>
                                </div>
                                <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">
                                  {n.message}
                                </p>
                                <span className="text-[10px] text-slate-400 mt-1 block">
                                  {n.date}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(n.id);
                                }}
                                className="p-1.5 text-slate-400 hover:text-pink-600 rounded-lg hover:bg-pink-50 transition"
                                title="Xóa thông báo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="pt-2.5 mt-2.5 border-t border-sky-100 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setIsNotifMenuOpen(false);
                            setActiveTab('notifications');
                          }}
                          className="w-full py-2 rounded-xl text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 transition cursor-pointer"
                        >
                          Xem tất cả thông báo
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile / Login & Logout Component in Top-Right Corner Circular Frame */}
                <div className="flex items-center" ref={userMenuRef}>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  {currentUser ? (
                    <div className="relative">
                      <button
                        id="btn-user-profile-menu"
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(!isUserMenuOpen);
                          setIsNotifMenuOpen(false);
                        }}
                        className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full p-0.5 bg-linear-to-tr from-sky-300 via-pink-300 to-sky-200 shadow-xs hover:shadow-md hover:scale-105 transition-all cursor-pointer flex items-center justify-center group"
                        title={`Tài khoản: ${currentUser.name} (Nhấn để đổi ảnh đại diện & giới tính)`}
                      >
                        {currentUser.avatarUrl ? (
                          <img
                            src={currentUser.avatarUrl}
                            alt={currentUser.name}
                            className="w-full h-full rounded-full object-cover border-2 border-white shadow-inner"
                          />
                        ) : (
                          <div
                            className="w-full h-full rounded-full text-white font-bold text-xs flex items-center justify-center border-2 border-white shadow-inner"
                            style={{ backgroundColor: currentUser.avatarColor || '#38bdf8' }}
                          >
                            {currentUser.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        {/* Online & Gender indicator dot on circular frame */}
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-white ${
                            currentUser.gender === 'male'
                              ? 'bg-sky-500'
                              : currentUser.gender === 'other'
                              ? 'bg-purple-400'
                              : 'bg-pink-400'
                          }`}
                        >
                          {currentUser.gender === 'male' ? '♂' : currentUser.gender === 'other' ? '✦' : '♀'}
                        </span>
                      </button>

                      {/* Dropdown Menu with Avatar Photo Picker, Gender & Background Theme Switcher */}
                      {isUserMenuOpen && (
                        <div className="fixed sm:absolute right-3 sm:right-0 top-14 sm:top-auto sm:mt-2.5 w-[calc(100vw-1.5rem)] max-w-xs bg-white/95 backdrop-blur-md rounded-3xl shadow-xl border border-sky-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-[82vh] overflow-y-auto">
                      {/* Profile Header with Circular Avatar & Quick Camera Button */}
                      <div className="p-3 bg-linear-to-r from-sky-50/90 to-pink-50/90 rounded-2xl border border-sky-100 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            {currentUser.avatarUrl ? (
                              <img
                                src={currentUser.avatarUrl}
                                alt={currentUser.name}
                                className="w-13 h-13 rounded-full object-cover shadow-xs border-2 border-white ring-2 ring-pink-200/70"
                              />
                            ) : (
                              <div
                                className="w-13 h-13 rounded-full text-white font-bold text-sm flex items-center justify-center shadow-xs border-2 border-white ring-2 ring-pink-200/70"
                                style={{ backgroundColor: currentUser.avatarColor || '#38bdf8' }}
                              >
                                {currentUser.name.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => avatarInputRef.current?.click()}
                              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-sky-500 hover:bg-sky-600 text-white border-2 border-white flex items-center justify-center shadow-xs cursor-pointer transition"
                              title="Chọn ảnh đại diện từ album điện thoại"
                            >
                              <Camera className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-bold text-slate-800 truncate">
                                {currentUser.name}
                              </h4>
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-sky-100 text-sky-800">
                                <ShieldCheck className="w-2.5 h-2.5" />
                                Online
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              {currentUser.phone ? `SĐT: ${currentUser.phone}` : currentUser.email}
                            </p>
                            <p className="text-[10px] text-pink-600 font-medium truncate mt-0.5">
                              Giới tính:{' '}
                              {currentUser.gender === 'male'
                                ? 'Nam ♂'
                                : currentUser.gender === 'other'
                                ? 'Khác ✦'
                                : 'Nữ ♀'}
                            </p>
                          </div>
                        </div>

                        {/* Change Avatar from Phone Album Button */}
                        <div className="mt-2.5 pt-2 border-t border-sky-200/60 flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => avatarInputRef.current?.click()}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl bg-white hover:bg-sky-50 text-sky-700 border border-sky-200/80 text-[11px] font-semibold transition shadow-2xs cursor-pointer"
                          >
                            <ImagePlus className="w-3.5 h-3.5 text-pink-500" />
                            <span>Đổi ảnh từ Album điện thoại</span>
                          </button>
                          {currentUser.avatarUrl && (
                            <button
                              type="button"
                              onClick={() => updateUserProfile({ avatarUrl: undefined })}
                              className="py-1.5 px-2 rounded-xl bg-white hover:bg-pink-50 text-slate-400 hover:text-pink-600 border border-slate-200 text-[11px] transition cursor-pointer"
                              title="Xóa ảnh đại diện, dùng chữ cái mặc định"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* 1. Chế độ thay đổi Giới tính */}
                      <div className="mb-3 px-1">
                        <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
                          <Users className="w-3.5 h-3.5 text-pink-500" />
                          Chế độ Giới tính:
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {(
                            [
                              { id: 'female', label: 'Nữ ♀', activeClass: 'bg-pink-100 border-pink-300 text-pink-800' },
                              { id: 'male', label: 'Nam ♂', activeClass: 'bg-sky-100 border-sky-300 text-sky-800' },
                              { id: 'other', label: 'Khác ✦', activeClass: 'bg-purple-100 border-purple-300 text-purple-800' },
                            ] as { id: GenderType; label: string; activeClass: string }[]
                          ).map((g) => {
                            const isSelected = (currentUser.gender || 'female') === g.id;
                            return (
                              <button
                                key={g.id}
                                type="button"
                                onClick={() => updateUserProfile({ gender: g.id })}
                                className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                                  isSelected
                                    ? `${g.activeClass} shadow-2xs`
                                    : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-sky-50/50'
                                }`}
                              >
                                {g.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="border-t border-sky-100 my-2" />

                      <div className="space-y-1 text-xs">
                        <button
                          type="button"
                          id="btn-user-edit-profile"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            setAuthModalMode('profile');
                            setIsAuthModalOpen(true);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-sky-50 transition text-left cursor-pointer"
                        >
                          <User className="w-4 h-4 text-sky-500" />
                          <span>Chỉnh sửa hồ sơ chi tiết</span>
                        </button>
                        <button
                          type="button"
                          id="btn-user-change-password"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            setAuthModalMode('change_password');
                            setIsAuthModalOpen(true);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-amber-50 transition text-left cursor-pointer font-medium"
                        >
                          <KeyRound className="w-4 h-4 text-amber-500" />
                          <span>Đổi mật khẩu tài khoản</span>
                        </button>
                        <button
                          type="button"
                          id="btn-user-logout"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-pink-600 hover:bg-pink-50 transition text-left font-semibold cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-pink-500" />
                          <span>Đăng xuất tài khoản</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    id="btn-header-login"
                    type="button"
                    onClick={() => {
                      setAuthModalMode('login');
                      setIsAuthModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-sky-100 hover:bg-sky-200/80 text-sky-800 border border-sky-200 transition shadow-2xs active:scale-95 cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5 text-sky-600" />
                    <span>Đăng nhập</span>
                  </button>
                  <button
                    id="btn-header-register"
                    type="button"
                    onClick={() => {
                      setAuthModalMode('register');
                      setIsAuthModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-pink-700 bg-pink-100/70 hover:bg-pink-100 border border-pink-200/80 transition cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-pink-500" />
                    <span>Đăng ký</span>
                  </button>
                </div>
              )}
              </div>
              </div>
            </div>
          </div>

          {/* Row 2 (Mobile Only): Month Switcher + Quick Action Buttons */}
          <div className="flex md:hidden items-center justify-between gap-2 pt-1 border-t border-sky-100/80">
            {/* Mobile Month Switcher */}
            <div className="flex items-center bg-sky-50/90 rounded-xl p-1 border border-sky-200/70 text-xs text-slate-700 shrink-0">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg active:bg-white transition text-sky-700"
                title="Tháng trước"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-1.5 font-semibold text-[11px] min-w-[78px] text-center text-slate-700">
                {displayMonthName}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg active:bg-white transition text-sky-700"
                title="Tháng sau"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsStudentToolOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl text-[11px] font-semibold bg-pink-50 text-pink-700 border border-pink-200/80 active:bg-pink-100 transition shadow-2xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                <span>Chia tiền & Mẹo</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Guest Mode notice banner when logged out */}
      {!currentUser && !dismissGuestBanner && (
        <div className="bg-linear-to-r from-sky-100/70 via-pink-100/60 to-sky-100/70 border-b border-pink-200/70 px-4 py-2 text-xs text-slate-700">
          <div className="flex items-center justify-between max-w-7xl mx-auto gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-white/90 font-bold text-pink-700 border border-pink-200 shrink-0">
                Chế độ Chức năng Cơ bản
              </span>
              <span className="hidden sm:inline">
                Bạn chưa đăng nhập nên toàn bộ <strong>số tiền và số dư đang được ẩn (••••••• ₫)</strong> để bảo mật. Đăng nhập để hiển thị đầy đủ thông tin tài chính!
              </span>
              <span className="sm:hidden">Đang ẩn số tiền — Đăng nhập để xem đầy đủ!</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                id="btn-banner-login"
                onClick={() => {
                  setAuthModalMode('login');
                  setIsAuthModalOpen(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-white text-sky-700 border border-sky-200 font-semibold hover:bg-sky-50 transition cursor-pointer shadow-2xs"
              >
                Đăng nhập ngay
              </button>
              <button
                onClick={() => setDismissGuestBanner(true)}
                className="text-slate-400 hover:text-pink-600 text-xs cursor-pointer"
                title="Đóng thông báo"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slidebar nằm ở trên là các chức năng (Horizontal sliding tabs bar) - Ẩn trên điện thoại (mobile) */}
      <div className="hidden md:block relative border-t border-sky-100 bg-linear-to-r from-sky-50/80 via-white to-pink-50/80">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 relative flex items-center">
          {/* Scroll arrow left */}
          <button
            onClick={() => scroll('left')}
            className="hidden md:flex items-center justify-center p-1.5 text-slate-400 hover:text-sky-600 transition mr-1 z-10"
            aria-label="Cuộn sang trái"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Sliding container */}
          <div
            ref={scrollRef}
            className="flex items-center gap-1.5 overflow-x-auto py-2.5 px-1 scroll-smooth no-scrollbar w-full"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative shrink-0 flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-linear-to-r from-sky-100/90 to-pink-100/90 text-slate-800 shadow-2xs border border-sky-200/90 font-semibold'
                      : 'text-slate-600 hover:text-sky-700 hover:bg-white/80 border border-transparent'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-pink-500' : 'text-sky-400 group-hover:text-sky-500'
                    }`}
                  />
                  <span className="whitespace-nowrap">{tab.label}</span>

                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-pink-200 text-pink-800 border border-pink-300 min-w-[18px]">
                      {tab.badge}
                    </span>
                  )}

                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-linear-to-r from-sky-300 to-pink-300 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Scroll arrow right */}
          <button
            onClick={() => scroll('right')}
            className="hidden md:flex items-center justify-center p-1.5 text-slate-400 hover:text-slate-700 transition ml-1 z-10"
            aria-label="Cuộn sang phải"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
