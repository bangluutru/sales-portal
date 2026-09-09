import test from 'node:test';
import assert from 'node:assert/strict';

import {
  validateVietnamTaxId,
  lookupVietnamTaxInfo,
  VIETNAM_TAX_DATABASE
} from '../src/utils/helpers.js';

import {
  generateAppendixDocx,
  generateNdaDocx,
  exportContractToDocx
} from '../src/utils/contractDocxGenerator.js';

// --- SUITE 1: VIETNAM TAX ID VALIDATION & LOOKUP ---
test('Tax Engine: Validate standard 10-digit and 13-digit Vietnamese tax IDs', () => {
  // Valid 10-digit IDs
  const valid10 = validateVietnamTaxId('0108923481');
  assert.equal(valid10.valid, true, '0108923481 should be valid');
  assert.equal(valid10.type, 'ENTERPRISE');

  const validGenki = validateVietnamTaxId('0315487692');
  assert.equal(validGenki.valid, true, 'Genki Fami MST 0315487692 should be valid');
  assert.equal(validGenki.type, 'ENTERPRISE');

  // Valid 13-digit branch IDs (with and without hyphen)
  const valid13WithHyphen = validateVietnamTaxId('0108923481-001');
  assert.equal(valid13WithHyphen.valid, true, '0108923481-001 should be valid');
  assert.equal(valid13WithHyphen.type, 'BRANCH');

  const valid13NoHyphen = validateVietnamTaxId('0108923481002');
  assert.equal(valid13NoHyphen.valid, true, '0108923481002 should be valid');
  assert.equal(valid13NoHyphen.type, 'BRANCH');

  // Invalid: Empty or too short
  assert.equal(validateVietnamTaxId('').valid, false);
  assert.equal(validateVietnamTaxId('12345').valid, false);
  assert.equal(validateVietnamTaxId('ABCDEFGHIJ').valid, false);
});

test('Tax Engine: Auto-lookup verified enterprise information from tax database', () => {
  // Pharmacity
  const pharmacity = lookupVietnamTaxInfo('0311281232');
  assert.ok(pharmacity.found, 'Pharmacity should be found');
  assert.ok((pharmacity.name || pharmacity.companyName).includes('PHARMACITY'));
  assert.equal(pharmacity.status, 'Đang hoạt động');

  // Long Châu
  const longChau = lookupVietnamTaxInfo('0315275368');
  assert.ok(longChau.found, 'Long Châu should be found');
  assert.ok((longChau.name || longChau.companyName).includes('LONG CHÂU'));

  // Genki Fami Vietnam
  const genki = lookupVietnamTaxInfo('0315487692');
  assert.ok(genki.found, 'Genki Fami should be found');
  assert.ok((genki.name || genki.companyName).includes('GENKI FAMI'));

  // Unknown tax number returns found: false
  const unknown = lookupVietnamTaxInfo('9999999999');
  assert.equal(unknown.found, false);
});

// --- SUITE 2: DOCX GENERATOR FOR APPENDIX & NDA ---
test('DOCX Generator: generateAppendixDocx produces a valid docx file structure', async () => {
  const dummyAppendixContract = {
    id: 'CTR-2026-APP-001',
    contractNumber: 'CTR-2026-APP-001',
    partyBName: 'Công ty TNHH Dược Phẩm Hà Thành',
    partyBCompany: 'Công ty TNHH Dược Phẩm Hà Thành',
    partyBTax: '0108923481',
    partyBAddress: 'Số 12 Kim Mã, Ba Đình, Hà Nội',
    partyBPhone: '0901234567',
    partyBRepresentative: 'DS. Trần Văn H',
    partyBPosition: 'Tổng Giám Đốc',
    salary: 10000000,
    allowance: 5000000,
    creditLimit: 25000000,
    firstOrderDebt: 25000000,
    discountRate: 22,
    territoryDescription: 'Toàn miền Bắc',
    startDate: '2026-01-01',
    endDate: '2027-01-01',
    parentContractNumber: 'CTR-2025-HDNT-001'
  };

  const result = await generateAppendixDocx(dummyAppendixContract);
  assert.ok(result, 'Should return a result object');
  assert.equal(result.success, true, 'Result success should be true');
  assert.ok(result.fileName.includes('.docx'), 'File name must have .docx extension');
  assert.ok(result.doc, 'Document instance must be present');
});

