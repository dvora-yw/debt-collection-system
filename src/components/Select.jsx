import React from 'react';



export function Select({
  label,
  options,
  error,
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
      <select
        className={`w-full px-4 py-2.5 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none ${
          error ? 'border-destructive' : ''
        } ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
