import React, { createContext, useContext, useState, useEffect } from 'react';
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

const AppContext = createContext();

const STORAGE_KEY = 'genki_sales_portal_v1';

export function AppProvider({ children }) {
  // 1. Tải trạng thái từ LocalStorage hoặc dùng dữ liệu khởi tạo chuẩn
  const [people, setPeople] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_people`);
    return saved ? JSON.parse(saved) : INITIAL_PEOPLE;
  });

  const [currentPersonId, setCurrentPersonId] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_current_user`);
    return saved || 'P-001'; // Mặc định là Nguyễn Văn An (CTV) để thử nghiệm action-first
  });

  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_customers`);
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [contracts, setContracts] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_contracts`);
    return saved ? JSON.parse(saved) : INITIAL_CONTRACTS;
  });

  const [contractTemplates, setContractTemplates] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_templates`);
    return saved ? JSON.parse(saved) : INITIAL_TEMPLATES;
  });

  const [requests, setRequests] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_requests`);
    return saved ? JSON.parse(saved) : INITIAL_REQUESTS;
  });

  const [workflowTemplates, setWorkflowTemplates] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_workflows`);
    return saved ? JSON.parse(saved) : INITIAL_WORKFLOW_TEMPLATES;
  });

  const [appLinks, setAppLinks] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_app_links`);
    return saved ? JSON.parse(saved) : INITIAL_APP_LINKS;
  });

  // UI state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [quickActionModalOpen, setQuickActionModalOpen] = useState(false);
  const [quickActionInitialType, setQuickActionInitialType] = useState('BUSINESS_TRIP');
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [selectedContractId, setSelectedContractId] = useState(null);

  // Lưu trữ đồng bộ vào LocalStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_people`, JSON.stringify(people));
    localStorage.setItem(`${STORAGE_KEY}_customers`, JSON.stringify(customers));
    localStorage.setItem(`${STORAGE_KEY}_contracts`, JSON.stringify(contracts));
    localStorage.setItem(`${STORAGE_KEY}_templates`, JSON.stringify(contractTemplates));
    localStorage.setItem(`${STORAGE_KEY}_requests`, JSON.stringify(requests));
    localStorage.setItem(`${STORAGE_KEY}_workflows`, JSON.stringify(workflowTemplates));
    localStorage.setItem(`${STORAGE_KEY}_app_links`, JSON.stringify(appLinks));
    localStorage.setItem(`${STORAGE_KEY}_current_user`, currentPersonId);
  }, [people, customers, contracts, contractTemplates, requests, workflowTemplates, appLinks, currentPersonId]);

  // Người dùng hiện tại
  const currentPerson = people.find(p => p.id === currentPersonId) || people[0];

  // Tính toán số lượng việc trong "My Tasks"
  const myTasks = requests.filter(req => {
    const role = currentPerson.role;
    // Cho Manager: Các đề nghị đang ở bước Manager duyệt
    if (role === 'MANAGER') {
      return req.status === 'SUBMITTED' || req.status === 'MANAGER_REVIEW';
    }
    // Cho Director: Các đề nghị đang chờ Giám Đốc duyệt
    if (role === 'DIRECTOR') {
      return req.status === 'DIRECTOR_REVIEW';
    }
    // Cho Kế toán: Các đề nghị tài chính đang cần duyệt chi / kiểm tra / thanh toán
    if (role === 'ACCOUNTING') {
      return req.status === 'ACCOUNTING_REVIEW' || req.status === 'READY_FOR_PAYMENT';
    }
    // Cho Staff / CTV: Các đề nghị của chính mình bị yêu cầu sửa hoặc cần thêm thông tin
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

  // Thao tác với Người dùng / Person
  const addPerson = (newPerson) => {
    const id = `P-${String(people.length + 1).padStart(3, '0')}`;
    const person = { ...newPerson, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    setPeople(prev => [person, ...prev]);
    return person;
  };

  const updatePerson = (id, updates) => {
    setPeople(prev => prev.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p));
  };

  // Thao tác với Khách hàng / Customer
  const addCustomer = (newCust) => {
    const id = `CUST-${String(customers.length + 1).padStart(3, '0')}`;
    const cust = {
      ...newCust,
      id,
      createdBy: currentPerson.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setCustomers(prev => [cust, ...prev]);
    return cust;
  };

  const updateCustomer = (id, updates) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c));
  };

  // Thao tác với Hợp đồng / Contract
  const addContract = (newContract) => {
    const id = `CTR-2026-${String(contracts.length + 1).padStart(4, '0')}`;
    const contract = {
      ...newContract,
      id,
      contractCode: id,
      createdBy: currentPerson.id,
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setContracts(prev => [contract, ...prev]);
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

  // Thao tác với Đề nghị / Request
  const addRequest = (newRequestData) => {
    const req = {
      ...newRequestData,
      requesterId: currentPerson.id,
      managerId: currentPerson.managerId || 'P-003',
      createdAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      timeline: [
        {
          actor: `${currentPerson.fullName} (${ROLES[currentPerson.role]?.label})`,
          action: 'Khởi tạo & Gửi đề nghị (Submitted)',
          timestamp: new Date().toISOString(),
          comment: newRequestData.description || 'Gửi đề nghị lên hệ thống'
        }
      ]
    };
    setRequests(prev => [req, ...prev]);
    return req;
  };

  const updateRequestAction = (requestId, action, comment = '') => {
    setRequests(prev => prev.map(r => {
      if (r.id !== requestId) return r;

      let nextStatus = r.status;
      let nextStep = r.currentWorkflowStep;

      // Xử lý logic chuyển trạng thái theo action & loại đề nghị
      if (action === 'APPROVE') {
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
      } else if (action === 'REJECT') {
        nextStatus = 'REJECTED';
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
        actor: `${currentPerson.fullName} (${ROLES[currentPerson.role]?.label})`,
        action: `Hành động: ${action} → ${nextStatus}`,
        timestamp: new Date().toISOString(),
        comment: comment || 'Đã xử lý trên hệ thống'
      };

      return {
        ...r,
        status: nextStatus,
        currentWorkflowStep: nextStep,
        updatedAt: new Date().toISOString(),
        timeline: [...(r.timeline || []), timelineEvent]
      };
    }));
  };

  // Cài đặt lại dữ liệu ban đầu
  const resetToFactoryDefault = () => {
    if (window.confirm('Khôi phục toàn bộ dữ liệu về trạng thái mẫu ban đầu?')) {
      setPeople(INITIAL_PEOPLE);
      setCustomers(INITIAL_CUSTOMERS);
      setContracts(INITIAL_CONTRACTS);
      setContractTemplates(INITIAL_TEMPLATES);
      setRequests(INITIAL_REQUESTS);
      setWorkflowTemplates(INITIAL_WORKFLOW_TEMPLATES);
      setAppLinks(INITIAL_APP_LINKS);
      setCurrentPersonId('P-001');
      alert('Đã khôi phục dữ liệu mẫu thành công!');
    }
  };

  const openQuickAction = (type = 'BUSINESS_TRIP') => {
    setQuickActionInitialType(type);
    setQuickActionModalOpen(true);
  };

  return (
    <AppContext.Provider value={{
      people,
      currentPerson,
      setCurrentPersonId,
      customers,
      contracts,
      contractTemplates,
      setContractTemplates,
      requests,
      workflowTemplates,
      setWorkflowTemplates,
      appLinks,
      setAppLinks,
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
      addPerson,
      updatePerson,
      addCustomer,
      updateCustomer,
      addContract,
      updateContract,
      updateContractStatus,
      addRequest,
      updateRequestAction,
      resetToFactoryDefault
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
