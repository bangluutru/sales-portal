import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  INITIAL_PEOPLE,
  INITIAL_CUSTOMERS,
  INITIAL_CONTRACTS,
  INITIAL_TEMPLATES,
  INITIAL_REQUESTS,
  INITIAL_WORKFLOW_TEMPLATES,
  INITIAL_APP_LINKS,
  ROLES
} from '../utils/constants.js';

import {
  STORAGE_KEY,
  safeLoad,
  safeLoadString,
  mergeWithDefaults,
  generateSafeId
} from '../utils/storageHelpers.js';

export { STORAGE_KEY, safeLoad, safeLoadString, mergeWithDefaults, generateSafeId };

const AppContext = createContext();

const INITIAL_NOTIFICATIONS = [
  {
    id: 'NOTIF-01',
    title: 'Chào mừng bạn đến Genki Sales Portal',
    message: 'Cổng thông tin tác nghiệp kinh doanh & quản trị nội bộ chính thức của Genki Fami.',
    type: 'SYSTEM',
    createdAt: new Date().toISOString(),
    read: false
  },
  {
    id: 'NOTIF-02',
    title: 'Đề nghị công tác TRIP-2026-0001',
    message: 'Hồ sơ đã hoàn tất bước thẩm tra và sẵn sàng giải ngân tạm ứng.',
    type: 'REQUEST',
    linkTab: 'operations',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    read: false
  },
  {
    id: 'NOTIF-03',
    title: 'Hợp đồng nguyên tắc CTR-2026-HDNT-001',
    message: 'Đã đối soát thông tin pháp nhân với Dược phẩm Long Châu theo chuẩn hóa đơn GTGT.',
    type: 'CONTRACT',
    linkTab: 'contracts',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    read: true
  }
];

