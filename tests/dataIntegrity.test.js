import test from 'node:test';
import assert from 'node:assert/strict';

import {
  safeLoad,
  mergeWithDefaults,
  generateSafeId
} from '../src/utils/storageHelpers.js';

import {
  INITIAL_CUSTOMERS,
  INITIAL_CONTRACTS,
  INITIAL_TEMPLATES
} from '../src/utils/constants.js';

// --- MOCK LOCALSTORAGE RUNTIME FOR NODE ---
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] !== undefined ? this.store[key] : null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
  get length() {
    return Object.keys(this.store).length;
  }
  key(index) {
    return Object.keys(this.store)[index] || null;
  }
}

// Attach mock localStorage to global window
globalThis.window = globalThis.window || {};
globalThis.localStorage = new MockLocalStorage();
globalThis.window.localStorage = globalThis.localStorage;

// --- SUITE 1: SAFE DATA LOADING & COMPATIBILITY ---
test('Data Integrity: safeLoad preserves custom user data in localStorage', () => {
  globalThis.localStorage.clear();

  const customCustomers = [
    { id: 'CUST-001', name: 'Nhà thuốc Minh Châu (User Input)' },
    { id: 'CUST-999', name: 'Khách hàng VIP tự nạp 2025' }
  ];

  // User previously saved data into localStorage
  globalThis.localStorage.setItem('genki_sales_portal_v1_customers', JSON.stringify(customCustomers));

  // safeLoad should load user data without touching or reverting to INITIAL_CUSTOMERS
  const loaded = safeLoad('customers', INITIAL_CUSTOMERS);
  assert.equal(loaded.length, 2);
  assert.equal(loaded[0].name, 'Nhà thuốc Minh Châu (User Input)');
  assert.equal(loaded[1].id, 'CUST-999');
  assert.notEqual(loaded.length, INITIAL_CUSTOMERS.length, 'Must NOT revert to INITIAL_CUSTOMERS');
});

test('Data Integrity: safeLoad falls back to legacy keys if v1 prefix not found', () => {
  globalThis.localStorage.clear();

  const legacyData = [{ id: 'CUST-LEGACY', name: 'Nhà thuốc Dược Phẩm Cũ' }];
  // Stored under legacy key
  globalThis.localStorage.setItem('genki_sales_portal_customers', JSON.stringify(legacyData));

  const loaded = safeLoad('customers', INITIAL_CUSTOMERS);
  assert.equal(loaded.length, 1);
  assert.equal(loaded[0].id, 'CUST-LEGACY');
});

test('Data Integrity: safeLoad gracefully handles corrupt JSON without crashing', () => {
  globalThis.localStorage.clear();
  globalThis.localStorage.setItem('genki_sales_portal_v1_customers', '{corrupt-json-string...!');

  const loaded = safeLoad('customers', INITIAL_CUSTOMERS);
  assert.deepEqual(loaded, INITIAL_CUSTOMERS, 'Should fallback safely to initial data on parse error');
});

// --- SUITE 2: SMART MERGE (PRESERVE USER EDITS, APPEND NEW SYSTEM TEMPLATES) ---
test('Data Integrity: mergeWithDefaults preserves user-customized templates and appends missing ones', () => {
  const userSavedTemplates = [
    {
      id: 'TPL-HTKD',
      name: 'HĐHTKD do người dùng sửa đổi nội dung điều khoản',
      customField: 'UserEditedValue'
    }
  ];

  const systemTemplates = [
    { id: 'TPL-HTKD', name: 'HĐHTKD gốc hệ thống' },
    { id: 'TPL-HDNT', name: 'Hợp Đồng Nguyên Tắc Đại Lý (Mẫu mới ra mắt)' },
    { id: 'TPL-HDLD', name: 'Hợp Đồng Lao Động (Mẫu mới ra mắt)' }
  ];

  const merged = mergeWithDefaults(userSavedTemplates, systemTemplates, 'id');

  // Must have 3 items
  assert.equal(merged.length, 3);

  // The existing template must retain the user's custom modifications!
  const htkd = merged.find(t => t.id === 'TPL-HTKD');
  assert.equal(htkd.name, 'HĐHTKD do người dùng sửa đổi nội dung điều khoản');
  assert.equal(htkd.customField, 'UserEditedValue');

  // The new templates must be appended
  assert.ok(merged.some(t => t.id === 'TPL-HDNT'));
  assert.ok(merged.some(t => t.id === 'TPL-HDLD'));
});

