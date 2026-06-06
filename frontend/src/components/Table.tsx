import React from 'react';
import { Loader2 } from 'lucide-react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
  width?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  onRowClick?: (row: T) => void;
}

export function Table<T extends { _id?: string; id?: string }>({
  columns,
  data,
  isLoading,
  emptyMessage = 'No records found',
  emptyDescription,
  onRowClick,
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div style={{ padding: '3rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', color: 'var(--text-tertiary)' }}>
        <Loader2 size={24} style={{ animation: 'spin 0.8s linear infinite' }} />
        <span style={{ fontSize: 'var(--font-size-sm)' }}>Loading data…</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <div className="empty-state-title">{emptyMessage}</div>
        {emptyDescription && <div className="empty-state-desc">{emptyDescription}</div>}
      </div>
    );
  }

  return (
    <table>
      <thead>
        <tr>
          {columns.map((col, idx) => (
            <th key={idx} style={{ width: col.width }} className={col.className}>
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr
            key={row._id || row.id || idx}
            onClick={() => onRowClick?.(row)}
            style={{ cursor: onRowClick ? 'pointer' : 'default' }}
          >
            {columns.map((col, colIdx) => (
              <td key={colIdx} className={col.className}>
                {typeof col.accessor === 'function'
                  ? col.accessor(row)
                  : (row[col.accessor] as unknown as React.ReactNode)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