test('DOCX Generator: generateNdaDocx produces a valid docx file structure', async () => {
  const dummyNdaContract = {
    id: 'CTR-2026-NDA-001',
    contractNumber: 'CTR-2026-NDA-001',
    partyBName: 'DS. Nguyễn Minh Anh',
    partyBPosition: 'Chuyên gia tư vấn Dược lý',
    partyBTax: '0301984520',
    partyBAddress: '45 Võ Thị Sáu, Quận 3, TP.HCM',
    partyBPhone: '0988776655',
    territoryDescription: 'Toàn quốc',
    startDate: '2026-01-01',
    endDate: '2028-01-01'
  };

  const result = await generateNdaDocx(dummyNdaContract);
  assert.ok(result, 'Should return a result object');
  assert.equal(result.success, true, 'Result success should be true');
  assert.ok(result.fileName.includes('.docx'), 'File name must have .docx extension');
  assert.ok(result.fileName.includes('NDA'), 'File name should identify as NDA');
  assert.ok(result.doc, 'Document instance must be present');
});

// --- SUITE 3: NON-SAAS INTERNAL ACCESS & DATA ISOLATION LOGIC ---
test('Access Model: Non-SaaS Staff Data Scope Isolation vs Admin Global Scope', () => {
  // Simulate AppContext data isolation logic
  const mockPeople = [
    { id: 'USR-001', fullName: 'Bùi Đức Long', role: 'ADMIN' },
    { id: 'USR-002', fullName: 'Lê Hoàng Yến', role: 'STAFF' },
    { id: 'USR-003', fullName: 'Trần Văn Nam', role: 'STAFF' }
  ];

  const mockRequests = [
    { id: 'REQ-001', requesterId: 'USR-002', purpose: 'Công tác Hải Phòng' },
    { id: 'REQ-002', requesterId: 'USR-003', purpose: 'Công tác Cần Thơ' },
    { id: 'REQ-003', requesterId: 'USR-001', purpose: 'Duyệt mẫu thử hội nghị' }
  ];

  const mockContracts = [
    { id: 'CTR-001', personId: 'USR-002', createdBy: 'USR-002', partyBName: 'Lê Hoàng Yến' },
    { id: 'CTR-002', personId: 'USR-003', createdBy: 'USR-003', partyBName: 'Trần Văn Nam' },
    { id: 'CTR-003', personId: 'USR-001', createdBy: 'USR-001', partyBName: 'Bùi Đức Long' }
  ];

  const mockCustomers = [
    { id: 'CUST-001', ownerId: 'USR-002', createdBy: 'USR-002', name: 'Nhà thuốc Hoa Sen' },
    { id: 'CUST-002', ownerId: 'USR-003', createdBy: 'USR-003', name: 'Nhà thuốc An Bình' },
    { id: 'CUST-003', ownerId: 'USR-001', createdBy: 'USR-001', name: 'Bệnh viện Bạch Mai' }
  ];

  // Helper matching AppContext implementation:
  const getScopedData = (currentPerson) => {
    const isAdmin = currentPerson.role === 'ADMIN' || currentPerson.role === 'DIRECTOR';
    const scopedRequests = isAdmin ? mockRequests : mockRequests.filter(r => r.requesterId === currentPerson.id);
    const scopedContracts = isAdmin ? mockContracts : mockContracts.filter(c =>
      c.personId === currentPerson.id || c.createdBy === currentPerson.id || c.partyBName === currentPerson.fullName
    );
    const scopedCustomers = isAdmin ? mockCustomers : mockCustomers.filter(c =>
      c.ownerId === currentPerson.id || c.createdBy === currentPerson.id
    );
    return { isAdmin, scopedRequests, scopedContracts, scopedCustomers };
  };

  // Case A: Staff USR-002
  const staffScope = getScopedData(mockPeople[1]);
  assert.equal(staffScope.isAdmin, false);
  assert.equal(staffScope.scopedRequests.length, 1);
  assert.equal(staffScope.scopedRequests[0].id, 'REQ-001');
  assert.equal(staffScope.scopedContracts.length, 1);
  assert.equal(staffScope.scopedContracts[0].id, 'CTR-001');
  assert.equal(staffScope.scopedCustomers.length, 1);
  assert.equal(staffScope.scopedCustomers[0].id, 'CUST-001');

  // Case B: Admin USR-001
  const adminScope = getScopedData(mockPeople[0]);
  assert.equal(adminScope.isAdmin, true);
  assert.equal(adminScope.scopedRequests.length, 3, 'Admin sees all 3 requests');
  assert.equal(adminScope.scopedContracts.length, 3, 'Admin sees all 3 contracts');
  assert.equal(adminScope.scopedCustomers.length, 3, 'Admin sees all 3 customers');
});

