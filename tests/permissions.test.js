import test from 'node:test';
import assert from 'node:assert/strict';

test('Permissions: CTV/Staff không được xem hợp đồng của người khác', () => {
  const allContracts = [
    { id: 'CTR-01', personId: 'P-001', salary: 8000000 },
    { id: 'CTR-02', personId: 'P-002', salary: 15000000 }
  ];

  const currentUserId = 'P-001';
  const currentUserRole = 'CTV';

  const visibleContracts = allContracts.filter(c => {
    if (currentUserRole === 'DIRECTOR' || currentUserRole === 'ADMIN') return true;
    return c.personId === currentUserId;
  });

  assert.equal(visibleContracts.length, 1);
  assert.equal(visibleContracts[0].id, 'CTR-01');
});

test('Permissions: Director và Admin xem được toàn bộ hợp đồng', () => {
  const allContracts = [
    { id: 'CTR-01', personId: 'P-001' },
    { id: 'CTR-02', personId: 'P-002' }
  ];

  const currentUserRole = 'DIRECTOR';
  const visibleContracts = allContracts.filter(c => {
    if (currentUserRole === 'DIRECTOR' || currentUserRole === 'ADMIN') return true;
    return false;
  });

  assert.equal(visibleContracts.length, 2);
});
