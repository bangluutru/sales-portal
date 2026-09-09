/**
 * Storage & Data Integrity Helpers for Genki Sales Portal
 * Đảm bảo an toàn dữ liệu người dùng, chống ghi đè khi cập nhật phiên bản.
 */

export const STORAGE_KEY = 'genki_sales_portal_v1';

/**
 * Tải an toàn dữ liệu từ localStorage, phòng ngừa crash và hỗ trợ khóa tương thích ngược
 */
export const safeLoad = (key, fallback, storage = (typeof window !== 'undefined' ? window.localStorage : null)) => {
  if (!storage) return fallback;
  try {
    let saved = storage.getItem(`${STORAGE_KEY}_${key}`);
    if (!saved) {
      const legacyKeys = [
        `genki_sales_portal_${key}`,
        `sales_portal_${key}`,
        `genki_${key}`
      ];
      for (const legKey of legacyKeys) {
        const legVal = storage.getItem(legKey);
        if (legVal) {
          saved = legVal;
          break;
        }
      }
    }
    if (!saved) return fallback;
    const parsed = JSON.parse(saved);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch (err) {
    console.warn(`[SafeStorage] Lỗi tải dữ liệu "${key}", sử dụng dữ liệu mặc định:`, err);
    return fallback;
  }
};

/**
 * Tải an toàn chuỗi ký tự thô từ localStorage
 */
export const safeLoadString = (key, fallback, storage = (typeof window !== 'undefined' ? window.localStorage : null)) => {
  if (!storage) return fallback;
  try {
    const saved = storage.getItem(`${STORAGE_KEY}_${key}`);
    return saved || fallback;
  } catch {
    return fallback;
  }
};

/**
 * Ghép nối danh mục thông minh: Giữ 100% dữ liệu đã sửa của người dùng,
 * chỉ chèn thêm các ID template mới phát sinh trong bản cập nhật.
 */
export const mergeWithDefaults = (savedList, defaultList, idKey = 'id') => {
  if (!Array.isArray(savedList)) return defaultList;
  if (!Array.isArray(defaultList)) return savedList;
  const existingIds = new Set(savedList.map(item => item && item[idKey]).filter(Boolean));
  const missingDefaults = defaultList.filter(item => item && !existingIds.has(item[idKey]));
  return [...savedList, ...missingDefaults];
};

/**
 * Sinh ID số an toàn tuyệt đối: Dò tìm ID số lớn nhất hiện hữu (max + 1),
 * triệt tiêu hoàn toàn nguy cơ trùng lặp hay ghi đè bản ghi cũ.
 */
export const generateSafeId = (prefix, list, padLength = 3) => {
  let maxNum = 0;
  if (Array.isArray(list)) {
    list.forEach(item => {
      if (item && item.id && typeof item.id === 'string' && item.id.startsWith(prefix)) {
        const numPart = parseInt(item.id.replace(prefix, '').replace(/[^0-9]/g, ''), 10);
        if (!isNaN(numPart) && numPart > maxNum) {
          maxNum = numPart;
        }
      }
    });
  }
  return `${prefix}${String(maxNum + 1).padStart(padLength, '0')}`;
};
