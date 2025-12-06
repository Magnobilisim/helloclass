

import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider, useStore } from './context/StoreContext';
import { Layout } from './components/Layout';
import { UserRole } from './types';
import { AlertTriangle, Hammer } from 'lucide-react';

const Auth = lazy(() => import('./pages/Auth').then(m => ({ default: m.Auth })));
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard').then(m => ({ default: m.StudentDashboard })));
const StudentExams = lazy(() => import('./pages/student/StudentExams').then(m => ({ default: m.StudentExams })));
const StudentShop = lazy(() => import('./pages/student/StudentShop').then(m => ({ default: m.StudentShop })));
const StudentResults = lazy(() => import('./pages/student/StudentResults').then(m => ({ default: m.StudentResults })));
const ExamRoom = lazy(() => import('./pages/student/ExamRoom').then(m => ({ default: m.ExamRoom })));
const SocialFeed = lazy(() => import('./pages/student/SocialFeed').then(m => ({ default: m.SocialFeed })));
const UserProfile = lazy(() => import('./pages/student/UserProfile').then(m => ({ default: m.UserProfile })));
const Notifications = lazy(() => import('./pages/student/Notifications').then(m => ({ default: m.Notifications })));
const StudentPrizeExams = lazy(() => import('./pages/student/StudentPrizeExams').then(m => ({ default: m.StudentPrizeExams })));
const Chat = lazy(() => import('./pages/Chat').then(m => ({ default: m.Chat })));
const TeacherDashboard = lazy(() => import('./pages/teacher/TeacherDashboard').then(m => ({ default: m.TeacherDashboard })));
const CreateExam = lazy(() => import('./pages/teacher/CreateExam').then(m => ({ default: m.CreateExam })));
const TeacherProfile = lazy(() => import('./pages/teacher/TeacherProfile').then(m => ({ default: m.TeacherProfile })));
const TeacherShop = lazy(() => import('./pages/teacher/TeacherShop').then(m => ({ default: m.TeacherShop })));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings').then(m => ({ default: m.AdminSettings })));
const AdminProfile = lazy(() => import('./pages/admin/AdminProfile').then(m => ({ default: m.AdminProfile })));

const MaintenanceScreen = () => (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 text-center p-8">
        <div className="bg-white p-12 rounded-3xl shadow-xl max-w-lg">
            <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Hammer size={48} className="text-yellow-600" />
            </div>
            <h1 className="text-3xl font-black text-gray-800 mb-4">System Under Maintenance</h1>
            <p className="text-gray-600 mb-8 text-lg">We are currently upgrading the platform to serve you better. Please check back later.</p>
            <div className="inline-block bg-yellow-50 text-yellow-700 px-4 py-2 rounded-lg text-sm font-bold border border-yellow-100">
                <AlertTriangle size={16} className="inline mr-2" /> Maintenance Mode Active
            </div>
        </div>
    </div>
);

const PageLoader = () => (
  <div className="flex h-48 items-center justify-center text-brand-600 font-bold">
    Loading...
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode; roles: UserRole[] }> = ({ children, roles }) => {
  const { user, systemSettings } = useStore();
  
  if (systemSettings.maintenanceMode && user?.role !== UserRole.ADMIN) {
      return <MaintenanceScreen />;
  }

  if (!user) return <Navigate to="/auth" />;
  if (!roles.includes(user.role)) return <Navigate to="/" />;
  return <>{children}</>;
};

