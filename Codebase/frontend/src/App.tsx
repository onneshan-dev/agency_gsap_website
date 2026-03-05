import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { Toaster } from 'sonner';

// Contexts
import { AuthProvider } from './contexts/AuthContext';

// Global Components
import CustomCursor from './components/CustomCursor';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Admin Portal
import AdminDashboardPage from './pages/admin/DashboardPage';
import ProjectsPage from './pages/admin/ProjectsPage';
import ProjectDetailsPage from './pages/admin/ProjectDetailsPage';
import ClientProposalsPage from './pages/admin/ClientProposalsPage';
import AdminProposalDetail from './pages/admin/ProposalDetail';
import TeamPage from './pages/admin/TeamPage';
import AnalyticsDashboard from './pages/admin/AnalyticsDashboard';

// Client Portal
import ClientDashboard from './pages/client/Dashboard';
import NewProposal from './pages/client/NewProposal';
import ClientProposalDetail from './pages/client/ProposalDetail';
import ClientProjectDetail from './pages/client/ProjectDetail';
import TemplateSelection from './pages/client/TemplateSelection';

// Team Portal
import TeamDashboard from './pages/team/Dashboard';
import TeamProjectDetail from './pages/team/ProjectDetail';

// Hooks
import useSmoothScroll from './hooks/useSmoothScroll';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// Set global GSAP defaults
gsap.defaults({
  ease: 'power3.out',
  duration: 0.8,
});

ScrollTrigger.defaults({
  toggleActions: 'play none none reverse',
  markers: false,
});

// Routes that should not show navbar and footer
const HIDDEN_NAV_ROUTES = ['/login', '/register', '/admin', '/client', '/team'];

function AppContent() {
  const location = useLocation();
  
  // Check if current route should hide navbar and footer
  const shouldHideNav = HIDDEN_NAV_ROUTES.some(route =>
    location.pathname === route || location.pathname.startsWith(`${route}/`)
  );

  // Kill all ScrollTriggers on admin/client routes to prevent scroll issues
  useEffect(() => {
    if (shouldHideNav) {
      ScrollTrigger.getAll().forEach(st => st.kill());
      
      document.body.style.removeProperty('overflow');
      document.body.style.removeProperty('height');
      document.documentElement.style.removeProperty('overflow');
      document.documentElement.style.removeProperty('height');
      
      document.body.classList.remove('gsap-has-scroller');
      document.documentElement.classList.remove('gsap-has-scroller');
      
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
      
      ScrollTrigger.refresh();
    }
  }, [location.pathname, shouldHideNav]);

  return (
    <div className={cn("relative min-h-screen bg-onneshan-bg-primary", shouldHideNav && "normal-cursor")}>
      {!shouldHideNav && <CustomCursor />}
      <div className="grain-overlay" />
      <Toaster position="top-right" richColors />
      {!shouldHideNav && <Navbar />}

      <Routes>
        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Password Reset Routes (accessible when logged out) */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Public Website Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />

        {/* Admin Portal Routes */}
        <Route element={<ProtectedRoute requireAdmin={true} />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/projects" element={<ProjectsPage />} />
          <Route path="/admin/projects/:id" element={<ProjectDetailsPage />} />
          <Route path="/admin/proposals" element={<ClientProposalsPage />} />
          <Route path="/admin/proposals/:id" element={<AdminProposalDetail />} />
          <Route path="/admin/team" element={<TeamPage />} />
          <Route path="/admin/analytics" element={<AnalyticsDashboard />} />
        </Route>

        {/* Client Portal Routes */}
        <Route element={<ProtectedRoute allowedRoles={['client']} />}>
          <Route path="/client" element={<ClientDashboard />} />
          <Route path="/client/dashboard" element={<ClientDashboard />} />
          <Route path="/client/proposals/new" element={<NewProposal />} />
          <Route path="/client/proposals/templates" element={<TemplateSelection />} />
          <Route path="/client/proposals/:id" element={<ClientProposalDetail />} />
          <Route path="/client/projects/:id" element={<ClientProjectDetail />} />
        </Route>

        {/* Team Portal Routes */}
        <Route element={<ProtectedRoute allowedRoles={['team_member', 'admin']} />}>
          <Route path="/team" element={<TeamDashboard />} />
          <Route path="/team/dashboard" element={<TeamDashboard />} />
          <Route path="/team/projects/:id" element={<TeamProjectDetail />} />
        </Route>
      </Routes>

      {!shouldHideNav && <Footer />}
    </div>
  );
}

function App() {
  useSmoothScroll();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      ScrollTrigger.getAll().forEach(st => st.kill());
    }

    ScrollTrigger.refresh();

    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
