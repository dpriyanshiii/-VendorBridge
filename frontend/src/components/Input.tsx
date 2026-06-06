import React from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '../utils/helpers';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  required,
  className,
  leftIcon,
  id,
  ...props
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className={cn('form-label', required && 'required')}>
          {label}
        </label>
      )}
      {leftIcon ? (
        <div className="input-with-icon">
          <span className="input-icon">{leftIcon}</span>
          <input
            id={inputId}
            className={cn('form-input', error && 'border-danger', className)}
            {...props}
          />
        </div>
      ) : (
        <input
          id={inputId}
          className={cn('form-input', error && 'border-danger', className)}
          {...props}
        />
      )}
      {error && <span className="form-error">{error}</span>}
      {hint && !error && <span className="form-hint">{hint}</span>}
    </div>
  );
};
