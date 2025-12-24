import React from 'react';

export function Card({
  children,
  className = '',
  padding = 'md',
  hover = false,
}) {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`bg-card rounded-xl shadow-sm border border-border ${
        hover ? 'hover:shadow-md transition-shadow duration-200' : ''
      } ${paddingStyles[padding]} ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }) {
  return <h3 className={`text-card-foreground ${className}`}>{children}</h3>;
}


export function CardContent({ children, className = '' }) {
  return <div className={className}>{children}</div>;
}
