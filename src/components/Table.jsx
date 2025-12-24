import React from 'react';



export function Table({ children, className = '' }) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border">
      <table className={`w-full ${className}`}>{children}</table>
    </div>
  );
}


export function TableHeader({ children, className = '' }) {
  return (
    <thead className={`bg-muted/50 ${className}`}>
      {children}
    </thead>
  );
}



export function TableBody({ children, className = '' }) {
  return <tbody className={className}>{children}</tbody>;
}


export function TableRow({ children, className = '', onClick }) {
  return (
    <tr
      className={`border-b border-border last:border-0 ${
        onClick ? 'cursor-pointer hover:bg-muted/30 transition-colors' : ''
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}


export function TableHead({ children, className = '' }) {
  return (
    <th className={`px-6 py-3 text-right ${className}`}>
      {children}
    </th>
  );
}



export function TableCell({ children, className = '' }) {
  return (
    <td className={`px-6 py-4 text-right ${className}`}>
      {children}
    </td>
  );
}
