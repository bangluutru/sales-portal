import test from 'node:test';
import assert from 'node:assert/strict';
import { generateRequestCode, generateContractCode, compileContractTemplate } from '../src/utils/helpers.js';

test('Workflow: Sinh mã request code đúng định dạng chuẩn', () => {
  const tripCode = generateRequestCode('BUSINESS_TRIP', 0);
  const advCode = generateRequestCode('ADVANCE', 1);
  const payCode = generateRequestCode('PAYMENT', 2);
  const setCode = generateRequestCode('SETTLEMENT', 3);
  const samCode = generateRequestCode('SAMPLE', 4);

  assert.match(tripCode, /^TRIP-\d{4}-0001$/);
  assert.match(advCode, /^ADV-\d{4}-0002$/);
  assert.match(payCode, /^PAY-\d{4}-0003$/);
  assert.match(setCode, /^SET-\d{4}-0004$/);
  assert.match(samCode, /^SAM-\d{4}-0005$/);
});

test('Workflow: Sinh mã hợp đồng CTR code đúng định dạng', () => {
  const ctrCode = generateContractCode(5);
  assert.match(ctrCode, /^CTR-\d{4}-0006$/);
});

test('Workflow: Template Engine thay thế chính xác các placeholders', () => {
  const template = 'Hợp đồng số: {{contract_code}} - Nhân sự: {{full_name}} - Thù lao: {{salary}}';
  const data = {
    contractCode: 'CTR-2026-0001',
    fullName: 'Nguyễn Văn An',
    salary: 8000000
  };

  const compiled = compileContractTemplate(template, data);
  assert.ok(compiled.includes('CTR-2026-0001'));
  assert.ok(compiled.includes('Nguyễn Văn An'));
  assert.ok(compiled.includes('8.000.000'));
});
