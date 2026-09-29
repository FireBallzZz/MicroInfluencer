import { Navigate, Route, Routes } from 'react-router-dom';
import PublicLayout from './components/PublicLayout';
import AppShell from './components/AppShell';
import { useAuth } from './state/AuthContext';

import Landing from './pages/public/Landing';
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

import NotificationsPage from './pages/shared/Notifications';
import Unauthorized from './pages/shared/Unauthorized';
import NotFound from './pages/shared/NotFound';

function Protected({ role, children }: { role: 'creator' | 'brand'; children: JSX.Element }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to="/unauthorized" replace />;
  return children;
}

export default function App() {
  return (
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
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Route>

      <Route element={<Protected role="creator"><AppShell /></Protected>}>
        <Route path="/creator/dashboard" element={<CreatorDashboard />} />
        <Route path="/creator/profile" element={<CreatorProfile />} />
        <Route path="/creator/profile/edit" element={<EditCreatorProfile />} />
        <Route path="/creator/accounts" element={<ConnectedAccounts />} />
        <Route path="/creator/campaigns" element={<CampaignDiscovery />} />
        <Route path="/creator/campaigns/:id" element={<CampaignDetail />} />
        <Route path="/creator/applications" element={<MyApplications />} />
        <Route path="/creator/applications/:id" element={<ApplicationDetail />} />
        <Route path="/creator/notifications" element={<NotificationsPage role="creator" />} />
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
        <Route path="/brand/campaigns/:id/edit" element={<EditCampaign />} />
        <Route path="/brand/campaigns/:id/proposals" element={<ProposalManagement />} />
        <Route path="/brand/notifications" element={<NotificationsPage role="brand" />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
