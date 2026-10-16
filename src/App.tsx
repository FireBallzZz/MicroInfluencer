import { Navigate, Route, Routes } from 'react-router-dom';
import PublicLayout from './components/PublicLayout';
import AppShell from './components/AppShell';
import ScrollToTop from './components/ScrollToTop';
import { useAuth } from './state/AuthContext';
import { AdminAuthProvider, useAdminAuth } from './state/AdminAuthContext';

import Landing from './pages/public/Landing';
import Privacy from './pages/public/Privacy';
import Terms from './pages/public/Terms';
import RoleSelection from './pages/auth/RoleSelection';
import RegisterCreator from './pages/auth/RegisterCreator';
import RegisterBrand from './pages/auth/RegisterBrand';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyCode from './pages/auth/VerifyCode';
import ResetPassword from './pages/auth/ResetPassword';

import CreatorDashboard from './pages/creator/Dashboard';
import CreatorProfile from './pages/creator/Profile';
import EditCreatorProfile from './pages/creator/EditProfile';
import ConnectedAccounts from './pages/creator/ConnectedAccounts';
import CampaignDiscovery from './pages/creator/CampaignDiscovery';
import CampaignDetail from './pages/creator/CampaignDetail';
import MyApplications from './pages/creator/MyApplications';
import ApplicationDetail from './pages/creator/ApplicationDetail';

import BrandDashboard from './pages/brand/Dashboard';
import BrandProfile from './pages/brand/Profile';
import EditBrandProfile from './pages/brand/EditProfile';
import CreatorDiscovery from './pages/brand/CreatorDiscovery';
import CreatorPublicProfile from './pages/brand/CreatorPublicProfile';
import CampaignList from './pages/brand/CampaignList';
import CreateCampaign from './pages/brand/CreateCampaign';
import EditCampaign from './pages/brand/EditCampaign';
import CampaignDetailBrand from './pages/brand/CampaignDetail';
import ProposalManagement from './pages/brand/ProposalManagement';
import ProposalDetail from './pages/brand/ProposalDetail';
import CampaignAnalytics from './pages/brand/CampaignAnalytics';

import NotificationsPage from './pages/shared/Notifications';
import Unauthorized from './pages/shared/Unauthorized';
import NotFound from './pages/shared/NotFound';
import VerifyEmailPage from './pages/shared/VerifyEmail';
import NotificationSettingsPage from './pages/shared/NotificationSettings';

import AdminApp from './pages/admin/App';
import AdminLogin from './pages/admin/Login';
import AdminOverview from './pages/admin/Overview';
import AdminUsers from './pages/admin/Users';
import AdminActions from './pages/admin/Actions';

function Protected({ role, children }: { role: 'creator' | 'brand'; children: JSX.Element }) {
  const { user, ready } = useAuth();
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper-100">
        <div className="text-sm text-ink-500 font-mono">Loading…</div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to="/unauthorized" replace />;
  return children;
}

function AdminGuard({ children }: { children: JSX.Element }) {
  const { user, ready } = useAdminAuth();
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper-100">
        <div className="text-sm text-ink-500 font-mono">Loading…</div>
      </div>
    );
  }
  if (!user || user.role !== 'admin') return <Navigate to="/admin/login" replace />;
  return children;
}

export default function App() {
  const { ready } = useAuth();
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper-100">
        <div className="text-sm text-ink-500 font-mono">Loading…</div>
      </div>
    );
  }
  return (
    <>
      <ScrollToTop />
      <AdminAuthProvider>
      <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register/role" element={<RoleSelection />} />
        <Route path="/register/creator" element={<RegisterCreator />} />
        <Route path="/register/brand" element={<RegisterBrand />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-code" element={<VerifyCode />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Route>

      <Route element={<Protected role="creator"><AppShell /></Protected>}>
        <Route path="/creator/dashboard" element={<CreatorDashboard />} />
        <Route path="/creator/profile" element={<CreatorProfile />} />
        <Route path="/creator/profile/edit" element={<EditCreatorProfile />} />
        <Route path="/creator/accounts" element={<ConnectedAccounts />} />
        <Route path="/settings/connections" element={<ConnectedAccounts />} />
        <Route path="/creator/campaigns" element={<CampaignDiscovery />} />
        <Route path="/creator/campaigns/:id" element={<CampaignDetail />} />
        <Route path="/creator/applications" element={<MyApplications />} />
        <Route path="/creator/applications/:id" element={<ApplicationDetail />} />
        <Route path="/creator/notifications" element={<NotificationsPage role="creator" />} />
        <Route path="/creator/settings/notifications" element={<NotificationSettingsPage />} />
      </Route>

      <Route element={<Protected role="brand"><AppShell /></Protected>}>
        <Route path="/brand/dashboard" element={<BrandDashboard />} />
        <Route path="/brand/profile" element={<BrandProfile />} />
        <Route path="/brand/profile/edit" element={<EditBrandProfile />} />
        <Route path="/brand/creators" element={<CreatorDiscovery />} />
        <Route path="/brand/creators/:id" element={<CreatorPublicProfile />} />
        <Route path="/brand/campaigns" element={<CampaignList />} />
        <Route path="/brand/campaigns/create" element={<CreateCampaign />} />
        <Route path="/brand/campaigns/:id" element={<CampaignDetailBrand />} />
        <Route path="/brand/campaigns/:id/analytics" element={<CampaignAnalytics />} />
        <Route path="/brand/campaigns/:id/edit" element={<EditCampaign />} />
        <Route path="/brand/campaigns/:id/proposals" element={<ProposalManagement />} />
        <Route path="/brand/proposals/:id" element={<ProposalDetail />} />
        <Route path="/brand/notifications" element={<NotificationsPage role="brand" />} />
        <Route path="/brand/settings/notifications" element={<NotificationSettingsPage />} />
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route element={<AdminGuard><AdminApp /></AdminGuard>}>
        <Route path="/admin/overview" element={<AdminOverview />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/actions" element={<AdminActions />} />
      </Route>

      <Route path="*" element={<NotFound />} />
      </Routes>
      </AdminAuthProvider>
    </>
  );
}
