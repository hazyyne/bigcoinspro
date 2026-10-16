import { Transaction, Category, Account, UserProfile } from '../types';
import { formatVND } from './format';

export interface ExportReportOptions {
  title?: string;
  subtitle?: string;
  user?: UserProfile | null;
  periodLabel?: string;
  format?: 'csv' | 'excel';
}

/**
 * Clean and escape string for CSV format (RFC 4180)
 */
const escapeCSV = (value: string | number | boolean | null | undefined): string => {
  if (value === null || value === undefined) return '""';
  const str = String(value);
  // If the cell contains quotes, commas, or line breaks, enclose in quotes and escape internal quotes
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
};

/**
 * Export transactions to CSV file with UTF-8 BOM for perfect Excel compatibility in Vietnamese
 */
export const exportTransactionsToCSV = (
  transactions: Transaction[],
  categories: Category[],
  accounts: Account[],
  options?: ExportReportOptions
) => {
  const BOM = '\uFEFF';
  const rows: string[] = [];

  const title = options?.title || 'BÁO CÁO GIAO DỊCH TÀI CHÍNH';
  const period = options?.periodLabel ? `Kỳ báo cáo: ${options.periodLabel}` : '';
  const now = new Date();
  const exportTime = `Ngày xuất: ${now.toLocaleDateString('vi-VN')} ${now.toLocaleTimeString('vi-VN')}`;

  // Header metadata
  rows.push(escapeCSV(title));
  if (options?.user) {
    rows.push(
      escapeCSV(
        `Người dùng: ${options.user.name} - Gmail: ${options.user.email}`
      )
    );
  }
  if (period) rows.push(escapeCSV(period));
  rows.push(escapeCSV(exportTime));
  rows.push(''); // Empty line

  // Summary statistics
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpense;

  rows.push(['TỔNG KẾT TÀI CHÍNH', '', '', '', '', '', ''].map(escapeCSV).join(','));
  rows.push(['Tổng số giao dịch', transactions.length.toString(), '', '', '', '', ''].map(escapeCSV).join(','));
  rows.push(['Tổng tiền thu', totalIncome.toString(), formatVND(totalIncome), '', '', '', ''].map(escapeCSV).join(','));
  rows.push(['Tổng tiền chi', totalExpense.toString(), formatVND(totalExpense), '', '', '', ''].map(escapeCSV).join(','));
  rows.push(['Chênh lệch (Thu - Chi)', netBalance.toString(), formatVND(netBalance), '', '', '', ''].map(escapeCSV).join(','));
  rows.push(''); // Empty line

  // Table Columns Header
  const headers = [
    'STT',
    'Mã giao dịch',
    'Ngày giao dịch',
    'Loại giao dịch',
    'Danh mục',
    'Số tiền (VND)',
    'Ví / Tài khoản',
    'Ghi chú',
    'Định kỳ',
    'Thời gian tạo',
  ];
  rows.push(headers.map(escapeCSV).join(','));

  // Table Data Rows
  transactions.forEach((tx, index) => {
    const cat = categories.find((c) => c.id === tx.categoryId);
    const acc = accounts.find((a) => a.id === tx.accountId);
    const typeLabel = tx.type === 'income' ? 'Thu nhập' : 'Chi tiêu';

    const row = [
      (index + 1).toString(),
      tx.id,
      tx.date,
      typeLabel,
      cat?.name || 'Chung',
      tx.amount.toString(),
      acc?.name || 'Tiền mặt',
      tx.note || '',
      tx.isRecurring ? 'Có' : 'Không',
      tx.createdAt || '',
    ];
    rows.push(row.map(escapeCSV).join(','));
  });

  const csvString = BOM + rows.join('\r\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const fileName = `Bao_cao_chi_tieu_${now.toISOString().slice(0, 10)}.csv`;

  triggerDownload(blob, fileName);
};

/**
 * Export transactions to styled Excel Spreadsheet (.xls)
 * Compatible with Microsoft Excel, LibreOffice, Apple Numbers and Google Sheets
 */
export const exportTransactionsToExcel = (
  transactions: Transaction[],
  categories: Category[],
  accounts: Account[],
  options?: ExportReportOptions
) => {
  const now = new Date();
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpense;

  const title = options?.title || 'BÁO CÁO GIAO DỊCH TÀI CHÍNH CÁ NHÂN';
  const period = options?.periodLabel ? `Kỳ báo cáo: ${options.periodLabel}` : 'Toàn bộ thời gian';

  const htmlContent = `
  <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <!--[if gte mso 9]>
    <xml>
      <x:ExcelWorkbook>
        <x:ExcelWorksheets>
          <x:ExcelWorksheet>
            <x:Name>Báo cáo giao dịch</x:Name>
            <x:WorksheetOptions>
              <x:DisplayGridlines/>
            </x:WorksheetOptions>
          </x:ExcelWorksheet>
        </x:ExcelWorksheets>
      </x:ExcelWorkbook>
    </xml>
    <![endif]-->
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
      .title { font-size: 16pt; font-weight: bold; color: #0284c7; text-align: center; height: 35px; }
      .meta { font-size: 10pt; color: #475569; }
      .summary-header { background-color: #f0f9ff; font-weight: bold; border: 1px solid #bae6fd; }
      .summary-val-income { color: #0284c7; font-weight: bold; font-size: 11pt; }
      .summary-val-expense { color: #db2777; font-weight: bold; font-size: 11pt; }
      .summary-val-net { color: #0369a1; font-weight: bold; font-size: 11pt; }
      .table-header { background-color: #0ea5e9; color: #ffffff; font-weight: bold; text-align: center; height: 30px; border: 1px solid #0284c7; }
      .data-row { border: 1px solid #e2e8f0; height: 26px; }
      .type-income { color: #0284c7; font-weight: bold; }
      .type-expense { color: #db2777; font-weight: bold; }
      .num-cell { text-align: right; mso-number-format:"\\#\\,\\#\\#0"; }
      .center-cell { text-align: center; }
    </style>
  </head>
  <body>
    <table>
      <tr><td colspan="8" class="title">${title}</td></tr>
      ${
        options?.user
          ? `<tr><td colspan="8" class="meta"><b>Chủ tài khoản:</b> ${options.user.name} | <b>Gmail:</b> ${options.user.email}</td></tr>`
          : ''
      }
      <tr><td colspan="8" class="meta"><b>${period}</b> | <b>Thời gian xuất:</b> ${now.toLocaleDateString('vi-VN')} ${now.toLocaleTimeString('vi-VN')}</td></tr>
      <tr><td colspan="8"></td></tr>

      <!-- Bảng Tổng kết -->
      <tr class="summary-header">
        <td colspan="2" style="border: 1px solid #cbd5e1; padding: 6px;"><b>CHỈ SỐ TÀI CHÍNH</b></td>
        <td colspan="3" style="border: 1px solid #cbd5e1; padding: 6px; text-align: right;"><b>GIÁ TRỊ (VND)</b></td>
        <td colspan="3" style="border: 1px solid #cbd5e1; padding: 6px;"><b>GHI CHÚ</b></td>
      </tr>
      <tr>
        <td colspan="2" style="border: 1px solid #cbd5e1;">Tổng số giao dịch</td>
        <td colspan="3" class="num-cell" style="border: 1px solid #cbd5e1; font-weight: bold;">${transactions.length}</td>
        <td colspan="3" style="border: 1px solid #cbd5e1; color: #64748b;">Số lượng bản ghi trong kỳ</td>
      </tr>
      <tr>
        <td colspan="2" style="border: 1px solid #cbd5e1;">Tổng tiền thu nhập</td>
        <td colspan="3" class="num-cell summary-val-income" style="border: 1px solid #cbd5e1;">${totalIncome}</td>
        <td colspan="3" style="border: 1px solid #cbd5e1; color: #059669;">+ ${formatVND(totalIncome)}</td>
      </tr>
      <tr>
        <td colspan="2" style="border: 1px solid #cbd5e1;">Tổng tiền chi tiêu</td>
        <td colspan="3" class="num-cell summary-val-expense" style="border: 1px solid #cbd5e1;">${totalExpense}</td>
        <td colspan="3" style="border: 1px solid #cbd5e1; color: #dc2626;">- ${formatVND(totalExpense)}</td>
      </tr>
      <tr>
        <td colspan="2" style="border: 1px solid #cbd5e1;">Chênh lệch thu chi (Tích lũy)</td>
        <td colspan="3" class="num-cell summary-val-net" style="border: 1px solid #cbd5e1;">${netBalance}</td>
        <td colspan="3" style="border: 1px solid #cbd5e1; color: #2563eb;">${formatVND(netBalance)}</td>
      </tr>
      <tr><td colspan="8"></td></tr>

      <!-- Bảng Chi tiết giao dịch -->
      <thead>
        <tr class="table-header">
          <th style="width: 45px; border: 1px solid #047857;">STT</th>
          <th style="width: 100px; border: 1px solid #047857;">Ngày</th>
          <th style="width: 90px; border: 1px solid #047857;">Loại</th>
          <th style="width: 140px; border: 1px solid #047857;">Danh mục</th>
          <th style="width: 120px; border: 1px solid #047857;">Số tiền (VND)</th>
          <th style="width: 130px; border: 1px solid #047857;">Tài khoản / Ví</th>
          <th style="width: 250px; border: 1px solid #047857;">Ghi chú chi tiết</th>
          <th style="width: 80px; border: 1px solid #047857;">Định kỳ</th>
        </tr>
      </thead>
      <tbody>
        ${transactions
          .map((tx, idx) => {
            const cat = categories.find((c) => c.id === tx.categoryId);
            const acc = accounts.find((a) => a.id === tx.accountId);
            const isInc = tx.type === 'income';
            const rowBg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';

            return `
            <tr class="data-row" style="background-color: ${rowBg};">
              <td class="center-cell" style="border: 1px solid #e2e8f0;">${idx + 1}</td>
              <td class="center-cell" style="border: 1px solid #e2e8f0;">${tx.date}</td>
              <td class="center-cell ${isInc ? 'type-income' : 'type-expense'}" style="border: 1px solid #e2e8f0;">
                ${isInc ? 'Thu nhập' : 'Chi tiêu'}
              </td>
              <td style="border: 1px solid #e2e8f0; padding-left: 5px;">${cat?.name || 'Khác'}</td>
              <td class="num-cell ${isInc ? 'type-income' : 'type-expense'}" style="border: 1px solid #e2e8f0; padding-right: 5px;">
                ${isInc ? '+' : '-'}${tx.amount}
              </td>
              <td style="border: 1px solid #e2e8f0; padding-left: 5px;">${acc?.name || 'Tiền mặt'}</td>
              <td style="border: 1px solid #e2e8f0; padding-left: 5px;">${tx.note || ''}</td>
              <td class="center-cell" style="border: 1px solid #e2e8f0;">${tx.isRecurring ? 'Có' : 'Không'}</td>
            </tr>
          `;
          })
          .join('')}
      </tbody>
    </table>
  </body>
  </html>
  `;

  const blob = new Blob(['\uFEFF' + htmlContent], {
    type: 'application/vnd.ms-excel;charset=utf-8;',
  });
  const fileName = `Bao_cao_tai_chinh_Excel_${now.toISOString().slice(0, 10)}.xls`;
  triggerDownload(blob, fileName);
};

const triggerDownload = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 100);
};
