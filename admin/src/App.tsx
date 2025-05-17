import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import TournamentsPage from './pages/TournamentsPage';
import DashboardPage from './pages/DashboardPage';
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
                <div className="p-4 md:p-6">
                  <h1 className="text-xl md:text-2xl font-bold text-black">Пользователи</h1>
                  <p className="text-gray-700">Управление пользователями системы</p>
                </div>
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
          <Route path="/admins" element={
            <ProtectedRoute>
              <Layout>
                <div className="p-4 md:p-6">
                  <h1 className="text-xl md:text-2xl font-bold text-black">Администраторы</h1>
                  <p className="text-gray-700">Управление администраторами</p>
                </div>
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
