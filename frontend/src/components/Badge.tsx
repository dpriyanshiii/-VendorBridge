import React from 'react';
import { cn } from '../utils/helpers';

type BadgeVariant = 'neutral' | 'primary' | 'success' | 'danger' | 'warning' | 'info';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'neutral', children, className, dot }) => {
  const variantClass = {
    neutral: 'badge-neutral',
    primary: 'badge-primary',
    success: 'badge-success',
    danger: 'badge-danger',
    warning: 'badge-warning',
    info: 'badge-info',
  }[variant];

  return (
    <span className={cn('badge', variantClass, dot && 'badge-dot', className)}>
      {children}
    </span>
  );
};
