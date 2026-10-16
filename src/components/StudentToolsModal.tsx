import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Users,
  Lightbulb,
  Copy,
  Check,
  Calculator,
  Home,
  Zap,
  Droplet,
  Wifi,
  DollarSign,
  GraduationCap,
} from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';
import { formatVND } from '../utils/format';

export const StudentToolsModal: React.FC = () => {
  const { isStudentToolOpen, setIsStudentToolOpen } = useExpense();
  const [activeSubTab, setActiveSubTab] = useState<'split' | 'tips'>('split');

  // Roommate Bill Split State (Empty by default so user enters their own amounts)
  const [roomRent, setRoomRent] = useState<number>(0);
  const [electricity, setElectricity] = useState<number>(0);
  const [water, setWater] = useState<number>(0);
  const [internet, setInternet] = useState<number>(0);
  const [otherFees, setOtherFees] = useState<number>(0);
  const [numPeople, setNumPeople] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isStudentToolOpen) return null;

  const totalBill = roomRent + electricity + water + internet + otherFees;
  const perPerson = numPeople > 0 ? Math.round(totalBill / numPeople) : 0;

  const copyBreakdown = () => {
    const text = `📋 [BẢNG TIỀN PHÒNG TRỌ THÁNG NÀY]
- Tiền phòng: ${formatVND(roomRent, true)}
- Tiền điện: ${formatVND(electricity, true)}
- Tiền nước: ${formatVND(water, true)}
- Tiền mạng: ${formatVND(internet, true)}
${otherFees > 0 ? `- Phí khác (rác/vệ sinh): ${formatVND(otherFees, true)}\n` : ''}
👉 TỔNG CỘNG: ${formatVND(totalBill, true)}
👥 Chia đều (${numPeople} người): ${formatVND(perPerson, true)} / người
Mọi người chuyển khoản sớm trước ngày 5 giúp mình nhé! Cảm ơn cả phòng! ❤️`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const studentTips = [
    {
      title: '1. Quy tắc 50/30/20 phiên bản Sinh viên',
      content:
        'Dành 50% tiền cho nhu cầu thiết yếu (tiền trọ, điện nước, ăn uống cơ bản, đi lại); 30% cho học tập & phát triển bản thân (giáo trình, khóa học, cafe học bài); 20% gửi tiết kiệm khẩn cấp đề phòng ốm đau hay sửa xe.',
    },
    {
      title: '2. Tự nấu ăn theo tuần tiết kiệm đến 40%',
      content:
        'Đi chợ đầu mối hoặc siêu thị vào khung giờ xả hàng chiều tối. Nấu cơm mang theo trường học vừa hợp vệ sinh vừa tiết kiệm được 20.000đ - 35.000đ mỗi bữa so với ăn ngoài.',
    },
    {
      title: '3. Khai thác tối đa quyền lợi Thẻ Sinh viên',
      content:
        'Mua vé xe buýt tháng liên tuyến (chỉ khoảng 100.000đ/tháng), đăng ký gói sinh viên Spotify/Apple Music (chỉ ~29k), sử dụng tài khoản email đuôi .edu để nhận GitHub Student Pack, Notion, Canva Pro miễn phí.',
    },
    {
      title: '4. Mua lại sách giáo trình & đồ dùng từ tiền bối',
      content:
        'Tham gia hội đồng hương, nhóm sinh viên khóa trên để xin hoặc mua lại sách giáo trình, đồ gia dụng phòng trọ (quạt, tủ vải, ấm đun) với giá chỉ bằng 1/3 giá mới.',
    },
    {
      title: '5. Tuyệt đối tránh xa bẫy "App vay tiền online"',
      content:
        'Không bao giờ vay mượn qua các app tín dụng đen trên mạng với lãi suất cắt cổ. Nếu gặp khó khăn tài chính, hãy liên hệ phòng Công tác sinh viên để xin hỗ trợ học bổng hoặc gia hạn học phí.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-sky-200 animate-in fade-in zoom-in-95 duration-150 max-h-[92dvh] overflow-y-auto pb-safe">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-sky-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center border border-pink-200">
              <Sparkles className="w-4 h-4 text-pink-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Tiện ích Chia tiền & Mẹo tài chính
              </h3>
              <p className="text-[11px] text-slate-400">Công cụ chia tiền phòng trọ và mẹo quản lý tài chính</p>
            </div>
          </div>
          <button
            onClick={() => setIsStudentToolOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-sky-50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 p-1 bg-sky-50/80 rounded-2xl border border-sky-100 mb-5">
          <button
            type="button"
            onClick={() => setActiveSubTab('split')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              activeSubTab === 'split'
                ? 'bg-white text-sky-700 shadow-xs border border-sky-200/70'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-sky-600" />
            Chia tiền phòng trọ
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('tips')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              activeSubTab === 'tips'
                ? 'bg-white text-pink-600 shadow-xs border border-pink-200/70'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 text-pink-500" />
            Mẹo chi tiêu sinh viên
          </button>
        </div>

        {/* Tool 1: Roommate Bill Splitter */}
        {activeSubTab === 'split' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1 mb-1">
                  <Home className="w-3 h-3 text-sky-600" /> Tiền phòng trọ:
                </label>
                <input
                  type="number"
                  step="50000"
                  min="0"
                  placeholder="Nhập tiền phòng..."
                  value={roomRent || ''}
                  onChange={(e) => setRoomRent(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1 mb-1">
                  <Zap className="w-3 h-3 text-pink-500" /> Tiền điện:
                </label>
                <input
                  type="number"
                  step="10000"
                  min="0"
                  placeholder="Nhập tiền điện..."
                  value={electricity || ''}
                  onChange={(e) => setElectricity(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1 mb-1">
                  <Droplet className="w-3 h-3 text-sky-500" /> Tiền nước:
                </label>
                <input
                  type="number"
                  step="10000"
                  min="0"
                  placeholder="Nhập tiền nước..."
                  value={water || ''}
                  onChange={(e) => setWater(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1 mb-1">
                  <Wifi className="w-3 h-3 text-pink-500" /> Tiền mạng Wifi:
                </label>
                <input
                  type="number"
                  step="10000"
                  min="0"
                  placeholder="Nhập tiền mạng..."
                  value={internet || ''}
                  onChange={(e) => setInternet(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Phí rác / Vệ sinh / Khác:
                </label>
                <input
                  type="number"
                  step="5000"
                  min="0"
                  placeholder="Nhập phí khác..."
                  value={otherFees || ''}
                  onChange={(e) => setOtherFees(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Số người trong phòng:
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={numPeople}
                  onChange={(e) => setNumPeople(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-sky-700 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Split Calculation Result */}
            <div className="p-4 rounded-2xl bg-linear-to-r from-sky-50/90 to-pink-50/90 border border-sky-200 text-center space-y-1">
              <span className="text-xs text-sky-800 font-medium block">
                Tổng hóa đơn phòng: {formatVND(totalBill, true)}
              </span>
              <div className="text-2xl font-bold text-pink-600 tracking-tight">
                {formatVND(perPerson, true)}
                <span className="text-xs font-normal text-sky-700 ml-1">/ người</span>
              </div>
            </div>

            <button
              onClick={copyBreakdown}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-linear-to-r from-sky-500 to-pink-500 hover:from-sky-600 hover:to-pink-600 text-white transition flex items-center justify-center gap-2 shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-sky-100" />
                  <span>Đã sao chép tin nhắn gửi nhóm Zalo!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Sao chép bảng kê chi tiết để gửi Zalo phòng</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Tool 2: Student Budgeting Tips */}
        {activeSubTab === 'tips' && (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {studentTips.map((tip, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-sky-50/50 border border-sky-100">
                <h4 className="text-xs font-bold text-sky-900 mb-1">{tip.title}</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">{tip.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
