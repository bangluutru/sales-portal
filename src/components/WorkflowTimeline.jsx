import React from 'react';
import { formatDateTime } from '../utils/helpers.js';

export default function WorkflowTimeline({ request, workflowTemplate }) {
  if (!request) return null;

  const steps = workflowTemplate?.steps || [
    { stepNumber: 1, name: 'Khởi tạo', role: 'REQUESTER' },
    { stepNumber: 2, name: 'Quản lý duyệt', role: 'MANAGER' },
    { stepNumber: 3, name: 'Ban Giám Đốc', role: 'DIRECTOR' },
    { stepNumber: 4, name: 'Kế toán xử lý', role: 'ACCOUNTING' }
  ];

  const currentStep = request.currentWorkflowStep || 1;
  const isCompleted = request.status === 'COMPLETED' || request.status === 'PAID';
  const isRejected = request.status === 'REJECTED' || request.status === 'CANCELLED';

  return (
    <div style={{ marginTop: '16px' }}>
      <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', color: 'var(--gf-ink)' }}>
        Tiến Trình Phê Duyệt (Workflow Tracker)
      </h4>

      {/* Visual Stepper */}
      <div className="workflow-stepper">
        {steps.map((s, idx) => {
          const stepNum = s.stepNumber || idx + 1;
          const isDone = isCompleted || stepNum < currentStep;
          const isActive = !isCompleted && !isRejected && stepNum === currentStep;

          return (
            <div
              key={stepNum}
              className={`step-item ${isDone ? 'completed' : ''} ${isActive ? 'active' : ''}`}
            >
              <div className="step-circle">
                {isDone ? '✓' : stepNum}
              </div>
              <div className="step-label">{s.name}</div>
              <small style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.role}</small>
            </div>
          );
        })}
      </div>

      {/* Activity Timeline */}
      <h4 style={{ fontSize: '15px', fontWeight: 600, marginTop: '24px', marginBottom: '16px', color: 'var(--gf-ink)' }}>
        Nhật Ký Tác Nghiệp (Activity Timeline)
      </h4>
      <div className="timeline">
        {(request.timeline || []).map((ev, idx) => (
          <div key={idx} className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <div className="timeline-meta">
                <span className="timeline-actor">{ev.actor}</span>
                <span className="timeline-time">{formatDateTime(ev.timestamp)}</span>
              </div>
              <div className="timeline-action">{ev.action}</div>
              {ev.comment && (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', fontStyle: 'italic' }}>
                  "{ev.comment}"
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
