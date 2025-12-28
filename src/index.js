import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from '../src/components/AuthContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Global error listeners to surface uncaught exceptions and avoid silent crashes
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error || event.message, event);
});
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled rejection:', event.reason);
});

root.render(
  <React.StrictMode>
     <AuthProvider>
    <App />
  </AuthProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