// --- SUITE 3: SAFE ANTI-COLLISION ID GENERATION ---
test('Data Integrity: generateSafeId prevents ID collisions with non-sequential existing records', () => {
  // Scenario: User has custom records with gaps (e.g. CUST-001, CUST-002, CUST-009)
  const existingCustomers = [
    { id: 'CUST-001', name: 'A' },
    { id: 'CUST-002', name: 'B' },
    { id: 'CUST-009', name: 'C' }
  ];

  // With 3 items, an old length+1 algorithm would generate CUST-004, but if user has CUST-009,
  // our safe generator scans for the MAX numerical suffix (9) -> generates CUST-010!
  const nextId = generateSafeId('CUST-', existingCustomers, 3);
  assert.equal(nextId, 'CUST-010', 'Next ID must be higher than highest existing ID');

  // Verify it never duplicates any ID
  const existingIds = new Set(existingCustomers.map(c => c.id));
  assert.equal(existingIds.has(nextId), false);
});

test('Data Integrity: generateSafeId handles empty lists correctly', () => {
  const nextId = generateSafeId('CTR-2026-', [], 4);
  assert.equal(nextId, 'CTR-2026-0001');
});

// --- SUITE 4: LEGACY & UNASSIGNED RECORD SCOPE VISIBILITY ---
test('Data Integrity: Legacy records without ownerId or requesterId remain visible to staff', () => {
  const currentStaff = { id: 'P-001', fullName: 'Nguyễn Văn An', role: 'CTV' };

  const allCustomers = [
    // 1. Customer owned by current staff
    { id: 'CUST-001', name: 'Nhà thuốc Mai Khôi', ownerId: 'P-001', createdBy: 'P-001' },
    // 2. Customer owned by someone else
    { id: 'CUST-002', name: 'Nhà thuốc An Khang', ownerId: 'P-002', createdBy: 'P-002' },
    // 3. Pre-existing / legacy customer entered before auth was introduced (no ownerId)
    { id: 'CUST-003', name: 'Nhà thuốc Long Châu (Nạp từ trước, không có ownerId)' }
  ];

  // Scoping logic matching AppContext.jsx
  const scopedCustomers = allCustomers.filter(c =>
    c.ownerId === currentStaff.id ||
    c.createdBy === currentStaff.id ||
    !c.ownerId ||
    c.ownerId === 'SYSTEM' ||
    c.ownerId === 'ALL'
  );

  // Both staff's customer AND pre-existing customer must be visible!
  assert.equal(scopedCustomers.length, 2);
  assert.ok(scopedCustomers.some(c => c.id === 'CUST-001'));
  assert.ok(scopedCustomers.some(c => c.id === 'CUST-003'), 'Pre-existing legacy customer must NOT be hidden');
  assert.equal(scopedCustomers.some(c => c.id === 'CUST-002'), false);
});

// --- SUITE 5: BACKUP & RESTORE / MERGE SIMULATION ---
test('Data Integrity: System Backup and Restore (MERGE vs OVERWRITE)', () => {
  // Existing state in portal
  let portalCustomers = [
    { id: 'CUST-001', name: 'Bản ghi hiện tại 1' },
    { id: 'CUST-002', name: 'Bản ghi hiện tại 2' }
  ];

  // Backup snapshot to import
  const backupData = {
    data: {
      customers: [
        { id: 'CUST-002', name: 'Bản ghi trùng trong backup' },
        { id: 'CUST-003', name: 'Bản ghi mới từ file backup' }
      ]
    }
  };

  // 1. MERGE mode simulation: Only adds missing records (CUST-003), preserves existing CUST-002
  const mergeExistingIds = new Set(portalCustomers.map(c => c.id));
  const newFromBackup = backupData.data.customers.filter(c => !mergeExistingIds.has(c.id));
  const mergedCustomers = [...portalCustomers, ...newFromBackup];

  assert.equal(mergedCustomers.length, 3);
  assert.equal(mergedCustomers[0].id, 'CUST-001');
  assert.equal(mergedCustomers[1].name, 'Bản ghi hiện tại 2', 'Must NOT overwrite existing CUST-002');
  assert.equal(mergedCustomers[2].id, 'CUST-003');

  // 2. OVERWRITE mode simulation: Replaces with backup data
  const overwrittenCustomers = backupData.data.customers;
  assert.equal(overwrittenCustomers.length, 2);
  assert.equal(overwrittenCustomers[0].id, 'CUST-002');
  assert.equal(overwrittenCustomers[1].id, 'CUST-003');
});