const MainRouter = () => {
  const { user, systemSettings } = useStore();

  // If maintenance is on and no user is logged in (or user is not admin trying to login), show maintenance
  // However, we need to allow access to /auth to let admins login.
  // The login function in StoreContext already prevents non-admins from logging in during maintenance.

  return (
    <HashRouter>
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/" />} />
            
            {/* Root Redirect based on Role */}
            <Route path="/" element={
              !user ? <Navigate to="/auth" /> : 
              user.role === UserRole.STUDENT ? <Navigate to="/student" /> :
              user.role === UserRole.TEACHER ? <Navigate to="/teacher" /> :
              <Navigate to="/admin" />
            } />

            {/* Student Routes */}
            <Route path="/student" element={
              <ProtectedRoute roles={[UserRole.STUDENT]}>
                 <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/student/exams" element={
              <ProtectedRoute roles={[UserRole.STUDENT]}>
                 <StudentExams />
              </ProtectedRoute>
            } />
            <Route path="/student/results" element={
              <ProtectedRoute roles={[UserRole.STUDENT]}>
                 <StudentResults />
              </ProtectedRoute>
            } />
            <Route path="/student/exam/:id" element={
              <ProtectedRoute roles={[UserRole.STUDENT]}>
                 <ExamRoom />
              </ProtectedRoute>
            } />
            <Route path="/student/social" element={
              <ProtectedRoute roles={[UserRole.STUDENT]}>
                 <SocialFeed />
              </ProtectedRoute>
            } />
            <Route path="/student/shop" element={
              <ProtectedRoute roles={[UserRole.STUDENT]}>
                 <StudentShop />
              </ProtectedRoute>
            } />
            <Route path="/student/profile" element={
              <ProtectedRoute roles={[UserRole.STUDENT]}>
                 <UserProfile />
              </ProtectedRoute>
            } />
            <Route path="/student/profile/:id" element={
              <ProtectedRoute roles={[UserRole.STUDENT]}>
                 <UserProfile />
              </ProtectedRoute>
            } />
            <Route path="/student/notifications" element={
              <ProtectedRoute roles={[UserRole.STUDENT]}>
                 <Notifications />
              </ProtectedRoute>
            } />
            <Route path="/student/prize-exams" element={
              <ProtectedRoute roles={[UserRole.STUDENT]}>
                 <StudentPrizeExams />
              </ProtectedRoute>
            } />

            {/* Teacher Routes */}
            <Route path="/teacher" element={
              <ProtectedRoute roles={[UserRole.TEACHER]}>
                 <TeacherDashboard />
              </ProtectedRoute>
            } />
            <Route path="/teacher/create" element={
              <ProtectedRoute roles={[UserRole.TEACHER]}>
                 <CreateExam />
              </ProtectedRoute>
            } />
            <Route path="/teacher/edit/:id" element={
              <ProtectedRoute roles={[UserRole.TEACHER]}>
                 <CreateExam />
              </ProtectedRoute>
            } />
            <Route path="/teacher/social" element={
              <ProtectedRoute roles={[UserRole.TEACHER]}>
                 <SocialFeed />
              </ProtectedRoute>
            } />
            <Route path="/teacher/profile" element={
              <ProtectedRoute roles={[UserRole.TEACHER]}>
                 <TeacherProfile />
              </ProtectedRoute>
            } />
            <Route path="/teacher/exams" element={
              <ProtectedRoute roles={[UserRole.TEACHER]}>
                 <StudentExams />
              </ProtectedRoute>
            } />
            <Route path="/teacher/exam/:id" element={
              <ProtectedRoute roles={[UserRole.TEACHER]}>
                 <ExamRoom />
              </ProtectedRoute>
            } />
            <Route path="/teacher/shop" element={
              <ProtectedRoute roles={[UserRole.TEACHER]}>
                 <TeacherShop />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute roles={[UserRole.ADMIN]}>
                 <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute roles={[UserRole.ADMIN]}>
                 <AdminDashboard /> 
              </ProtectedRoute>
            } />
            <Route path="/admin/reports" element={
              <ProtectedRoute roles={[UserRole.ADMIN]}>
                 <AdminDashboard /> 
              </ProtectedRoute>
            } />
            <Route path="/admin/exams" element={
              <ProtectedRoute roles={[UserRole.ADMIN]}>
                 <AdminDashboard /> 
              </ProtectedRoute>
            } />
            <Route path="/admin/exam/create" element={
              <ProtectedRoute roles={[UserRole.ADMIN]}>
                 <CreateExam /> 
              </ProtectedRoute>
            } />
            <Route path="/admin/exam/edit/:id" element={
              <ProtectedRoute roles={[UserRole.ADMIN]}>
                 <CreateExam /> 
              </ProtectedRoute>
            } />
            <Route path="/admin/financials" element={
              <ProtectedRoute roles={[UserRole.ADMIN]}>
                 <AdminDashboard /> 
              </ProtectedRoute>
            } />
            <Route path="/admin/definitions" element={
              <ProtectedRoute roles={[UserRole.ADMIN]}>
                 <AdminDashboard /> 
              </ProtectedRoute>
            } />
            <Route path="/admin/shop" element={
              <ProtectedRoute roles={[UserRole.ADMIN]}>
                 <AdminDashboard /> 
              </ProtectedRoute>
            } />
            <Route path="/admin/media" element={
              <ProtectedRoute roles={[UserRole.ADMIN]}>
                 <AdminDashboard /> 
              </ProtectedRoute>
            } />
            <Route path="/admin/logs" element={
              <ProtectedRoute roles={[UserRole.ADMIN]}>
                 <AdminDashboard /> 
              </ProtectedRoute>
            } />
            <Route path="/admin/social" element={
              <ProtectedRoute roles={[UserRole.ADMIN]}>
                 <SocialFeed />
              </ProtectedRoute>
            } />
            <Route path="/admin/profile" element={
              <ProtectedRoute roles={[UserRole.ADMIN]}>
                 <AdminProfile />
              </ProtectedRoute>
            } />
            <Route path="/admin/ads" element={
              <ProtectedRoute roles={[UserRole.ADMIN]}>
                 <AdminDashboard /> 
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute roles={[UserRole.ADMIN]}>
                 <AdminSettings />
              </ProtectedRoute>
            } />
            <Route path="/admin/prize-exams" element={
              <ProtectedRoute roles={[UserRole.ADMIN]}>
                 <AdminDashboard /> 
              </ProtectedRoute>
            } />

            {/* Shared Routes */}
            <Route path="/chat" element={
              <ProtectedRoute roles={[UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN]}>
                 <Chat />
              </ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </Layout>
    </HashRouter>
  );
};

function App() {
  return (
    <StoreProvider>
      <MainRouter />
    </StoreProvider>
  );
}

export default App;