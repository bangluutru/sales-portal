import test from 'node:test';
import assert from 'node:assert/strict';
import { numberToVietnameseWords, compileContractTemplate, formatVND } from '../src/utils/helpers.js';
import { INITIAL_TEMPLATES, INITIAL_CONTRACTS } from '../src/utils/constants.js';
import { generateHdntDocx } from '../src/utils/contractDocxGenerator.js';

test('TPL-HDNT template exists in INITIAL_TEMPLATES and has required metadata', () => {
  const hdntTemplate = INITIAL_TEMPLATES.find(t => t.id === 'TPL-HDNT');
  assert.ok(hdntTemplate, 'TPL-HDNT should exist in INITIAL_TEMPLATES');
  assert.equal(hdntTemplate.category, 'Hợp Đồng Nguyên Tắc');
  assert.ok(hdntTemplate.name.includes('Hợp Đồng Nguyên Tắc'));
  assert.ok(hdntTemplate.templateContent.includes('PHỤ LỤC 01'), 'Should include Annex 01');
  assert.ok(hdntTemplate.templateContent.includes('ĐIỀU 14 & 15') || hdntTemplate.templateContent.includes('ĐIỀU 16'), 'Should include statutory articles');
  assert.ok(hdntTemplate.templateContent.includes('AMIS CRM'), 'Should mention AMIS CRM ordering');
});

test('INITIAL_CONTRACTS contains standard seed demo master agreement CTR-2026-HDNT-001', () => {
  const demoContract = INITIAL_CONTRACTS.find(c => c.id === 'CTR-2026-HDNT-001');
  assert.ok(demoContract, 'CTR-2026-HDNT-001 should exist in INITIAL_CONTRACTS');
  assert.equal(demoContract.contractType, 'HDNT');
  assert.equal(demoContract.contractCode, 'HĐMB-2026-01/GENKI-QUANGMINHDL');
  assert.equal(demoContract.partyBType, 'ENTERPRISE');
  assert.equal(demoContract.discountRate, 18, 'Discount rate is 18%');
  assert.equal(demoContract.firstOrderDebt, 12021200, 'First order debt is 12.021.200 VNĐ');
  assert.equal(demoContract.partyBCompany, 'CÔNG TY TNHH TM&DV QUANG MINH DL');
  assert.equal(demoContract.partyBTax, '5801510308');
  assert.equal(demoContract.partyBRepresentative, 'Bà Hồ Thị Quế');
  assert.ok(demoContract.orderProducts && demoContract.orderProducts.length === 3, 'Contains 3 initial sample order products');
});

test('compileContractTemplate substitutes HDNT placeholders accurately for Enterprise', () => {
  const hdntTemplate = INITIAL_TEMPLATES.find(t => t.id === 'TPL-HDNT');
  assert.ok(hdntTemplate);

  const contractData = {
    contractCode: 'HĐMB-2026-01/GENKI-QUANGMINHDL',
    startDate: '2026-01-15',
    endDate: '2027-01-14',
    partyBType: 'ENTERPRISE',
    partyBCompany: 'CÔNG TY TNHH TM&DV QUANG MINH DL',
    partyBTax: '5801452296',
    partyBRepresentative: 'Bà Hồ Thị Quế',
    partyBPosition: 'Giám đốc',
    partyBAddress: 'Số 123 Đường 3 Tháng 2, Phường 1, TP. Đà Lạt, Tỉnh Lâm Đồng',
    phone: '0912345678',
    email: 'quangminhdl@gmail.com',
    bankName: 'Vietcombank',
    bankAccount: '0071001234567',
    discountRate: 18,
    firstOrderDebt: 12021200,
    creditLimit: 12021200
  };

  const compiled = compileContractTemplate(hdntTemplate.templateContent, contractData);

  assert.ok(compiled.includes('HĐMB-2026-01/GENKI-QUANGMINHDL'), 'Contains contract code');
  assert.ok(compiled.includes('CÔNG TY TNHH TM&DV QUANG MINH DL'), 'Contains enterprise name');
  assert.ok(compiled.includes('5801452296'), 'Contains tax code');
  assert.ok(compiled.includes('Bà Hồ Thị Quế'), 'Contains representative');
  assert.ok(compiled.includes('18%'), 'Contains 18% discount');
  assert.ok(compiled.includes('12.021.200'), 'Contains formatted first order debt');
  assert.ok(compiled.includes('Mười hai triệu không trăm hai mươi mốt nghìn hai trăm đồng'), 'Contains debt in words');
  assert.ok(compiled.toUpperCase().includes('LÊ TRÍ NAM'), 'Contains Party A representative');
});

