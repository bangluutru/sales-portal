import test from 'node:test';
import assert from 'node:assert/strict';
import { numberToVietnameseWords, compileContractTemplate, formatVND } from '../src/utils/helpers.js';
import { INITIAL_TEMPLATES, INITIAL_CONTRACTS } from '../src/utils/constants.js';
import { generateHdldDocx } from '../src/utils/contractDocxGenerator.js';

test('TPL-HDLD template exists in INITIAL_TEMPLATES and has required metadata', () => {
  const hdldTemplate = INITIAL_TEMPLATES.find(t => t.id === 'TPL-HDLD');
  assert.ok(hdldTemplate, 'TPL-HDLD should exist in INITIAL_TEMPLATES');
  assert.equal(hdldTemplate.category, 'Hợp Đồng Lao Động');
  assert.ok(hdldTemplate.name.includes('Hợp Đồng Lao Động'));
  assert.ok(hdldTemplate.templateContent.includes('BẢNG MÔ TẢ CÔNG VIỆC'), 'Should include Page 2 JD');
  assert.ok(hdldTemplate.templateContent.includes('24 tháng'), 'Should include 24-month non-compete clause');
});

test('INITIAL_CONTRACTS contains standard seed demo labor contract CTR-2025-HDLD-001', () => {
  const demoContract = INITIAL_CONTRACTS.find(c => c.id === 'CTR-2025-HDLD-001');
  assert.ok(demoContract, 'CTR-2025-HDLD-001 should exist in INITIAL_CONTRACTS');
  assert.equal(demoContract.contractType, 'HDLD');
  assert.equal(demoContract.contractCode, '100325/HĐLĐ-GENKI');
  assert.equal(demoContract.salary, 7491370, 'Base salary matches standard');
  assert.equal(demoContract.performanceBonus, 1278630, 'Performance bonus matches standard');
  assert.equal(demoContract.mealAllowance, 730000, 'Meal allowance matches TT 26/2016 standard');
  assert.equal(demoContract.partyARepresentative, 'Ông Trần Hải Bằng');
  assert.equal(demoContract.partyAPosition, 'Tổng Giám đốc');
  assert.ok(demoContract.jdTasks && demoContract.jdTasks.length >= 3, 'Contains structured JD tasks');
});

test('compileContractTemplate substitutes HDLD placeholders accurately', () => {
  const hdldTemplate = INITIAL_TEMPLATES.find(t => t.id === 'TPL-HDLD');
  assert.ok(hdldTemplate);

  const contractData = {
    contractCode: '100325/HĐLĐ-GENKI',
    fullName: 'Đoàn Kim Ngân',
    genderTitle: 'Bà',
    phone: '0988776655',
    email: 'ngan.dk@genkifami.vn',
    dateOfBirth: '1998-05-20',
    address: 'Số 19/48 Nguyễn Cửu Đàm, P Tân Sơn Nhì, Q. Tân Phú, TP Hồ Chí Minh',
    currentAddress: 'Số 19/48 Nguyễn Cửu Đàm, P Tân Sơn Nhì, Q. Tân Phú, TP Hồ Chí Minh',
    identityNumber: '079198012345',
    identityDate: '20/04/2021',
    identityPlace: 'Cục Cảnh sát QLHC về TTXH',
    bankName: 'Vietcombank',
    bankAccount: '1012345678',
    startDate: '2025-03-10',
    endDate: '2027-03-09',
    baseSalary: 7491370,
    performanceBonus: 1278630,
    mealAllowance: 730000,
    contractDuration: '02 năm',
    probationPeriod: '02 tháng (Hưởng 85% tổng lương chức danh)',
    workLocation: 'Kho vận Tân Phú, TP Hồ Chí Minh',
    workHours: '48 giờ/tuần (8h00 - 17h00)',
    jobTitle: 'Nhân viên Điều phối Kho vận & Hỗ trợ Kinh doanh',
    department: 'Phòng Quản lý Kho vận & Hỗ trợ Kinh doanh',
    reportTo: 'Trưởng phòng Vận hành / Ban Giám đốc'
  };

  const compiled = compileContractTemplate(hdldTemplate.templateContent, contractData);

  assert.ok(compiled.includes('100325/HĐLĐ-GENKI'), 'Contains contract code');
  assert.ok(compiled.includes('Đoàn Kim Ngân'), 'Contains employee name');
  assert.ok(compiled.includes('079198012345'), 'Contains CCCD number');
  assert.ok(compiled.includes('7.491.370'), 'Contains formatted base salary');
  assert.ok(compiled.includes('1.278.630'), 'Contains formatted performance bonus');
  assert.ok(compiled.includes('730.000'), 'Contains formatted meal allowance');
  assert.ok(compiled.includes('02 năm'), 'Contains contract duration');
  assert.ok(compiled.includes('Kho vận Tân Phú'), 'Contains work location');
  assert.ok(compiled.toUpperCase().includes('TRẦN HẢI BẰNG'), 'Contains representative name');
  assert.ok(compiled.includes('24 tháng'), 'Contains 24-month non-compete clause');
});

test('generateHdldDocx produces valid DOCX export object in Node runtime', async () => {
  const demoContract = INITIAL_CONTRACTS.find(c => c.id === 'CTR-2025-HDLD-001');
  const demoPerson = {
    id: 'P004',
    fullName: 'Đoàn Kim Ngân',
    phone: '0988776655',
    email: 'ngan.dk@genkifami.vn',
    address: 'Số 19/48 Nguyễn Cửu Đàm, P Tân Sơn Nhì, Q. Tân Phú, TP Hồ Chí Minh',
    identityNumber: '079198012345',
    identityDate: '20/04/2021',
    identityPlace: 'Cục Cảnh sát QLHC về TTXH',
    bankName: 'Vietcombank',
    bankAccount: '1012345678'
  };
  const demoTemplate = INITIAL_TEMPLATES.find(t => t.id === 'TPL-HDLD');

  const result = await generateHdldDocx(demoContract, demoPerson, demoTemplate);
  assert.ok(result, 'generateHdldDocx should return a result object');
  assert.equal(result.success, true, 'Result success should be true');
  assert.ok(result.fileName.includes('.docx'), 'File name must have .docx extension');
  assert.ok(result.fileName.includes('HDLD'), 'File name should identify as HDLD');
});

test('Legal compliance constraints: meal allowance and non-compete restrictions', () => {
  const hdldTemplate = INITIAL_TEMPLATES.find(t => t.id === 'TPL-HDLD');
  assert.ok(hdldTemplate.templateContent.includes('Thông tư số 26/2016/TT-BLĐTBXH'), 'Must cite TT 26/2016 for 730k tax exemption');
  assert.ok(hdldTemplate.templateContent.includes('Bộ luật Lao động số 45/2019/QH14'), 'Must cite Labor Code 2019');
  assert.ok(hdldTemplate.templateContent.includes('24 tháng kể từ khi nghỉ việc'), 'Must include 24-month post-employment covenant');
});
