import test from 'node:test';
import assert from 'node:assert/strict';
import { numberToVietnameseWords, compileContractTemplate } from '../src/utils/helpers.js';
import { INITIAL_TEMPLATES, DEFAULT_BONUS_TIERS } from '../src/utils/constants.js';

test('numberToVietnameseWords converts amounts to standard Vietnamese words', () => {
  assert.equal(numberToVietnameseWords(0), 'Không đồng');
  assert.equal(numberToVietnameseWords(8000000), 'Tám triệu đồng');
  assert.equal(numberToVietnameseWords(7000000), 'Bảy triệu đồng');
  assert.equal(numberToVietnameseWords(100000000), 'Một trăm triệu đồng');
  assert.equal(numberToVietnameseWords(120000000), 'Một trăm hai mươi triệu đồng');
  assert.equal(numberToVietnameseWords(500000000), 'Năm trăm triệu đồng');
});

test('compileContractTemplate properly substitutes HTKD contract variables', () => {
  const htkdTemplate = INITIAL_TEMPLATES.find(t => t.id === 'TPL-HTKD');
  assert.ok(htkdTemplate, 'TPL-HTKD template should exist');

  const contractData = {
    contractCode: '20260601_HĐHT - Nguyễn Văn An_HN',
    fullName: 'Nguyễn Văn An',
    genderTitle: 'Ông',
    phone: '0901234567',
    email: 'an.nguyen@genkifami.vn',
    dateOfBirth: '1995-04-12',
    address: '124 Hoàng Hoa Thám, Ba Đình, Hà Nội',
    currentAddress: 'Số 18 Ngõ 68 Đội Cấn, Ba Đình, Hà Nội',
    identityNumber: '001095012345',
    identityDate: '15/06/2021',
    identityPlace: 'Cục Cảnh sát QLHC về TTXH',
    taxNumber: '8012345678',
    bankName: 'Vietcombank',
    bankBranch: 'Chi nhánh Ba Đình - Hà Nội',
    bankAccount: '001100456789',
    startDate: '2026-06-01',
    endDate: '2027-05-31',
    salary: 8000000,
    allowance: 7000000,
    kpiTargetRevenue: 100000000,
    probationMonths: 3,
    quarterBonusRate: 0.5,
    yearBonusRate: 0.2,
    bonusTiers: DEFAULT_BONUS_TIERS,
    territoryDescription: 'Thị trường Hà Nội và các tỉnh Đồng Bằng Sông Hồng'
  };

  const compiled = compileContractTemplate(htkdTemplate.templateContent, contractData);

  assert.ok(compiled.includes('20260601_HĐHT - Nguyễn Văn An_HN'), 'Contains contract code');
  assert.ok(compiled.includes('Nguyễn Văn An'), 'Contains person full name');
  assert.ok(compiled.includes('001095012345'), 'Contains CCCD number');
  assert.ok(compiled.includes('8.000.000'), 'Contains PCB formatted amount');
  assert.ok(compiled.includes('Tám triệu đồng'), 'Contains PCB in words');
  assert.ok(compiled.includes('7.000.000'), 'Contains PKT formatted amount');
  assert.ok(compiled.includes('Bảy triệu đồng'), 'Contains PKT in words');
  assert.ok(compiled.includes('100.000.000'), 'Contains KPI target amount');
  assert.ok(compiled.includes('Một trăm triệu đồng'), 'Contains KPI target in words');
  assert.ok(compiled.includes('PHỤ LỤC 01: CƠ CHẾ CHI TRẢ THÙ LAO VÀ THƯỞNG KINH DOANH'), 'Contains Appendix 01');
  assert.ok(compiled.includes('0.5%') || compiled.includes('0,5%'), 'Contains quarterly bonus rate');
  assert.ok(compiled.includes('0.2%') || compiled.includes('0,2%'), 'Contains yearly bonus rate');
});

test('INITIAL_TEMPLATES contains all 3 required standard templates', () => {
  const ids = INITIAL_TEMPLATES.map(t => t.id);
  assert.ok(ids.includes('TPL-HTKD'), 'Should have HTKD template');
  assert.ok(ids.includes('TPL-CTV'), 'Should have CTV template');
  assert.ok(ids.includes('TPL-STAFF'), 'Should have Staff template');
});
