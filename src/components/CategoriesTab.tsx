import React, { useState } from 'react';
import {
  Tags,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';
import { Category, TransactionType } from '../types';
import { CategoryIcon, AVAILABLE_ICONS, PASTEL_COLORS } from './CategoryIcon';

export const CategoriesTab: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory, transactions } = useExpense();

  const [activeType, setActiveType] = useState<TransactionType>('expense');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Utensils');
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);

  const filteredCategories = categories.filter((c) => c.type === activeType);

  const openAddModal = () => {
    setEditingCat(null);
    setName('');
    setIcon('Utensils');
    setSelectedColorIdx(0);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCat(cat);
    setName(cat.name);
    setIcon(cat.icon);
    const colorIdx = PASTEL_COLORS.findIndex((c) => c.color === cat.color);
    setSelectedColorIdx(colorIdx >= 0 ? colorIdx : 0);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const chosenColor = PASTEL_COLORS[selectedColorIdx] || PASTEL_COLORS[0];

    if (editingCat) {
      updateCategory({
        ...editingCat,
        name: name.trim(),
        icon,
        color: chosenColor.color,
        bgLight: chosenColor.bg,
      });
    } else {
      addCategory({
        name: name.trim(),
        type: activeType,
        icon,
        color: chosenColor.color,
        bgLight: chosenColor.bg,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (cat: Category) => {
    const txCount = transactions.filter((t) => t.categoryId === cat.id).length;
    if (txCount > 0) {
      if (
        !window.confirm(
          `Danh mục "${cat.name}" đang có ${txCount} giao dịch. Bạn có chắc muốn xóa không?`
        )
      ) {
        return;
      }
    } else {
      if (!window.confirm(`Bạn có chắc muốn xóa danh mục "${cat.name}"?`)) {
        return;
      }
    }
    deleteCategory(cat.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-sky-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-800">5. Quản lý danh mục</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tùy chỉnh danh mục chi tiêu (Ăn uống, Tiền trọ, Đi lại...) và nguồn thu sinh viên
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-600 text-white transition shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Thêm danh mục mới
        </button>
      </div>

      {/* Switcher: Khoản chi vs Khoản thu */}
      <div className="flex items-center gap-2 bg-sky-50/80 p-1.5 rounded-2xl border border-sky-200/70 max-w-xs">
        <button
          onClick={() => setActiveType('expense')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold transition ${
            activeType === 'expense'
              ? 'bg-white text-pink-700 shadow-xs'
              : 'text-slate-500 hover:text-pink-700'
          }`}
        >
          Danh mục Chi ({categories.filter((c) => c.type === 'expense').length})
        </button>
        <button
          onClick={() => setActiveType('income')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold transition ${
            activeType === 'income'
              ? 'bg-white text-sky-700 shadow-xs'
              : 'text-slate-500 hover:text-sky-700'
          }`}
        >
          Danh mục Thu ({categories.filter((c) => c.type === 'income').length})
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((cat) => {
          const txCount = transactions.filter((t) => t.categoryId === cat.id).length;
          return (
            <div
              key={cat.id}
              className="p-4 rounded-2xl bg-white border border-sky-200/70 shadow-xs hover:border-pink-300 transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition"
                  style={{ backgroundColor: cat.bgLight }}
                >
                  <CategoryIcon icon={cat.icon} className="w-6 h-6" color={cat.color} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{cat.name}</h4>
                  <span className="text-xs text-slate-400 mt-0.5 block">
                    {txCount} giao dịch đã ghi
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(cat)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition"
                  title="Sửa danh mục"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(cat)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-pink-600 hover:bg-pink-50 transition"
                  title="Xóa danh mục"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-sky-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800">
                {editingCat ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Tên danh mục:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Ăn uống, Trà sữa, Tiền trọ, Sách giáo trình..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>

              {/* Icon selector */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Biểu tượng (Icon):
                </label>
                <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto p-2 bg-sky-50/40 rounded-xl border border-sky-200/70">
                  {AVAILABLE_ICONS.map((item) => (
                    <button
                      type="button"
                      key={item.name}
                      onClick={() => setIcon(item.name)}
                      className={`p-2 rounded-xl flex items-center justify-center transition ${
                        icon === item.name
                          ? 'bg-sky-500 text-white shadow-xs'
                          : 'bg-white text-slate-600 hover:bg-sky-100 border border-slate-200/60'
                      }`}
                      title={item.label}
                    >
                      <CategoryIcon
                        icon={item.name}
                        className="w-4 h-4"
                        color={icon === item.name ? '#ffffff' : undefined}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Pastel color palette picker */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Màu sắc pastel chủ đạo:
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {PASTEL_COLORS.map((col, idx) => (
                    <button
                      type="button"
                      key={col.name}
                      onClick={() => setSelectedColorIdx(idx)}
                      className="w-7 h-7 rounded-full flex items-center justify-center transition border border-black/10 shadow-2xs"
                      style={{ backgroundColor: col.color }}
                      title={col.name}
                    >
                      {selectedColorIdx === idx && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="p-3 rounded-xl bg-sky-50/50 border border-sky-200/70 flex items-center gap-3">
                <span className="text-xs text-slate-500">Xem trước:</span>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: PASTEL_COLORS[selectedColorIdx]?.bg }}
                >
                  <CategoryIcon
                    icon={icon}
                    className="w-5 h-5"
                    color={PASTEL_COLORS[selectedColorIdx]?.color}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-800">
                  {name || 'Tên danh mục'}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-600 text-white transition shadow-xs"
                >
                  {editingCat ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
