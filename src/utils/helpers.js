import { formatVND } from './settlementCalc.js';

export { formatVND };

export function formatDate(dateString) {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(isoString) {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return isoString;
  }
}

export function generateRequestCode(type, existingCount = 1) {
  const year = new Date().getFullYear();
  const pad = String(existingCount + 1).padStart(4, '0');
  const prefixes = {
    BUSINESS_TRIP: 'TRIP',
    ADVANCE: 'ADV',
    PAYMENT: 'PAY',
    SETTLEMENT: 'SET',
    SAMPLE: 'SAM'
  };
  const prefix = prefixes[type] || 'REQ';
  return `${prefix}-${year}-${pad}`;
}

export function generateContractCode(existingCount = 1, prefix = 'CTR') {
  const year = new Date().getFullYear();
  const pad = String(existingCount + 1).padStart(4, '0');
  return `${prefix}-${year}-${pad}`;
}

/**
 * Đọc số tiền thành chữ Tiếng Việt chuẩn theo văn phong tài chính - pháp lý
 */
export function numberToVietnameseWords(n) {
  const num = Math.round(Math.abs(Number(n) || 0));
  if (num === 0) return 'Không đồng';

  const units = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];
  const digits = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

  function readTriple(n, isLast) {
    let h = Math.floor(n / 100);
    let t = Math.floor((n % 100) / 10);
    let u = n % 10;
    let res = '';
    if (h > 0 || !isLast) {
      res += digits[h] + ' trăm ';
    }
    if (t > 1) {
      res += digits[t] + ' mươi ';
      if (u === 1) res += 'mốt ';
      else if (u === 4) res += 'tư ';
      else if (u === 5) res += 'lăm ';
      else if (u > 0) res += digits[u] + ' ';
    } else if (t === 1) {
      res += 'mười ';
      if (u === 5) res += 'lăm ';
      else if (u > 0) res += digits[u] + ' ';
    } else if (t === 0 && u > 0) {
      if (h > 0 || !isLast) res += 'lẻ ';
      res += digits[u] + ' ';
    }
    return res.trim();
  }

  let str = String(num);
  const groups = [];
  while (str.length > 0) {
    groups.unshift(parseInt(str.slice(-3), 10));
    str = str.slice(0, -3);
  }

  const words = [];
  for (let i = 0; i < groups.length; i++) {
    const grp = groups[i];
    const unitIdx = groups.length - 1 - i;
    if (grp > 0) {
      const tripleStr = readTriple(grp, i === 0);
      words.push(tripleStr + ' ' + units[unitIdx]);
    }
  }

  const finalStr = words.join(' ').replace(/\s+/g, ' ').trim() + ' đồng';
  return finalStr.charAt(0).toUpperCase() + finalStr.slice(1);
}

/**
 * Trình biên dịch template hợp đồng thay thế các placeholder {{field}}
 */
