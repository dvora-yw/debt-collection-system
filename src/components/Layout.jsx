import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, Settings, LogOut, Menu, X, Bell, DollarSign, UserPlus } from 'lucide-react';
import { useAuth } from './AuthContext';

export function Layout({ children, title = '' }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'דשבורד', route: '/admin-dashboard' },
    { icon: Users, label: 'לקוחות', route: '/clients' },
    { icon: CreditCard, label: 'תשלומים', route: '/payments' },
    { icon: Settings, label: 'הגדרות', route: '/settings-screen' },
  ];

  return (
    <div className="min-h-screen bg-muted/40" dir="rtl">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full bg-sidebar text-sidebar-foreground w-64 transition-transform duration-300 z-50 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0`}
      >
        <div className="p-6 ">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2>PaymentPro</h2>
                <p className="text-xs text-sidebar-foreground/60">מערכת גבייה</p>
              </div>
            </div>
            <button
              className="lg:hidden text-sidebar-foreground"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item, index) => {
              const isActive = location.pathname === item.route;
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={() => item.route && navigate(item.route)}
                  className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent'}`}
                >
                  {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-l bg-sidebar-ring" />}
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 w-full p-6 border-t border-sidebar-border">
          <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-3 px-4 py-3 text-sidebar-foreground hover:bg-sidebar-accent rounded-xl transition-colors">
            <LogOut className="w-5 h-5" />
            <span>התנתק</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:mr-64">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-30">
          <div className="px-4 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  className="lg:hidden text-foreground"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-2xl">{title || 'לוח בקרה'}</h1>
                  <p className="text-sm text-muted-foreground">סקירה כללית של המערכת</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="relative p-2 text-foreground hover:bg-muted rounded-xl transition-colors">
                  <Bell className="w-6 h-6" />
                  <span className="absolute top-1 left-1 w-2 h-2 bg-destructive rounded-full" />
                </button>
                <div className="flex items-center gap-3 px-4 py-2 bg-muted rounded-xl">
                  <div className="text-right">
                    <p className="text-sm">{user?.userName ?? ''}</p>
                    <p className="text-xs text-muted-foreground">{user?.email ?? ''}</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white">
                    א
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
