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

export function generateContractCode(existingCount = 1) {
  const year = new Date().getFullYear();
  const pad = String(existingCount + 1).padStart(4, '0');
  return `CTR-${year}-${pad}`;
}

/**
 * Trình biên dịch template hợp đồng thay thế các placeholder {{field}}
 */
export function compileContractTemplate(templateContent, data = {}) {
  if (!templateContent) return '';
  let result = templateContent;
  
  const replacements = {
    '{{full_name}}': data.fullName || '—',
    '{{address}}': data.address || '—',
    '{{phone}}': data.phone || '—',
    '{{identity_number}}': data.identityNumber || '—',
    '{{tax_number}}': data.taxNumber || '—',
    '{{bank_account}}': data.bankAccount ? `${data.bankAccount} (${data.bankName || ''})` : '—',
    '{{salary}}': data.salary ? formatVND(data.salary) : '—',
    '{{allowance}}': data.allowance ? formatVND(data.allowance) : '—',
    '{{travel_allowance}}': data.travelAllowance ? formatVND(data.travelAllowance) : '—',
    '{{territory}}': data.territoryDescription || 'Toàn quốc',
    '{{target}}': data.targetDescription || 'Theo kế hoạch kinh doanh từng kỳ',
    '{{commission_desc}}': data.commissionDescription || 'Theo quy chế hoa hồng Genki Fami',
    '{{start_date}}': formatDate(data.startDate),
    '{{end_date}}': formatDate(data.endDate),
    '{{contract_code}}': data.contractCode || 'CTR-DRAFT'
  };

  for (const [placeholder, val] of Object.entries(replacements)) {
    result = result.split(placeholder).join(val);
  }
  return result;
}
