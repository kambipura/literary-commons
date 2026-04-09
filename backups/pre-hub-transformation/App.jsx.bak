import { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

// Layouts
import StudentLayout from './layouts/StudentLayout';
import ProfessorLayout from './layouts/ProfessorLayout';
import AdminLayout from './layouts/AdminLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages — Student / Shared
import {
  StudentDashboard,
  Notebook,
  NoteEditor,
  ClassFeed,
  WriteReflection,
  PostDetail,
  SemesterThread,
  ConnectionsView,
  EssayBuilder,
  PeerLinks,
} from './pages/student';

// Pages — Professor
import {
  CourseOverview,
  SessionManager,
  ClassFeedProf,
  PostDetailProf,
  StudentRoster,
  GradingPanel,
  ParticipationTracker,
} from './pages/professor';

// Pages — Admin
import {
  AllCourses,
  CreateCourse,
  EnrollStudents,
  ManageStaff,
} from './pages/admin';

// Pages — Auth
import { Login } from './pages/auth';

// Public
import PublicEssay from './pages/public/PublicEssay';

function AppRoutes() {
  const { user, role, isAuthenticated, isLoading, isRecovering } = useContext(AuthContext);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', color: 'var(--ink-3)' }}>
        <div className="spinner" style={{ marginBottom: 'var(--space-4)' }}></div>
        <p>Verifying authentication...</p>
      </div>
    );
  }

  // Helper to determine the dashboard based on role
  const DashboardElement = role === 'admin' ? <AllCourses /> 
    : (role === 'professor' ? <CourseOverview /> : <StudentDashboard />);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/public/essay/:id" element={<PublicEssay />} />

      {/* Auth Routes */}
      {(!isAuthenticated || isRecovering) ? (
        <Route element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Route>
      ) : (
        <>
          {/* Shared Writing/Student Routes */}
          <Route element={<StudentLayout />}>
            <Route index element={DashboardElement} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="notebook" element={<Notebook />} />
            <Route path="notebook/:id" element={<NoteEditor />} />
            <Route path="feed" element={role === 'professor' ? <ClassFeedProf /> : <ClassFeed />} />
            <Route path="write" element={<WriteReflection />} />
            <Route path="post/:id" element={role === 'professor' ? <PostDetailProf /> : <PostDetail />} />
            <Route path="thread" element={<SemesterThread />} />
            <Route path="connections" element={<ConnectionsView />} />
            <Route path="essay" element={<EssayBuilder />} />
            <Route path="links" element={<PeerLinks />} />
          </Route>

          {/* Admin Specific Routes */}
          {role === 'admin' && (
            <Route element={<AdminLayout />}>
              <Route path="admin" element={<AllCourses />} />
              <Route path="create" element={<CreateCourse />} />
              <Route path="staff" element={<ManageStaff />} />
            </Route>
          )}

          {/* Professor Specific Routes */}
          {(role === 'professor' || role === 'admin') && (
            <Route element={<ProfessorLayout />}>
              <Route path="overview" element={<CourseOverview />} />
              <Route path="sessions" element={<SessionManager />} />
              <Route path="roster/:courseId" element={<StudentRoster />} />
              <Route path="enroll" element={<EnrollStudents />} />
              <Route path="grading" element={<GradingPanel />} />
              <Route path="participation" element={<ParticipationTracker />} />
            </Route>
          )}

          <Route path="diag" element={<div style={{padding: '50px', background: 'white', color: 'black'}}><pre>{JSON.stringify({role, isAuthenticated, user}, null, 2)}</pre></div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      )}
    </Routes>
  );
}

function MainApp() {
  return (
    <>
      <AppRoutes />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <MainApp />
      </BrowserRouter>
    </AuthProvider>
  );
}
