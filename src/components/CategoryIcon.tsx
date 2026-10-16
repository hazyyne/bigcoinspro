import React from 'react';
import {
  Utensils,
  Bus,
  ShoppingBag,
  Home,
  Gamepad2,
  HeartPulse,
  GraduationCap,
  Zap,
  Droplet,
  Wifi,
  Wallet,
  Banknote,
  PiggyBank,
  Gift,
  Coffee,
  Fuel,
  Sparkles,
  Smartphone,
  BookOpen,
  DollarSign,
  TrendingUp,
  Briefcase,
  HelpCircle,
  CreditCard,
  Building2,
  Landmark,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Utensils,
  Bus,
  ShoppingBag,
  Home,
  Gamepad2,
  HeartPulse,
  GraduationCap,
  Zap,
  Droplet,
  Wifi,
  Wallet,
  Banknote,
  PiggyBank,
  Gift,
  Coffee,
  Fuel,
  Sparkles,
  Smartphone,
  BookOpen,
  DollarSign,
  TrendingUp,
  Briefcase,
  CreditCard,
  Building2,
  Landmark,
};

interface CategoryIconProps {
  icon: string;
  className?: string;
  color?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ icon, className = 'w-5 h-5', color }) => {
  const IconComponent = iconMap[icon] || HelpCircle;
  return <IconComponent className={className} style={color ? { color } : undefined} />;
};

export const AVAILABLE_ICONS = [
  { name: 'Utensils', label: 'Ăn uống' },
  { name: 'Coffee', label: 'Cà phê/Trà sữa' },
  { name: 'Bus', label: 'Xe buýt/Di chuyển' },
  { name: 'Fuel', label: 'Đổ xăng' },
  { name: 'ShoppingBag', label: 'Mua sắm/Shopee' },
  { name: 'Home', label: 'Tiền trọ/Nhà ở' },
  { name: 'Zap', label: 'Tiền điện' },
  { name: 'Droplet', label: 'Tiền nước' },
  { name: 'Wifi', label: 'Internet/4G' },
  { name: 'Gamepad2', label: 'Giải trí/Game' },
  { name: 'HeartPulse', label: 'Y tế/Sức khỏe' },
  { name: 'GraduationCap', label: 'Học phí' },
  { name: 'BookOpen', label: 'Giáo trình/Sách' },
  { name: 'Smartphone', label: 'Điện thoại/Nạp thẻ' },
  { name: 'Briefcase', label: 'Lương làm thêm' },
  { name: 'Gift', label: 'Bố mẹ gửi/Trợ cấp' },
  { name: 'PiggyBank', label: 'Tiết kiệm' },
  { name: 'Sparkles', label: 'Làm đẹp/Mỹ phẩm' },
  { name: 'Wallet', label: 'Ví tiền' },
];

export const PASTEL_COLORS = [
  { name: 'Hồng pastel', color: '#f43f5e', bg: '#ffe4e6' },
  { name: 'Xanh ngọc pastel', color: '#0d9488', bg: '#ccfbf1' },
  { name: 'Xanh dương pastel', color: '#0284c7', bg: '#e0f2fe' },
  { name: 'Cam đào pastel', color: '#ea580c', bg: '#ffedd5' },
  { name: 'Tím lavender', color: '#7c3aed', bg: '#ede9fe' },
  { name: 'Xanh lá mint', color: '#16a34a', bg: '#dcfce7' },
  { name: 'Vàng bơ pastel', color: '#ca8a04', bg: '#fef9c3' },
  { name: 'Chàm pastel', color: '#4f46e5', bg: '#e0e7ff' },
  { name: 'Xám khói pastel', color: '#475569', bg: '#f1f5f9' },
];
