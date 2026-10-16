let globalShowMoney = false;

export const setGlobalShowMoney = (show: boolean) => {
  globalShowMoney = show;
};

export const getGlobalShowMoney = (): boolean => globalShowMoney;

export const MASKED_AMOUNT_TEXT = '••••••• ₫';
export const MASKED_COMPACT_TEXT = '•••••';

export const formatVND = (amount: number, forceShow?: boolean): string => {
  if (!forceShow && !globalShowMoney) {
    return MASKED_AMOUNT_TEXT;
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatCompactVND = (amount: number, forceShow?: boolean): string => {
  if (!forceShow && !globalShowMoney) {
    return MASKED_COMPACT_TEXT;
  }
  if (Math.abs(amount) >= 1_000_000_000) {
    return (amount / 1_000_000_000).toFixed(1).replace('.0', '') + ' tỷ';
  }
  if (Math.abs(amount) >= 1_000_000) {
    return (amount / 1_000_000).toFixed(1).replace('.0', '') + ' tr';
  }
  if (Math.abs(amount) >= 1_000) {
    return (amount / 1_000).toFixed(0) + 'k';
  }
  return amount.toString();
};

export const formatDateVi = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  
  const today = new Date();
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
    
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isToday) {
    return 'Hôm nay';
  }
  if (isYesterday) {
    return 'Hôm qua';
  }

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

export const getCurrentMonthStr = (): string => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${now.getFullYear()}-${month}`;
};

export const getMonthLabel = (yearMonth: string): string => {
  if (!yearMonth) return '';
  const [year, month] = yearMonth.split('-');
  return `Tháng ${parseInt(month, 10)}/${year}`;
};