test('compileContractTemplate handles Individual Retailer / Sales Agent fallback', () => {
  const hdntTemplate = INITIAL_TEMPLATES.find(t => t.id === 'TPL-HDNT');
  assert.ok(hdntTemplate);

  const contractData = {
    contractCode: 'HĐMB-2026-02/GENKI-TRANTHILIEN',
    startDate: '2026-02-01',
    endDate: '2027-01-31',
    partyBType: 'INDIVIDUAL',
    fullName: 'Trần Thị Liên',
    genderTitle: 'Bà',
    identityNumber: '038195001234',
    identityDate: '15/05/2021',
    identityPlace: 'Cục Cảnh sát QLHC về TTXH',
    address: 'Xã Hải Hưng, Huyện Hải Hậu, Tỉnh Nam Định',
    phone: '0977889900',
    email: 'lien.tran@gmail.com',
    bankName: 'BIDV',
    bankAccount: '1234567890',
    discountRate: 18,
    firstOrderDebt: 11709600
  };

  const compiled = compileContractTemplate(hdntTemplate.templateContent, contractData);

  assert.ok(compiled.includes('HĐMB-2026-02/GENKI-TRANTHILIEN'), 'Contains contract code');
  assert.ok(compiled.includes('Trần Thị Liên'), 'Contains individual name');
  assert.ok(compiled.includes('038195001234'), 'Contains CCCD fallback');
  assert.ok(compiled.includes('18%'), 'Contains 18% discount');
  assert.ok(compiled.includes('11.709.600'), 'Contains formatted first order debt');
});

test('generateHdntDocx produces valid DOCX export object in Node runtime', async () => {
  const demoContract = INITIAL_CONTRACTS.find(c => c.id === 'CTR-2026-HDNT-001');
  const demoPerson = {
    id: 'P005',
    fullName: 'Bà Hồ Thị Quế',
    phone: '0912345678',
    email: 'quangminhdl@gmail.com',
    address: 'Số 123 Đường 3 Tháng 2, Phường 1, TP. Đà Lạt, Tỉnh Lâm Đồng',
    identityNumber: '058185001234',
    taxNumber: '5801452296',
    bankName: 'Vietcombank',
    bankAccount: '0071001234567'
  };
  const demoTemplate = INITIAL_TEMPLATES.find(t => t.id === 'TPL-HDNT');

  const result = await generateHdntDocx(demoContract, demoPerson, demoTemplate);
  assert.ok(result, 'generateHdntDocx should return a result object');
  assert.equal(result.success, true, 'Result success should be true');
  assert.ok(result.fileName.includes('.docx'), 'File name must have .docx extension');
  assert.ok(result.fileName.includes('GENKI-QUANGMINHDL') || result.fileName.includes('HDMB'), 'File name should identify contract');
  assert.ok(!result.fileName.includes('/'), 'File name must not contain invalid path slashes');
});

test('Commercial terms compliance: trade discount, anti-dumping, penalties and trade secrets', () => {
  const hdntTemplate = INITIAL_TEMPLATES.find(t => t.id === 'TPL-HDNT');
  // Article 301 Commercial Law 2005: 8% penalty
  assert.ok(hdntTemplate.templateContent.includes('8%'), 'Must include 8% penalty under Commercial Law');
  // Anti-dumping clause
  assert.ok(hdntTemplate.templateContent.includes('bán phá giá'), 'Must include anti-dumping clause');
  // Trade secret penalty: 100.000.000 VNĐ
  assert.ok(hdntTemplate.templateContent.includes('100.000.000 VNĐ'), 'Must include 100M VNĐ trade secret breach sanction');
  // First-order credit settlement upon termination
  assert.ok(hdntTemplate.templateContent.includes('thanh lý'), 'First order debt settled upon contract termination');
});
