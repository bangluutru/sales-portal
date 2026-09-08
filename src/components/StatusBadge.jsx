import React from 'react';

const STATUS_CONFIG = {
  // Chung & Hợp đồng
  DRAFT: { label: 'Bản thảo', className: 'badge-draft' },
  SUBMITTED: { label: 'Đã nộp / Chờ duyệt', className: 'badge-pending' },
  MANAGER_REVIEW: { label: 'Quản lý đang xem xét', className: 'badge-pending' },
  DIRECTOR_REVIEW: { label: 'Chờ Giám Đốc duyệt', className: 'badge-action' },
  APPROVED: { label: 'Đã phê duyệt', className: 'badge-approved' },
  ACTIVE: { label: 'Đang hiệu lực', className: 'badge-approved' },
  EXPIRED: { label: 'Đã hết hạn', className: 'badge-draft' },
  REJECTED: { label: 'Từ chối', className: 'badge-rejected' },
  REVISION_REQUESTED: { label: 'Yêu cầu sửa đổi', className: 'badge-rejected' },
  TERMINATED: { label: 'Đã chấm dứt', className: 'badge-rejected' },

  // Tài chính & Kế toán
  ACCOUNTING_REVIEW: { label: 'Kế toán đang xử lý', className: 'badge-pending' },
  NEED_MORE_INFORMATION: { label: 'Cần bổ sung thông tin', className: 'badge-rejected' },
  READY_FOR_PAYMENT: { label: 'Sẵn sàng chi tiền', className: 'badge-action' },
  PAID: { label: 'Đã thanh toán', className: 'badge-paid' },
  COMPLETED: { label: 'Hoàn tất', className: 'badge-completed' },
  CANCELLED: { label: 'Đã hủy', className: 'badge-draft' }
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { label: status, className: 'badge-draft' };
  return (
    <span className={`badge ${config.className}`}>
      {config.label}
    </span>
  );
}
