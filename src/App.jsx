import React, { useState } from 'react';
import LoginScreen from './components/LoginScreen';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminAddClient } from './components/AdminAddClient';
import { ClientDashboard } from './components/ClientDashboard';
import { EndCustomerView } from './components/EndCustomerView';
import { PaymentScreen } from './components/PaymentScreen';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { EmailVerification } from './components/EmailVerification';
import { Layout } from './components/Layout';
import ForgotPassword from './components/ForgotPassword';
// import Register from './components/Register';
import { SettingsScreen } from './components/SettingsScreen';
import { ClientsTable } from './components/ClientsTable';
import { PaymentsTable } from './components/PaymentsTable';
import { MessagesTable } from './components/MessagesTable';
import { CompanyView } from './components/CompanyView';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {

console.log("ENV:", process.env.REACT_APP_ENV);
console.log("API:", process.env.REACT_APP_API_URL);


  return (





    <BrowserRouter>
      <ErrorBoundary>
      <Routes>
        <Route path="/" element={<LoginScreen />} />
        <Route path="/email-verification" element={<EmailVerification />} />
        {/* Admin area — show sidebar */}
        <Route path="/admin-add-client" element={<Layout title="הוספת לקוח"><AdminAddClient /></Layout>} />
        <Route path="/admin-dashboard" element={<Layout title="דשבורד ראשי"><AdminDashboard /></Layout>} />
        <Route path="/clients" element={<Layout title="רשימת לקוחות"><ClientsTable /></Layout>} />
        <Route path="/payments" element={<Layout title="תשלומים"><PaymentsTable /></Layout>} />
        <Route path="/messages" element={<Layout title="הודעות"><MessagesTable /></Layout>} />
        <Route path="/settings-screen" element={<Layout title="הגדרות"><SettingsScreen /></Layout>} />

        {/* Public / customer pages — no admin sidebar */}
        <Route path="/companies/:id" element={<CompanyView />} />
        <Route path="/client-dashboard" element={<ClientDashboard />} />
        <Route path="/end-customer-view" element={<EndCustomerView />} />
        <Route path="/payment-screen" element={<PaymentScreen />} />

      </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

