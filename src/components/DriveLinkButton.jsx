import React from 'react';
import { IconDrive, IconExternal } from './Icons.jsx';

export default function DriveLinkButton({ url, label = 'Mở Google Drive' }) {
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="btn btn-secondary btn-sm"
      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
      title={url}
    >
      <IconDrive size={15} />
      <span>{label}</span>
      <IconExternal size={12} />
    </a>
  );
}
