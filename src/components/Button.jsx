import React from 'react';

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-primary text-primary-foreground hover:opacity-90 shadow-sm',
    secondary: 'bg-secondary text-secondary-foreground hover:opacity-90 shadow-sm',
    outline: 'border-2 border-primary text-primary bg-transparent hover:bg-primary/10',
    ghost: 'text-foreground hover:bg-muted',
    danger: 'bg-destructive text-destructive-foreground hover:opacity-90 shadow-sm',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
