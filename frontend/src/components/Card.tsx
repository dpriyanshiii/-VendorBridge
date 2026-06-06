import React from 'react';
import { cn } from '../utils/helpers';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => (
  <div className={cn('card', className)} {...props}>{children}</div>
);

export const CardHeader: React.FC<CardProps> = ({ children, className, ...props }) => (
  <div className={cn('card-header', className)} {...props}>{children}</div>
);

export const CardBody: React.FC<CardProps> = ({ children, className, ...props }) => (
  <div className={cn('card-body', className)} {...props}>{children}</div>
);

export const CardFooter: React.FC<CardProps> = ({ children, className, ...props }) => (
  <div className={cn('card-footer', className)} {...props}>{children}</div>
);
