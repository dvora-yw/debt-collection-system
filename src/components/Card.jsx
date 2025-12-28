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
      className={`bg-card rounded-xl shadow transition-shadow duration-200 border border-border ${
        hover ? 'hover:shadow-lg' : ''
      } ${paddingStyles[padding]} ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return <div className={`mb-4 flex items-center justify-between ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }) {
  return <h3 className={`text-card-foreground text-base font-semibold ${className}`}>{children}</h3>;
}


export function CardContent({ children, className = '' }) {
  return <div className={`${className}`}>{children}</div>;
}
