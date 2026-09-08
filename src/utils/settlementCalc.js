/**
 * Logic tự động tính toán quyết toán / hoàn ứng
 * difference = actualExpense - advanceAmount
 * Nếu difference > 0: Công ty hoàn trả bổ sung cho nhân viên (Company reimbursement)
 * Nếu difference < 0: Nhân viên hoàn trả lại công ty (Refund to company)
 */
export function calculateSettlement(actualExpense = 0, advanceAmount = 0) {
  const actual = Number(actualExpense) || 0;
  const advance = Number(advanceAmount) || 0;
  const difference = actual - advance;

  if (difference > 0) {
    return {
      difference,
      companyReimbursement: difference,
      refundToCompany: 0,
      statusType: 'REIMBURSE_STAFF',
      summaryText: `Công ty chi trả bổ sung cho nhân sự: ${formatVND(difference)}`
    };
  } else if (difference < 0) {
    const refund = Math.abs(difference);
    return {
      difference,
      companyReimbursement: 0,
      refundToCompany: refund,
      statusType: 'REFUND_COMPANY',
      summaryText: `Nhân sự hoàn ứng về tài khoản công ty: ${formatVND(refund)}`
    };
  } else {
    return {
      difference: 0,
      companyReimbursement: 0,
      refundToCompany: 0,
      statusType: 'BALANCED',
      summaryText: 'Quyết toán cân bằng (Thực chi đúng bằng Tạm ứng)'
    };
  }
}

export function formatVND(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(num);
}
