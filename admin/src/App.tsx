import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import TournamentsPage from './pages/TournamentsPage';
import UsersPage from './pages/UsersPage';
import LoyaltyPage from './pages/LoyaltyPage';
import DashboardPage from './pages/DashboardPage';
import AdminsPage from './pages/AdminsPage';
import PaymentsPage from './pages/PaymentsPage';
import ClubsPage from './pages/ClubsPage';
import { authService } from './services/auth';
import { UserProvider, useUser } from './context/UserContext';
import Header from './components/Header';
import './App.css';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useUser();
  
  if (loading) return <div className="p-4 md:p-6 bg-green-50">Загрузка...</div>;
  
  return (
    <div className="flex flex-col min-h-screen bg-green-50">
      <Header isAdmin={user?.isAdmin} />
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route path="/users" element={
            <ProtectedRoute>
              <Layout>
                <UsersPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/tournaments" element={
            <ProtectedRoute>
              <Layout>
                <TournamentsPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/payments" element={
            <ProtectedRoute>
              <Layout>
                <PaymentsPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/loyalty" element={
            <ProtectedRoute>
              <Layout>
                <LoyaltyPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/clubs" element={
            <ProtectedRoute>
              <Layout>
                <ClubsPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/admins" element={
            <ProtectedRoute>
              <Layout>
                <AdminsPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
