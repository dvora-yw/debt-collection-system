import React from 'react';
import { X } from 'lucide-react';

/**
 * Modal dialog component
 */
export function Modal({ isOpen, onClose, title, children, size = 'lg' }) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-2xl',
    lg: 'max-w-5xl',
    xl: 'max-w-6xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className={`relative bg-gradient-to-br from-card to-card/95 rounded-3xl shadow-2xl max-h-[95vh] overflow-y-auto border border-border/50 ${sizeClasses[size]}`} dir="rtl">
        {/* Header */}
        {title && (
          <div className="sticky top-0 bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border/50 px-8 py-6 flex items-center justify-between z-10">
            <h2 className="text-2xl font-bold text-foreground">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-xl transition-colors text-foreground hover:text-foreground/80"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