export function compileContractTemplate(templateContent, data = {}) {
  if (!templateContent) return '';
  let result = templateContent;

  const now = data.startDate ? new Date(data.startDate) : new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear());

  const pcb = Number(data.salary || data.pcbAmount || 8000000);
  const pkt = Number(data.allowance || data.pktAmount || 7000000);
  const kpi = Number(data.kpiTargetRevenue || data.kpiTargetAmount || 100000000);
  const probationMonths = data.probationMonths || 3;
  const quarterBonusRate = data.quarterBonusRate ?? 0.5;
  const yearBonusRate = data.yearBonusRate ?? 0.2;

  let bonusTiersText = '';
  if (Array.isArray(data.bonusTiers) && data.bonusTiers.length > 0) {
    bonusTiersText = data.bonusTiers.map((t, idx) => {
      const range = t.revenueMax > 0
        ? `${formatVND(t.revenueMin)} ~ ${formatVND(t.revenueMax)}`
        : `Trên ${formatVND(t.revenueMin)}`;
      const phucap = t.allowance > 0 ? ` + Phụ cấp ${formatVND(t.allowance)}` : '';
      return `   + ${t.level || `Mức ${idx + 1}`} (${range}): Thưởng ${t.bonusPercent}% tổng doanh thu${phucap}`;
    }).join('\n');
  } else {
    bonusTiersText = `   + Mức 1 (120.000.000đ ~ 200.000.000đ): Thưởng 1,0% tổng doanh thu + Phụ cấp 1.000.000đ
   + Mức 2 (201.000.000đ ~ 300.000.000đ): Thưởng 1,5% tổng doanh thu + Phụ cấp 2.000.000đ
   + Mức 3 (301.000.000đ ~ 500.000.000đ): Thưởng 2,0% tổng doanh thu + Phụ cấp 3.000.000đ
   + Mức 4 (Trên 500.000.000đ): Thưởng 4,0% tổng doanh thu + Phụ cấp 5.000.000đ`;
  }

  const defaultBonusTableText = `| STT | Mức Thưởng | Doanh Số Mục Tiêu | Phụ Cấp | Thưởng Doanh Thu Thực Tế |
| :---: | :--- | :--- | :---: | :---: |
| 1 | Mức 1 | 120 triệu ~ 200 triệu | 1.000.000 đ | 1,0% Tổng Doanh Thu |
| 2 | Mức 2 | 201 triệu ~ 300 triệu | 2.000.000 đ | 1,5% Tổng Doanh Thu |
| 3 | Mức 3 | 301 triệu ~ 500 triệu | 3.000.000 đ | 2,0% Tổng Doanh Thu |
| 4 | Mức 4 | Trên 500 triệu | 5.000.000 đ | 4,0% Tổng Doanh Thu |`;

  const genderTitle = data.genderTitle || (data.fullName?.includes('Thị') ? 'Bà' : 'Ông');

  const replacements = {
    // Basic person & contract placeholders (legacy compatibility)
    '{{full_name}}': data.fullName || data.partyBName || '—',
    '{{gender_title}}': genderTitle,
    '{{date_of_birth}}': data.dateOfBirth ? formatDate(data.dateOfBirth) : '—',
    '{{address}}': data.address || data.partyBAddress || '—',
    '{{current_address}}': data.currentAddress || data.address || data.partyBAddress || '—',
    '{{phone}}': data.phone || data.partyBPhone || '—',
    '{{email}}': data.email || '—',
    '{{identity_number}}': data.identityNumber || data.partyBCccd || '—',
    '{{identity_date}}': data.identityDate ? (data.identityDate.includes('-') ? formatDate(data.identityDate) : data.identityDate) : '15/06/2021',
    '{{identity_place}}': data.identityPlace || 'Cục Cảnh sát QLHC về TTXH',
    '{{tax_number}}': data.taxNumber || '—',
    '{{bank_name}}': data.bankName || 'Vietcombank',
    '{{bank_branch}}': data.bankBranch || 'Chi nhánh Hà Nội',
    '{{bank_account}}': data.bankAccount || data.partyBBankAccount || '—',
    '{{salary}}': formatVND(pcb),
    '{{salary_in_words}}': numberToVietnameseWords(pcb),
    '{{allowance}}': formatVND(pkt),
    '{{allowance_in_words}}': numberToVietnameseWords(pkt),
    '{{travel_allowance}}': data.travelAllowance ? formatVND(data.travelAllowance) : '—',
    '{{kpi_target}}': formatVND(kpi),
    '{{kpi_target_in_words}}': numberToVietnameseWords(kpi),
    '{{probation_months}}': String(probationMonths),
    '{{bonus_tiers_text}}': bonusTiersText,
    '{{quarter_bonus_rate}}': String(quarterBonusRate),
    '{{year_bonus_rate}}': String(yearBonusRate),
    '{{territory}}': data.territoryDescription || 'Toàn quốc',
    '{{target}}': data.targetDescription || 'Theo kế hoạch kinh doanh từng kỳ',
    '{{commission_desc}}': data.commissionDescription || 'Theo quy chế hoa hồng Genki Fami',
    '{{start_date}}': formatDate(data.startDate),
    '{{end_date}}': formatDate(data.endDate),
    '{{contract_code}}': data.contractCode || 'CTR-DRAFT',
    '{{contract_sign_day}}': day,
    '{{contract_sign_month}}': month,
    '{{contract_sign_year}}': year,

    // Detailed HTKD standard placeholders (extended keys)
    '{{day}}': day,
    '{{month}}': month,
    '{{year}}': year,
    '{{party_a_company}}': data.partyACompany || 'CÔNG TY CỔ PHẦN GENKI FAMI VIỆT NAM',
    '{{party_a_address}}': data.partyAAddress || 'Số 107 ngõ 192 Lê Trọng Tấn, Tổ 1, P. Phương Liệt, TP. Hà Nội, Việt Nam.',
    '{{party_a_phone}}': data.partyAPhone || '(+84) 438.53.9696',
    '{{party_a_representative}}': data.partyARepresentative || 'Ông Lê Trí Nam',
    '{{party_a_position}}': data.partyAPosition || 'Giám đốc Kinh Doanh',
    '{{party_b_name}}': (data.fullName || data.partyBName || 'ĐỐI TÁC').toUpperCase(),
    '{{party_b_gender_title}}': genderTitle.toUpperCase(),
    '{{party_b_dob}}': data.dateOfBirth ? formatDate(data.dateOfBirth) : '—',
    '{{party_b_address}}': data.address || '—',
    '{{party_b_current_address}}': data.currentAddress || data.address || '—',
    '{{party_b_cccd}}': data.identityNumber || data.partyBCccd || '—',
    '{{party_b_cccd_date}}': data.identityDate ? (data.identityDate.includes('-') ? formatDate(data.identityDate) : data.identityDate) : '15/06/2021',
    '{{party_b_cccd_place}}': data.identityPlace || 'Cục Cảnh sát QLHC về TTXH',
    '{{party_b_phone}}': data.phone || '—',
    '{{party_b_email}}': data.email || '—',
    '{{party_b_bank_account}}': data.bankAccount || data.partyBBankAccount || '—',
    '{{party_b_bank_name}}': data.bankName || data.partyBBankName || '—',
    '{{party_b_title}}': data.partyBTitle || 'Đối tác Kinh doanh',
    '{{contract_duration}}': data.contractDuration || `${probationMonths} tháng (hoặc cho đến khi kết thúc dự án)`,
    '{{pcb_amount}}': formatVND(pcb),
    '{{pcb_amount_words}}': numberToVietnameseWords(pcb),
    '{{pkt_amount}}': formatVND(pkt),
    '{{pkt_amount_words}}': numberToVietnameseWords(pkt),
    '{{kpi_target_words}}': numberToVietnameseWords(kpi),
    '{{below_target_policy}}': data.belowTargetPolicy || 'Trường hợp đạt dưới 50% chỉ tiêu Doanh thu tối thiểu: Thu nhập nhận được = PCB.',
    '{{bonus_table_text}}': data.bonusTableText || defaultBonusTableText,
    '{{quarterly_bonus}}': data.quarterlyBonusText || `${quarterBonusRate}% Tổng doanh số 03 tháng khi đạt từ 500.000.000 VNĐ trở lên.`,
    '{{yearly_bonus}}': data.yearlyBonusText || `${yearBonusRate}% Tổng doanh thu tính từ thời điểm công tác đến hết năm (áp dụng khi công tác trên 06 tháng).`,

    // HDLD standard labor contract placeholders
    '{{base_salary}}': formatVND(data.baseSalary || data.salary || 7491370),
    '{{base_salary_words}}': numberToVietnameseWords(Number(data.baseSalary || data.salary || 7491370)),
    '{{performance_bonus}}': formatVND(data.performanceBonus !== undefined ? data.performanceBonus : 1278630),
    '{{performance_bonus_words}}': numberToVietnameseWords(Number(data.performanceBonus !== undefined ? data.performanceBonus : 1278630)),
    '{{meal_allowance}}': formatVND(data.mealAllowance !== undefined ? data.mealAllowance : 730000),
    '{{meal_allowance_words}}': numberToVietnameseWords(Number(data.mealAllowance !== undefined ? data.mealAllowance : 730000)),
    '{{probation_period}}': data.probationPeriod || '02 tháng (Hưởng 85% tổng lương chức danh)',
    '{{work_location}}': data.workLocation || 'Số 19/48 Nguyễn Cửu Đàm, P Tân Sơn Nhì, Q. Tân Phú, TP Hồ Chí Minh',
    '{{work_hours}}': data.workHours || '48 giờ/tuần (Thứ 2 đến Thứ 7: 8h00 - 17h00)',
    '{{job_title}}': data.jobTitle || 'Nhân viên Điều phối Kho vận & Hỗ trợ Kinh doanh',
    '{{department}}': data.department || 'Phòng Quản lý Kho vận & Hỗ trợ Kinh doanh',
    '{{report_to}}': data.reportTo || 'Trưởng phòng Vận hành / Ban Giám đốc',
    '{{direct_supervisor}}': data.directSupervisor || data.reportTo || 'Trưởng phòng Vận hành'
  };

  for (const [placeholder, val] of Object.entries(replacements)) {
    result = result.split(placeholder).join(val);
  }
  return result;
}
