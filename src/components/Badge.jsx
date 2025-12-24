import React from 'react';


export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) {
  const variantStyles = {
    default: 'bg-muted text-muted-foreground',
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    success: 'bg-[#10b981]/10 text-[#10b981]',
    warning: 'bg-[#f59e0b]/10 text-[#f59e0b]',
    danger: 'bg-destructive/10 text-destructive',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
}
