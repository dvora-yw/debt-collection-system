import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log the error to the console (or send to a monitoring service)
    console.error('Uncaught error in component tree:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6" dir="rtl">
          <div className="max-w-xl w-full bg-card rounded-xl shadow p-6 text-center">
            <h2 className="text-lg font-semibold mb-4">אירעה שגיאה בלתי צפויה</h2>
            <p className="text-sm text-muted-foreground mb-4">ניסינו לשחזר את האפליקציה — טעינה מחדש תפתור ברוב המקרים.</p>
            <pre className="text-xs text-muted-foreground mb-4 overflow-auto">{String(this.state.error)}</pre>
            <div className="flex gap-3 justify-center">
              <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-white rounded">טען שוב</button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
