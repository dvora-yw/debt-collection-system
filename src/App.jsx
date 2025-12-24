import React, { useState } from 'react';
import LoginScreen from './components/LoginScreen';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminAddClient } from './components/AdminAddClient';
import { ClientDashboard } from './components/ClientDashboard';
import { EndCustomerView } from './components/EndCustomerView';
import { PaymentScreen } from './components/PaymentScreen';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { EmailVerification } from './components/EmailVerification';

export default function App() {



  return (





    <BrowserRouter>

      <Routes>
        <Route path="/" element={<LoginScreen />} />
        <Route path="/email-verification" element={<EmailVerification />} />
        <Route path="/admin-add-client" element={<AdminAddClient />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/client-dashboard" element={<ClientDashboard />} />
        <Route path="/end-customer-view" element={<EndCustomerView />} />
        <Route path="/payment-screen" element={<PaymentScreen />} />

      </Routes>
    </BrowserRouter>
  );
}

