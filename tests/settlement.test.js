import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSettlement } from '../src/utils/settlementCalc.js';

test('Settlement: Chi thực tế nhiều hơn tạm ứng -> Công ty hoàn trả bổ sung', () => {
  const advance = 5000000;
  const actual = 6000000;
  const result = calculateSettlement(actual, advance);

  assert.equal(result.difference, 1000000);
  assert.equal(result.companyReimbursement, 1000000);
  assert.equal(result.refundToCompany, 0);
  assert.equal(result.statusType, 'REIMBURSE_STAFF');
});

test('Settlement: Chi thực tế ít hơn tạm ứng -> Nhân sự hoàn trả về công ty', () => {
  const advance = 5000000;
  const actual = 4300000;
  const result = calculateSettlement(actual, advance);

  assert.equal(result.difference, -700000);
  assert.equal(result.companyReimbursement, 0);
  assert.equal(result.refundToCompany, 700000);
  assert.equal(result.statusType, 'REFUND_COMPANY');
});

test('Settlement: Chi thực tế bằng tạm ứng -> Quyết toán cân bằng', () => {
  const advance = 5000000;
  const actual = 5000000;
  const result = calculateSettlement(actual, advance);

  assert.equal(result.difference, 0);
  assert.equal(result.companyReimbursement, 0);
  assert.equal(result.refundToCompany, 0);
  assert.equal(result.statusType, 'BALANCED');
});

test('Settlement: Không có tạm ứng ban đầu (advance = 0)', () => {
  const advance = 0;
  const actual = 1200000;
  const result = calculateSettlement(actual, advance);

  assert.equal(result.difference, 1200000);
  assert.equal(result.companyReimbursement, 1200000);
  assert.equal(result.refundToCompany, 0);
});
