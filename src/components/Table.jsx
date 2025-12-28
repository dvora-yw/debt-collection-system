import React from 'react';



export function Table({ children, className = '' }) {
  // Default container matches Figma: white card, subtle shadow, rounded corners
  return (
    <div className="w-full overflow-x-auto rounded-2xl bg-card border border-border shadow-sm">
      <table className={`w-full ${className}`}>{children}</table>
    </div>
  );
}


export function TableHeader({ children, className = '' }) {
  // Figma header: light muted background and slightly bolder text for headings
  return (
    <thead className={`bg-muted/20 backdrop-blur-sm ${className}`}>
      {children}
    </thead>
  );
}



export function TableBody({ children, className = '' }) {
  return <tbody className={className}>{children}</tbody>;
}


export function TableRow({ children, className = '', onClick }) {
  // Figma-like rows: lighter separators, rounded feel via spacing, hover
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
    <th className={`px-6 py-4 text-right text-sm text-muted-foreground font-medium ${className}`}>
      {children}
    </th>
  );
}



export function TableCell({ children, className = '' }) {
  return (
    <td className={`px-6 py-5 text-right align-middle ${className}`}>
      {children}
    </td>
  );
}
