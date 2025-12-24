import React from 'react';



export function Input({
  label,
  error,
  icon,
  className = '',
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block mb-2 text-foreground">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        <input
          className={`w-full px-4 py-2.5 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
            icon ? 'pr-10' : ''
          } ${error ? 'border-destructive' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