export function AppProvider({ children }) {
  // 1. Tải trạng thái từ LocalStorage hoặc dùng dữ liệu khởi tạo chuẩn
  const [people, setPeople] = useState(() => safeLoad('people', INITIAL_PEOPLE));
  const [currentPersonId, setCurrentPersonId] = useState(() => safeLoadString('current_user', 'P-001'));
  const [customers, setCustomers] = useState(() => safeLoad('customers', INITIAL_CUSTOMERS));
  const [contracts, setContracts] = useState(() => safeLoad('contracts', INITIAL_CONTRACTS));
  const [contractTemplates, setContractTemplates] = useState(() => mergeWithDefaults(safeLoad('templates', INITIAL_TEMPLATES), INITIAL_TEMPLATES));
  const [requests, setRequests] = useState(() => safeLoad('requests', INITIAL_REQUESTS));
  const [workflowTemplates, setWorkflowTemplates] = useState(() => mergeWithDefaults(safeLoad('workflows', INITIAL_WORKFLOW_TEMPLATES), INITIAL_WORKFLOW_TEMPLATES));
  const [appLinks, setAppLinks] = useState(() => mergeWithDefaults(safeLoad('app_links', INITIAL_APP_LINKS), INITIAL_APP_LINKS));
  const [notifications, setNotifications] = useState(() => safeLoad('notifications', INITIAL_NOTIFICATIONS));

  // Thư mục Drive cá nhân ghim nhanh (Personal Pinned Folders)
  const [pinnedFolders, setPinnedFolders] = useState(() => {
    return safeLoad(`pinned_folders_${currentPersonId}`, [
      {
        id: 'FLD-01',
        name: 'Hồ Sơ Hóa Đơn & Chứng Từ Công Tác',
        url: 'https://drive.google.com',
        note: 'Lưu trữ scan vé máy bay, hóa đơn đỏ khách sạn',
        pinnedAt: new Date().toISOString()
      },
      {
        id: 'FLD-02',
        name: 'Báo Cáo Nghiệm Thu & Cấp Mẫu Khách Hàng',
        url: 'https://drive.google.com',
        note: 'Biên bản bàn giao mẫu thử nhà thuốc',
        pinnedAt: new Date().toISOString()
      }
    ]);
  });

  // UI state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [quickActionModalOpen, setQuickActionModalOpen] = useState(false);
  const [quickActionInitialType, setQuickActionInitialType] = useState('BUSINESS_TRIP');
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [selectedContractId, setSelectedContractId] = useState(null);

  // Người dùng hiện tại
  const currentPerson = people.find(p => p.id === currentPersonId) || people[0] || {
    id: 'P-001',
    fullName: 'Nguyễn Văn An',
    role: 'CTV'
  };

  // Cập nhật pinnedFolders khi đổi người dùng
  useEffect(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_pinned_folders_${currentPersonId}`);
    if (saved) {
      try {
        setPinnedFolders(JSON.parse(saved));
      } catch {
        // Fallback default if parse error
      }
    } else {
      setPinnedFolders([
        {
          id: 'FLD-01',
          name: 'Hồ Sơ Hóa Đơn & Chứng Từ Công Tác',
          url: 'https://drive.google.com',
          note: 'Lưu trữ scan vé máy bay, hóa đơn đỏ',
          pinnedAt: new Date().toISOString()
        }
      ]);
    }
  }, [currentPersonId]);

  // Lưu trữ đồng bộ vào LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_people`, JSON.stringify(people));
      localStorage.setItem(`${STORAGE_KEY}_customers`, JSON.stringify(customers));
      localStorage.setItem(`${STORAGE_KEY}_contracts`, JSON.stringify(contracts));
      localStorage.setItem(`${STORAGE_KEY}_templates`, JSON.stringify(contractTemplates));
      localStorage.setItem(`${STORAGE_KEY}_requests`, JSON.stringify(requests));
      localStorage.setItem(`${STORAGE_KEY}_workflows`, JSON.stringify(workflowTemplates));
      localStorage.setItem(`${STORAGE_KEY}_app_links`, JSON.stringify(appLinks));
      localStorage.setItem(`${STORAGE_KEY}_notifications`, JSON.stringify(notifications));
      localStorage.setItem(`${STORAGE_KEY}_pinned_folders_${currentPersonId}`, JSON.stringify(pinnedFolders));
      localStorage.setItem(`${STORAGE_KEY}_current_user`, currentPersonId);
    } catch (err) {
      console.error('[LocalStorage] Lỗi ghi dữ liệu:', err);
    }
  }, [people, customers, contracts, contractTemplates, requests, workflowTemplates, appLinks, notifications, pinnedFolders, currentPersonId]);

  // ==================== MÔ HÌNH PHÂN QUYỀN NỘI BỘ (NON-SAAS) ====================
  // 1. Admin: Ban Giám Đốc hoặc Quản Trị Hệ Thống (Xem toàn bộ, có quyền mời/xóa nhân sự)
  // 2. Nhân sự (Staff / CTV / Kế toán / Sales): Đăng nhập chỉ xem thông tin của mình, nhưng TOÀN QUYỀN THAO TÁC NGHIỆP VỤ
  const isAdmin = currentPerson.role === 'ADMIN' || currentPerson.role === 'DIRECTOR';
  const isStaff = !isAdmin;

  // Dữ liệu theo phạm vi người dùng (Data Scope Isolation):
  // - Admin thấy toàn bộ
  // - Nhân sự thấy đề xuất, hợp đồng, khách hàng của mình + BẢO VỆ DỮ LIỆU CŨ (Legacy Unassigned Data)
  const scopedRequests = useMemo(() => {
    if (isAdmin) return requests;
    return requests.filter(r => 
      r.requesterId === currentPerson.id || 
      !r.requesterId
    );
  }, [isAdmin, requests, currentPerson.id]);

  const scopedContracts = useMemo(() => {
    if (isAdmin) return contracts;
    return contracts.filter(c => 
      c.personId === currentPerson.id || 
      c.createdBy === currentPerson.id || 
      c.partyBName === currentPerson.fullName ||
      !c.personId ||
      !c.createdBy
    );
  }, [isAdmin, contracts, currentPerson.id, currentPerson.fullName]);

  const scopedCustomers = useMemo(() => {
    if (isAdmin) return customers;
    return customers.filter(c => 
      c.ownerId === currentPerson.id || 
      c.createdBy === currentPerson.id ||
      !c.ownerId ||
      c.ownerId === 'SYSTEM' ||
      c.ownerId === 'ALL'
    );
  }, [isAdmin, customers, currentPerson.id]);

  // Tính toán số lượng việc trong "My Tasks"
  const myTasks = requests.filter(req => {
    const role = currentPerson.role;
    if (role === 'MANAGER') {
      return req.status === 'SUBMITTED' || req.status === 'MANAGER_REVIEW';
    }
    if (role === 'DIRECTOR') {
      return req.status === 'DIRECTOR_REVIEW';
    }
    if (role === 'ACCOUNTING') {
      return req.status === 'ACCOUNTING_REVIEW' || req.status === 'READY_FOR_PAYMENT';
    }
    if (role === 'STAFF' || role === 'CTV' || role === 'PARTNER') {
      return req.requesterId === currentPerson.id && 
        (req.status === 'REVISION_REQUESTED' || req.status === 'NEED_MORE_INFORMATION');
    }
    if (role === 'ADMIN') {
      return req.status === 'SUBMITTED' || req.status === 'MANAGER_REVIEW' || req.status === 'DIRECTOR_REVIEW';
    }
    return false;
  });

  // Hợp đồng chờ duyệt cho Director
  const pendingContracts = contracts.filter(c => {
    if (currentPerson.role === 'DIRECTOR') {
      return c.status === 'DIRECTOR_REVIEW' || c.status === 'SUBMITTED';
    }
    if (currentPerson.role === 'MANAGER') {
      return c.status === 'DRAFT' || c.status === 'REVISION_REQUESTED';
    }
    return false;
  });

  const totalMyTasksCount = myTasks.length + pendingContracts.length;

  // ==================== QUẢN LÝ THÔNG BÁO (NOTIFICATIONS) ====================
  const addNotification = ({ title, message, type = 'INFO', linkTab = null }) => {
    const newNotif = {
      id: `NOTIF-${Date.now().toString().slice(-6)}`,
      title,
      message,
      type,
      linkTab,
      createdAt: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
    return newNotif;
  };

  const markNotificationAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  // ==================== GHIM THƯ MỤC GOOGLE DRIVE ====================
  const pinDriveFolder = ({ name, url, note = '' }) => {
    const newFolder = {
      id: `FLD-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      url: url.trim() || 'https://drive.google.com',
      note: note.trim(),
      pinnedAt: new Date().toISOString()
    };
    setPinnedFolders(prev => [newFolder, ...prev]);
    addNotification({
      title: 'Đã ghim thư mục Drive',
      message: `Đã lưu lối tắt tới thư mục: "${name}"`,
      type: 'SYSTEM',
      linkTab: 'dashboard'
    });
    return newFolder;
  };

  const unpinDriveFolder = (folderId) => {
    setPinnedFolders(prev => prev.filter(f => f.id !== folderId));
  };

  // ==================== QUẢN LÝ NHÂN SỰ & MỜI / XÓA (ADMIN ONLY) ====================
  const invitePerson = ({ fullName, email, phone = '', role = 'STAFF', region = 'Miền Bắc', position = 'Chuyên viên Kinh doanh' }) => {
    if (!isAdmin) {
      throw new Error('Chỉ Quản trị viên (Admin/Director) mới có quyền mời nhân sự!');
    }

    const code = `GF-INV-${Date.now().toString().slice(-5)}`;
    const newId = generateSafeId('P-', people, 3);
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://portal.genkifami.vn';
    const inviteLink = `${baseUrl}/?invite=${code}&user=${encodeURIComponent(email)}`;

    const newPerson = {
      id: newId,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() || '0901234567',
      role: role || 'STAFF',
      position: position || 'Chuyên viên Kinh doanh',
      region: region || 'Miền Bắc',
      status: 'ACTIVE',
      inviteCode: code,
      inviteLink,
      invitedAt: new Date().toISOString(),
      invitedBy: currentPerson.fullName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setPeople(prev => [newPerson, ...prev]);

    addNotification({
      title: 'Thư mời nhân sự được phát hành',
      message: `Đã cấp mã mời ${code} cho ${fullName} (${email}).`,
      type: 'STAFF',
      linkTab: 'admin'
    });

    return newPerson;
  };

  const deletePerson = (id) => {
    if (!isAdmin) {
      throw new Error('Chỉ Quản trị viên mới có quyền xóa nhân sự!');
    }
    if (id === currentPersonId) {
      throw new Error('Không thể tự xóa tài khoản bạn đang đăng nhập!');
    }

    const target = people.find(p => p.id === id);
    setPeople(prev => prev.filter(p => p.id !== id));

    addNotification({
      title: 'Đã xóa tài khoản nhân sự',
      message: `Đã xóa tài khoản ${target?.fullName || id} khỏi cổng thông tin.`,
      type: 'STAFF',
      linkTab: 'admin'
    });

    return true;
  };

  const togglePersonStatus = (id) => {
    if (!isAdmin) {
      throw new Error('Chỉ Quản trị viên mới có quyền thay đổi trạng thái nhân sự!');
    }
    setPeople(prev => prev.map(p => {
      if (p.id !== id) return p;
      const nextStatus = p.status === 'INACTIVE' ? 'ACTIVE' : 'INACTIVE';
      return { ...p, status: nextStatus, updatedAt: new Date().toISOString() };
    }));
  };

  const addPerson = (newPerson) => {
    const id = newPerson.id || generateSafeId('P-', people, 3);
    const person = { ...newPerson, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    setPeople(prev => [person, ...prev]);
    return person;
  };

  const updatePerson = (id, updates) => {
    setPeople(prev => prev.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p));
  };

  // ==================== THAO TÁC VỚI KHÁCH HÀNG / CUSTOMER ====================
  const addCustomer = (newCust) => {
    const id = newCust.id || generateSafeId('CUST-', customers, 3);
    const cust = {
      ...newCust,
      id,
      ownerId: newCust.ownerId || currentPerson.id,
      createdBy: currentPerson.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setCustomers(prev => [cust, ...prev]);

    addNotification({
      title: 'Thêm khách hàng thành công',
      message: `Đã ghi nhận đối tác "${cust.name}" vào danh bạ phụ trách.`,
      type: 'CUSTOMER',
      linkTab: 'customers'
    });

    return cust;
  };

  const updateCustomer = (id, updates) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c));
  };

  const deleteCustomer = (id) => {
    const cust = customers.find(c => c.id === id);
    if (!cust) return { success: false, reason: 'Không tìm thấy thông tin khách hàng.' };

    // Kiểm tra xem khách hàng có hợp đồng liên kết không
    const linkedContracts = contracts.filter(c => c.customerId === id || (cust.name && c.partyBName === cust.name));
    if (linkedContracts.length > 0) {
      return {
        success: false,
        reason: `Không thể xóa khách hàng "${cust.name}" vì đang có ${linkedContracts.length} hợp đồng liên kết trong hệ thống!`
      };
    }

    setCustomers(prev => prev.filter(c => c.id !== id));
    addNotification({
      title: 'Đã xóa khách hàng',
      message: `Đã xóa khách hàng "${cust.name}" (${id}) khỏi hệ thống.`,
      type: 'CUSTOMER',
      linkTab: 'customers'
    });
    return { success: true };
  };

  // ==================== THAO TÁC VỚI HỢP ĐỒNG / CONTRACT ====================
  const addContract = (newContract) => {
    const id = newContract.id || generateSafeId('CTR-2026-', contracts, 4);
    const contract = {
      ...newContract,
      id,
      contractCode: newContract.contractCode || id,
      personId: newContract.personId || currentPerson.id,
      createdBy: currentPerson.id,
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setContracts(prev => [contract, ...prev]);

    addNotification({
      title: 'Tạo bản thảo hợp đồng mới',
      message: `Đã soạn thảo thành công hợp đồng ${contract.contractCode}.`,
      type: 'CONTRACT',
      linkTab: 'contracts'
    });

    return contract;
  };

  const updateContract = (contractId, updates) => {
    setContracts(prev => prev.map(c => {
      if (c.id === contractId) {
        return {
          ...c,
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    }));
  };

  const updateContractStatus = (contractId, newStatus, comment = '') => {
    setContracts(prev => prev.map(c => {
      if (c.id === contractId) {
        return {
          ...c,
          status: newStatus,
          approvedBy: newStatus === 'APPROVED' ? currentPerson.fullName : c.approvedBy,
          approvedAt: newStatus === 'APPROVED' ? new Date().toISOString() : c.approvedAt,
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    }));
  };

  const deleteContract = (contractId) => {
    const target = contracts.find(c => c.id === contractId);
    if (!target) return { success: false, reason: 'Không tìm thấy hợp đồng.' };

    if (target.status !== 'DRAFT' && target.status !== 'REJECTED') {
      return {
        success: false,
        reason: 'Chỉ được phép xóa hợp đồng ở trạng thái Bản thảo (DRAFT) hoặc Bị từ chối (REJECTED)!'
      };
    }

    setContracts(prev => prev.filter(c => c.id !== contractId));
    if (selectedContractId === contractId) {
      setSelectedContractId(null);
    }
    addNotification({
      title: 'Đã xóa hợp đồng',
      message: `Đã xóa hợp đồng ${target.contractCode || contractId} khỏi hệ thống.`,
      type: 'CONTRACT',
      linkTab: 'contracts'
    });
    return { success: true };
  };

  // ==================== THAO TÁC VỚI ĐỀ NGHỊ / REQUEST ====================
  const addRequest = (newRequestData) => {
    const id = newRequestData.id || generateSafeId('REQ-2026-', requests, 4);
    const req = {
      ...newRequestData,
      id,
      requestCode: newRequestData.requestCode || id,
      requesterId: newRequestData.requesterId || currentPerson.id,
      managerId: currentPerson.managerId || 'P-003',
      createdAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      timeline: [
        {
          actor: `${currentPerson.fullName} (${ROLES[currentPerson.role]?.label || 'Nhân sự'})`,
          action: 'Khởi tạo & Gửi đề nghị (Submitted)',
          timestamp: new Date().toISOString(),
          comment: newRequestData.description || 'Gửi đề nghị lên hệ thống'
        }
      ]
    };
    setRequests(prev => [req, ...prev]);

    addNotification({
      title: 'Đã nộp đề xuất thành công',
      message: `Đề xuất ${req.requestCode || req.id} đã được gửi lên cấp quản lý xét duyệt.`,
      type: 'REQUEST',
      linkTab: 'operations'
    });

    return req;
  };

  const updateRequestAction = (requestId, action, comment = '') => {
    setRequests(prev => prev.map(r => {
      if (r.id !== requestId) return r;

      let nextStatus = r.status;
      let nextStep = r.currentWorkflowStep;
      let stampObj = r.digitalStamp || null;

      // Xử lý logic chuyển trạng thái theo action & loại đề nghị
      if (action === 'APPROVE') {
        // Sinh dấu ký điện tử nội bộ
        const stampId = `STAMP-GF2026-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        stampObj = {
          stampId,
          stampedBy: currentPerson.fullName,
          role: currentPerson.role,
          stampedAt: new Date().toISOString()
        };

        if (r.requestType === 'PAYMENT') {
          nextStatus = 'READY_FOR_PAYMENT';
          nextStep = 3;
        } else if (r.status === 'SUBMITTED' || r.status === 'MANAGER_REVIEW') {
          nextStatus = 'DIRECTOR_REVIEW';
          nextStep = 3;
        } else if (r.status === 'DIRECTOR_REVIEW') {
          nextStatus = (r.requestType === 'ADVANCE' || r.requestType === 'SETTLEMENT') ? 'ACCOUNTING_REVIEW' : 'COMPLETED';
          nextStep = 4;
        }

        addNotification({
          title: 'Đã ký duyệt đề xuất số',
          message: `Đề xuất ${r.requestCode || r.id} đã được ${currentPerson.fullName} phê duyệt với mã dấu [${stampId}].`,
          type: 'REQUEST',
          linkTab: 'operations'
        });
      } else if (action === 'REJECT') {
        nextStatus = 'REJECTED';
        addNotification({
          title: 'Đề xuất bị từ chối',
          message: `Đề xuất ${r.requestCode || r.id} đã bị từ chối phê duyệt. Lý do: ${comment || 'Chưa đạt yêu cầu'}`,
          type: 'REQUEST',
          linkTab: 'operations'
        });
      } else if (action === 'REQUEST_REVISION') {
        nextStatus = 'REVISION_REQUESTED';
      } else if (action === 'NEED_INFO') {
        nextStatus = 'NEED_MORE_INFORMATION';
      } else if (action === 'READY_PAYMENT') {
        nextStatus = 'READY_FOR_PAYMENT';
      } else if (action === 'MARK_PAID') {
        nextStatus = 'PAID';
        r.completedAt = new Date().toISOString();
      } else if (action === 'SETTLE_COMPLETE') {
        nextStatus = 'COMPLETED';
        r.completedAt = new Date().toISOString();
      } else if (action === 'CANCEL') {
        nextStatus = 'CANCELLED';
      }

      const timelineEvent = {
        actor: `${currentPerson.fullName} (${ROLES[currentPerson.role]?.label || 'Quản lý'})`,
        action: `Hành động: ${action} → ${nextStatus}`,
        timestamp: new Date().toISOString(),
        comment: comment || (stampObj ? `Đã xác nhận ký duyệt số (${stampObj.stampId})` : 'Đã xử lý trên hệ thống')
      };

      return {
        ...r,
        status: nextStatus,
        currentWorkflowStep: nextStep,
        digitalStamp: stampObj,
        updatedAt: new Date().toISOString(),
        timeline: [...(r.timeline || []), timelineEvent]
      };
    }));
  };

  const updateRequest = (requestId, updates) => {
    const target = requests.find(r => r.id === requestId);
    if (!target) return { success: false, reason: 'Không tìm thấy đề xuất.' };

    if (target.status === 'APPROVED' || target.status === 'COMPLETED') {
      return { success: false, reason: 'Đề xuất đã được duyệt hoặc hoàn tất, không thể chỉnh sửa nội dung!' };
    }

    setRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
      return r;
    }));

    addNotification({
      title: 'Cập nhật đề xuất',
      message: `Đã cập nhật nội dung đề xuất ${target.requestCode || target.id}.`,
      type: 'REQUEST',
      linkTab: 'operations'
    });
    return { success: true };
  };

  const deleteRequest = (requestId) => {
    const target = requests.find(r => r.id === requestId);
    if (!target) return { success: false, reason: 'Không tìm thấy đề xuất.' };

    if (target.status === 'APPROVED' || target.status === 'COMPLETED') {
      return { success: false, reason: 'Đề xuất đã được phê duyệt, không thể hủy hoặc xóa!' };
    }

    setRequests(prev => prev.filter(r => r.id !== requestId));
    if (selectedRequestId === requestId) {
      setSelectedRequestId(null);
    }

    addNotification({
      title: 'Hủy / Xóa đề xuất',
      message: `Đã hủy bỏ đề xuất ${target.requestCode || target.id}.`,
      type: 'REQUEST',
      linkTab: 'operations'
    });
    return { success: true };
  };

  // ==================== HỆ THỐNG SAO LƯU & PHỤC HỒI DỮ LIỆU DỰ PHÒNG ====================
  const exportSystemBackupJson = () => {
    const payload = {
      app: 'Genki Sales Portal',
      schemaVersion: '1.0.0',
      exportedAt: new Date().toISOString(),
      exportedBy: currentPerson?.fullName || 'Hệ thống',
      counts: {
        people: people.length,
        customers: customers.length,
        contracts: contracts.length,
        requests: requests.length,
        templates: contractTemplates.length,
        workflows: workflowTemplates.length,
        appLinks: appLinks.length,
        notifications: notifications.length
      },
      data: {
        people,
        customers,
        contracts,
        contractTemplates,
        requests,
        workflowTemplates,
        appLinks,
        notifications
      }
    };

    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      try {
        const jsonStr = JSON.stringify(payload, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const a = document.createElement('a');
        a.href = url;
        a.download = `genki_sales_portal_backup_${timestamp}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Lỗi xuất file sao lưu:', err);
      }
    }

    addNotification({
      title: 'Đã xuất file sao lưu dữ liệu toàn diện',
      message: `Đã tạo bản sao lưu an toàn: ${customers.length} khách hàng, ${contracts.length} hợp đồng, ${requests.length} đề xuất.`,
      type: 'SYSTEM',
      linkTab: 'admin'
    });

    return payload;
  };

  const importSystemBackupJson = (jsonStringOrObj, mode = 'MERGE') => {
    try {
      const parsed = typeof jsonStringOrObj === 'string' ? JSON.parse(jsonStringOrObj) : jsonStringOrObj;
      const incoming = parsed.data || parsed;

      if (!incoming || typeof incoming !== 'object') {
        throw new Error('Cấu trúc file sao lưu không hợp lệ.');
      }

      if (mode === 'MERGE') {
        let addedCustomers = 0;
        let addedContracts = 0;
        let addedRequests = 0;
        let addedPeople = 0;

        if (Array.isArray(incoming.customers)) {
          setCustomers(prev => {
            const existingIds = new Set(prev.map(c => c.id));
            const newItems = incoming.customers.filter(c => c && c.id && !existingIds.has(c.id));
            addedCustomers = newItems.length;
            return [...prev, ...newItems];
          });
        }

        if (Array.isArray(incoming.contracts)) {
          setContracts(prev => {
            const existingIds = new Set(prev.map(c => c.id));
            const newItems = incoming.contracts.filter(c => c && c.id && !existingIds.has(c.id));
            addedContracts = newItems.length;
            return [...prev, ...newItems];
          });
        }

        if (Array.isArray(incoming.requests)) {
          setRequests(prev => {
            const existingIds = new Set(prev.map(r => r.id));
            const newItems = incoming.requests.filter(r => r && r.id && !existingIds.has(r.id));
            addedRequests = newItems.length;
            return [...prev, ...newItems];
          });
        }

        if (Array.isArray(incoming.people)) {
          setPeople(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const existingEmails = new Set(prev.map(p => p.email && p.email.toLowerCase()).filter(Boolean));
            const newItems = incoming.people.filter(p => p && p.id && !existingIds.has(p.id) && (!p.email || !existingEmails.has(p.email.toLowerCase())));
            addedPeople = newItems.length;
            return [...prev, ...newItems];
          });
        }

        addNotification({
          title: 'Đã ghép nối dữ liệu sao lưu thành công',
          message: `Đã bổ sung an toàn: ${addedCustomers} khách hàng, ${addedContracts} hợp đồng, ${addedRequests} đề xuất mới (không ghi đè dữ liệu cũ).`,
          type: 'SYSTEM',
          linkTab: 'admin'
        });

        return {
          success: true,
          mode: 'MERGE',
          added: { addedCustomers, addedContracts, addedRequests, addedPeople }
        };
      } else {
        // OVERWRITE mode
        if (Array.isArray(incoming.customers)) setCustomers(incoming.customers);
        if (Array.isArray(incoming.contracts)) setContracts(incoming.contracts);
        if (Array.isArray(incoming.requests)) setRequests(incoming.requests);
        if (Array.isArray(incoming.people)) setPeople(incoming.people);
        if (Array.isArray(incoming.contractTemplates)) setContractTemplates(incoming.contractTemplates);
        if (Array.isArray(incoming.workflowTemplates)) setWorkflowTemplates(incoming.workflowTemplates);
        if (Array.isArray(incoming.appLinks)) setAppLinks(incoming.appLinks);

        addNotification({
          title: 'Đã phục hồi dữ liệu từ file sao lưu',
          message: 'Toàn bộ dữ liệu hệ thống đã được phục hồi theo file sao lưu.',
          type: 'SYSTEM',
          linkTab: 'admin'
        });

        return { success: true, mode: 'OVERWRITE' };
      }
    } catch (err) {
      console.error('Lỗi import dữ liệu sao lưu:', err);
      throw new Error(`Không thể nhập dữ liệu: ${err.message}`);
    }
  };

  const getDataIntegrityStats = () => {
    let storageBytes = 0;
    let savedKeysCount = 0;
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(STORAGE_KEY)) {
            savedKeysCount++;
            storageBytes += (localStorage.getItem(k) || '').length * 2;
          }
        }
      } catch {}
    }
    return {
      peopleCount: people.length,
      customersCount: customers.length,
      contractsCount: contracts.length,
      requestsCount: requests.length,
      templatesCount: contractTemplates.length,
      workflowsCount: workflowTemplates.length,
      appLinksCount: appLinks.length,
      notificationsCount: notifications.length,
      storageSizeKb: (storageBytes / 1024).toFixed(1),
      savedKeysCount,
      storageKey: STORAGE_KEY,
      isProtected: true
    };
  };

  // Cài đặt lại dữ liệu ban đầu với 2 lớp bảo vệ chống bấm nhầm
  const resetToFactoryDefault = () => {
    const confirmation = window.prompt(
      '⚠️ CẢNH BÁO AN TOÀN DỮ LIỆU:\n\n' +
      'Thao tác này sẽ xóa toàn bộ dữ liệu bạn đã nạp vào từ trước và đưa hệ thống về trạng thái mẫu ban đầu.\n' +
      'Dữ liệu hiện tại: ' + customers.length + ' khách hàng, ' + contracts.length + ' hợp đồng, ' + requests.length + ' đề xuất.\n\n' +
      'Nếu bạn thực sự chắc chắn muốn xóa, hãy gõ chính xác chữ "RESET" vào ô bên dưới:'
    );
    if (confirmation === 'RESET' || confirmation === 'reset') {
      try {
        const backupSnapshot = {
          resetAt: new Date().toISOString(),
          people, customers, contracts, requests
        };
        localStorage.setItem(`${STORAGE_KEY}_last_safety_snapshot`, JSON.stringify(backupSnapshot));
      } catch {}

      setPeople(INITIAL_PEOPLE);
      setCustomers(INITIAL_CUSTOMERS);
      setContracts(INITIAL_CONTRACTS);
      setContractTemplates(INITIAL_TEMPLATES);
      setRequests(INITIAL_REQUESTS);
      setWorkflowTemplates(INITIAL_WORKFLOW_TEMPLATES);
      setAppLinks(INITIAL_APP_LINKS);
      setNotifications(INITIAL_NOTIFICATIONS);
      setCurrentPersonId('P-001');
      alert('✓ Đã khôi phục dữ liệu mẫu ban đầu. Hệ thống đã lưu lại một bản snapshot an toàn dự phòng.');
    } else if (confirmation !== null) {
      alert('Đã hủy thao tác khôi phục. Dữ liệu của bạn được bảo toàn an toàn 100%.');
    }
  };

  const openQuickAction = (type = 'BUSINESS_TRIP') => {
    setQuickActionInitialType(type);
    setQuickActionModalOpen(true);
  };

  return (
    <AppContext.Provider value={{
      // Core Data
      people,
      currentPerson,
      currentPersonId,
      setCurrentPersonId,
      isAdmin,
      isStaff,

      // Raw Data
      customers,
      contracts,
      contractTemplates,
      setContractTemplates,
      requests,
      workflowTemplates,
      setWorkflowTemplates,
      appLinks,
      setAppLinks,

      // Scoped Data for Non-SaaS internal model
      scopedRequests,
      scopedContracts,
      scopedCustomers,

      // Notifications
      notifications,
      unreadNotificationCount,
      addNotification,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      clearNotifications,

      // Pinned Google Drive Folders
      pinnedFolders,
      pinDriveFolder,
      unpinDriveFolder,

      // UI state
      activeTab,
      setActiveTab,
      myTasks,
      totalMyTasksCount,
      pendingContracts,
      selectedRequestId,
      setSelectedRequestId,
      selectedContractId,
      setSelectedContractId,
      quickActionModalOpen,
      setQuickActionModalOpen,
      quickActionInitialType,
      openQuickAction,

      // Entity Actions (Full CRUD)
      addPerson,
      updatePerson,
      invitePerson,
      deletePerson,
      togglePersonStatus,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      addContract,
      updateContract,
      updateContractStatus,
      deleteContract,
      addRequest,
      updateRequest,
      deleteRequest,
      updateRequestAction,
      resetToFactoryDefault,

      // Data Safety, Backup & Integrity APIs
      exportSystemBackupJson,
      importSystemBackupJson,
      getDataIntegrityStats,
      generateSafeId
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

