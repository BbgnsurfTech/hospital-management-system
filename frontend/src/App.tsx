import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { PatientList } from './pages/Patients/PatientList';
import { RegisterPatient } from './pages/Patients/RegisterPatient';
import { ConsultationList } from './pages/Doctor/ConsultationList';
import { LabTestList } from './pages/Laboratory/LabTestList';
import { PrescriptionQueue } from './pages/Pharmacy/PrescriptionQueue';
import { BillingList } from './pages/Billing/BillingList';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './components/Layout/MainLayout';
import { useAuthStore } from './store/authStore';
import { UserRole } from './types';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const { loadUser, isAuthenticated } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/patients"
            element={
              <ProtectedRoute
                allowedRoles={[
                  UserRole.RECEPTIONIST,
                  UserRole.DOCTOR,
                  UserRole.NURSE,
                  UserRole.ADMIN,
                ]}
              >
                <MainLayout>
                  <PatientList />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/patients/register"
            element={
              <ProtectedRoute
                allowedRoles={[UserRole.RECEPTIONIST, UserRole.ADMIN]}
              >
                <MainLayout>
                  <RegisterPatient />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/consultations"
            element={
              <ProtectedRoute allowedRoles={[UserRole.DOCTOR, UserRole.ADMIN]}>
                <MainLayout>
                  <ConsultationList />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/laboratory"
            element={
              <ProtectedRoute
                allowedRoles={[
                  UserRole.LAB_TECHNICIAN,
                  UserRole.DOCTOR,
                  UserRole.ADMIN,
                ]}
              >
                <MainLayout>
                  <LabTestList />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/pharmacy"
            element={
              <ProtectedRoute
                allowedRoles={[UserRole.PHARMACIST, UserRole.ADMIN]}
              >
                <MainLayout>
                  <PrescriptionQueue />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/billing"
            element={
              <ProtectedRoute allowedRoles={[UserRole.BILLING, UserRole.ADMIN]}>
                <MainLayout>
                  <BillingList />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
