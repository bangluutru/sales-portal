import test from 'node:test';
import assert from 'node:assert/strict';

test('CRUD Operations: deleteCustomer blocks deletion if customer has linked contracts', () => {
  const customers = [
    { id: 'CUST-001', name: 'Nhà thuốc An Khang 01' },
    { id: 'CUST-002', name: 'Nhà thuốc Long Châu 02' }
  ];
  const contracts = [
    { id: 'CTR-001', customerId: 'CUST-001', partyBName: 'Nhà thuốc An Khang 01', status: 'ACTIVE' }
  ];

  const deleteCustomerLogic = (id) => {
    const cust = customers.find(c => c.id === id);
    if (!cust) return { success: false, reason: 'Không tìm thấy' };
    const linked = contracts.filter(c => c.customerId === id || (cust.name && c.partyBName === cust.name));
    if (linked.length > 0) {
      return { success: false, reason: `Không thể xóa khách hàng "${cust.name}" vì đang có ${linked.length} hợp đồng liên kết!` };
    }
    return { success: true };
  };

  const res1 = deleteCustomerLogic('CUST-001');
  assert.equal(res1.success, false);
  assert.ok(res1.reason.includes('hợp đồng liên kết'));

  const res2 = deleteCustomerLogic('CUST-002');
  assert.equal(res2.success, true);
});

test('CRUD Operations: deleteContract allows deleting DRAFT or REJECTED, blocks APPROVED or ACTIVE', () => {
  const contracts = [
    { id: 'CTR-DRAFT', contractCode: 'CTR-2026-0001', status: 'DRAFT' },
    { id: 'CTR-REJECTED', contractCode: 'CTR-2026-0002', status: 'REJECTED' },
    { id: 'CTR-APPROVED', contractCode: 'CTR-2026-0003', status: 'APPROVED' },
    { id: 'CTR-ACTIVE', contractCode: 'CTR-2026-0004', status: 'ACTIVE' }
  ];

  const deleteContractLogic = (id) => {
    const target = contracts.find(c => c.id === id);
    if (!target) return { success: false, reason: 'Không tìm thấy hợp đồng.' };
    if (target.status !== 'DRAFT' && target.status !== 'REJECTED') {
      return { success: false, reason: 'Chỉ được phép xóa hợp đồng ở trạng thái Bản thảo (DRAFT) hoặc Bị từ chối (REJECTED)!' };
    }
    return { success: true };
  };

  assert.equal(deleteContractLogic('CTR-DRAFT').success, true);
  assert.equal(deleteContractLogic('CTR-REJECTED').success, true);
  assert.equal(deleteContractLogic('CTR-APPROVED').success, false);
  assert.equal(deleteContractLogic('CTR-ACTIVE').success, false);
});

test('CRUD Operations: updateRequest allows updating pending proposals, blocks approved ones', () => {
  const requests = [
    { id: 'REQ-001', requestCode: 'REQ-2026-0001', title: 'Công tác Hải Phòng', amount: 5000000, status: 'SUBMITTED' },
    { id: 'REQ-002', requestCode: 'REQ-2026-0002', title: 'Tạm ứng mua mẫu', amount: 3000000, status: 'APPROVED' }
  ];

  const updateRequestLogic = (id, updates) => {
    const target = requests.find(r => r.id === id);
    if (!target) return { success: false, reason: 'Không tìm thấy đề xuất.' };
    if (target.status === 'APPROVED' || target.status === 'COMPLETED') {
      return { success: false, reason: 'Đề xuất đã được duyệt hoặc hoàn tất, không thể chỉnh sửa nội dung!' };
    }
    return { success: true, updated: { ...target, ...updates } };
  };

  const res1 = updateRequestLogic('REQ-001', { title: 'Công tác Hải Phòng & Quảng Ninh', amount: 7000000 });
  assert.equal(res1.success, true);
  assert.equal(res1.updated.title, 'Công tác Hải Phòng & Quảng Ninh');
  assert.equal(res1.updated.amount, 7000000);

  const res2 = updateRequestLogic('REQ-002', { amount: 4000000 });
  assert.equal(res2.success, false);
});

test('CRUD Operations: deleteRequest allows deleting pending proposals, blocks approved ones', () => {
  const requests = [
    { id: 'REQ-001', requestCode: 'REQ-2026-0001', status: 'MANAGER_REVIEW' },
    { id: 'REQ-002', requestCode: 'REQ-2026-0002', status: 'APPROVED' },
    { id: 'REQ-003', requestCode: 'REQ-2026-0003', status: 'COMPLETED' }
  ];

  const deleteRequestLogic = (id) => {
    const target = requests.find(r => r.id === id);
    if (!target) return { success: false, reason: 'Không tìm thấy đề xuất.' };
    if (target.status === 'APPROVED' || target.status === 'COMPLETED') {
      return { success: false, reason: 'Đề xuất đã được phê duyệt, không thể hủy hoặc xóa!' };
    }
    return { success: true };
  };

  assert.equal(deleteRequestLogic('REQ-001').success, true);
  assert.equal(deleteRequestLogic('REQ-002').success, false);
  assert.equal(deleteRequestLogic('REQ-003').success, false);
});