test('Staff Management: Admin Invite and Delete Lifecycle with Anti-lockout Protection', () => {
  let peopleList = [
    { id: 'USR-001', fullName: 'Bùi Đức Long', role: 'ADMIN', status: 'ACTIVE' },
    { id: 'USR-002', fullName: 'Lê Hoàng Yến', role: 'STAFF', status: 'ACTIVE' }
  ];

  // Simulate invitePerson
  const invitePerson = ({ fullName, email, role, phone, position, region }) => {
    const inviteCode = 'GF-INV-' + Math.floor(100000 + Math.random() * 900000);
    const newPerson = {
      id: `USR-${String(peopleList.length + 1).padStart(3, '0')}`,
      fullName,
      email,
      role: role || 'STAFF',
      phone: phone || '0901234567',
      position: position || 'Nhân viên kinh doanh',
      region: region || 'Miền Bắc',
      status: 'ACTIVE',
      inviteCode,
      invitedAt: new Date().toISOString()
    };
    peopleList.push(newPerson);
    return newPerson;
  };

  // Simulate deletePerson with anti-lockout protection
  const deletePerson = (idToDelete, currentAdminId) => {
    if (idToDelete === currentAdminId) {
      throw new Error('Không thể tự xóa tài khoản quản trị đang đăng nhập.');
    }
    const exists = peopleList.some(p => p.id === idToDelete);
    if (!exists) throw new Error('Không tìm thấy nhân sự');
    peopleList = peopleList.filter(p => p.id !== idToDelete);
    return true;
  };

  // 1. Invite new staff
  const invited = invitePerson({
    fullName: 'Đỗ Thị Minh',
    email: 'minh.do@genkifami.vn',
    role: 'STAFF',
    phone: '0912345678',
    position: 'Trình dược viên ETC',
    region: 'Miền Trung'
  });

  assert.ok(invited.id, 'Should generate person ID');
  assert.ok(invited.inviteCode.startsWith('GF-INV-'), 'Invite code must start with GF-INV-');
  assert.equal(invited.status, 'ACTIVE');
  assert.equal(peopleList.length, 3);

  // 2. Admin cannot delete self (anti-lockout)
  assert.throws(() => {
    deletePerson('USR-001', 'USR-001');
  }, /Không thể tự xóa/);

  // 3. Admin can safely delete newly invited staff
  const success = deletePerson(invited.id, 'USR-001');
  assert.equal(success, true);
  assert.equal(peopleList.length, 2);
  assert.equal(peopleList.some(p => p.id === invited.id), false);
});
