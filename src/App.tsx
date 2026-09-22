import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PlatformDataProvider } from './context/PlatformDataContext';
import { LiveChatWidget } from './components/common/LiveChatWidget';
import { RoleGuard } from './components/common/RoleGuard';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { ContributorLayout } from './layouts/ContributorLayout';
import { BusinessLayout } from './layouts/BusinessLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Public & Auth Pages
import { HomePage } from './pages/public/HomePage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';
import { PublicTasksPage } from './pages/public/PublicTasksPage';
import { EarnPage } from './pages/public/EarnPage';
import { ForBusinessesPage } from './pages/public/ForBusinessesPage';
import { AboutPage } from './pages/public/AboutPage';
import { FaqPage } from './pages/public/FaqPage';
import { TrustSafetyPage } from './pages/public/TrustSafetyPage';
import { ContactPage } from './pages/public/ContactPage';
import { LegalPage } from './pages/public/LegalPage';
import { LoginPage } from './pages/auth/LoginPage';
import { SuperAdminLoginPage } from './pages/auth/SuperAdminLoginPage';
import { ContributorSignupPage } from './pages/auth/ContributorSignupPage';
import { BusinessSignupPage } from './pages/auth/BusinessSignupPage';
import { OnboardingWizardPage } from './pages/auth/OnboardingWizardPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

// Contributor Pages
import { ContributorDashboardPage } from './pages/contributor/ContributorDashboardPage';
import { TaskDetailPage } from './pages/contributor/TaskDetailPage';
import { TaskFeedPage } from './pages/contributor/TaskFeedPage';
import { ContributorWalletPage } from './pages/contributor/ContributorWalletPage';
import { ContributorEarningsPage } from './pages/contributor/ContributorEarningsPage';
import { ContributorMyTasksPage } from './pages/contributor/ContributorMyTasksPage';
import { ContributorReferralsPage } from './pages/contributor/ContributorReferralsPage';
import { ContributorProfilePage } from './pages/contributor/ContributorProfilePage';
import { ContributorSupportPage } from './pages/contributor/ContributorSupportPage';

// Business Pages
import { BusinessDashboardPage } from './pages/business/BusinessDashboardPage';
import { BusinessCampaignsPage } from './pages/business/BusinessCampaignsPage';
import { BusinessCampaignDetailPage } from './pages/business/BusinessCampaignDetailPage';
import { BusinessTaskLibraryPage } from './pages/business/BusinessTaskLibraryPage';
import { BusinessContributorsPage } from './pages/business/BusinessContributorsPage';
import { BusinessSubmissionsPage } from './pages/business/BusinessSubmissionsPage';
import { BusinessReportsPage } from './pages/business/BusinessReportsPage';
import { BusinessBillingPage } from './pages/business/BusinessBillingPage';
import { BusinessSettingsPage } from './pages/business/BusinessSettingsPage';
import { BusinessSupportPage } from './pages/business/BusinessSupportPage';
import { CreateCampaignWizardPage } from './pages/business/CreateCampaignWizardPage';

// Admin Pages
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { AdminVerificationCenterPage } from './pages/admin/AdminVerificationCenterPage';
import { AdminFraudPage } from './pages/admin/AdminFraudPage';
import { AdminPayoutsPage } from './pages/admin/AdminPayoutsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminCampaignsOversightPage } from './pages/admin/AdminCampaignsOversightPage';
import { AdminSupportPage } from './pages/admin/AdminSupportPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminSystemHealthPage } from './pages/admin/AdminSystemHealthPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';
import { AdminBusinessesPage } from './pages/admin/AdminBusinessesPage';
import { AdminTasksPage } from './pages/admin/AdminTasksPage';
import { AdminWalletsPage } from './pages/admin/AdminWalletsPage';
import { AdminReferralsPage } from './pages/admin/AdminReferralsPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { BusinessTeamPage } from './pages/business/BusinessTeamPage';
import { SuperAdminPage } from './pages/admin/SuperAdminPage';
import { EmailSettingsPanel } from './pages/admin/email/EmailSettingsPanel';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

/** On boot, rehydrate the session against the real API if a token is stored. */
const BootAuth: React.FC = () => {
  const { refreshMe } = useAuth();

  useEffect(() => {
    refreshMe().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <PlatformDataProvider>
        <BrowserRouter>
        <ScrollToTop />
        <BootAuth />
        <Routes>
          {/* Public Marketing Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/tasks" element={<PublicTasksPage />} />
            <Route path="/earn" element={<EarnPage />} />
            <Route path="/for-businesses" element={<ForBusinessesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/trust-safety" element={<TrustSafetyPage />} />
            <Route path="/pricing" element={<ForBusinessesPage />} />
            <Route path="/payments" element={<FaqPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/legal" element={<Navigate to="/legal/terms" replace />} />
            <Route path="/legal/terms" element={<LegalPage />} />
            <Route path="/legal/privacy" element={<LegalPage />} />
            <Route path="/legal/cookies" element={<LegalPage />} />
            <Route path="/legal/task-policy" element={<LegalPage />} />
            
            {/* Auth Routes — separate portals. Super Admin console is /ops/console (unlinked). */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/login/contributor" element={<LoginPage portal="contributor" />} />
            <Route path="/login/business" element={<LoginPage portal="business" />} />
            <Route path="/login/team" element={<LoginPage portal="team" />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/signup" element={<ContributorSignupPage />} />
            <Route path="/signup/contributor" element={<ContributorSignupPage />} />
            <Route path="/signup/business" element={<BusinessSignupPage />} />
            <Route path="/onboarding" element={<OnboardingWizardPage />} />
          </Route>

          {/* Hidden Super Admin console sign-in (no public chrome; unlinked everywhere). */}
          <Route path="/ops/console" element={<SuperAdminLoginPage />} />

          {/* Contributor Portal Routes */}
          <Route path="/app" element={<RoleGuard allowedRoles={['contributor']}><ContributorLayout /></RoleGuard>}>
            <Route index element={<ContributorDashboardPage />} />
            <Route path="tasks" element={<TaskFeedPage variant="cards" />} />
            <Route path="feed" element={<TaskFeedPage variant="feed" />} />
            <Route path="tasks/:id" element={<TaskDetailPage />} />
            <Route path="tasks/:id/submit" element={<TaskDetailPage />} />
            <Route path="my-tasks" element={<ContributorMyTasksPage />} />
            <Route path="earnings" element={<ContributorEarningsPage />} />
            <Route path="wallet" element={<ContributorWalletPage />} />
            <Route path="referrals" element={<ContributorReferralsPage />} />
            <Route path="profile" element={<ContributorProfilePage />} />
            <Route path="support" element={<ContributorSupportPage />} />
          </Route>

          {/* Business CRM Routes */}
          <Route path="/business" element={<RoleGuard allowedRoles={['business']}><BusinessLayout /></RoleGuard>}>
            <Route index element={<BusinessDashboardPage />} />
            <Route path="campaigns" element={<BusinessCampaignsPage />} />
            <Route path="campaigns/create" element={<CreateCampaignWizardPage />} />
            <Route path="campaigns/:id" element={<BusinessCampaignDetailPage />} />
            <Route path="tasks" element={<BusinessTaskLibraryPage />} />
            <Route path="contributors" element={<BusinessContributorsPage />} />
            <Route path="submissions" element={<BusinessSubmissionsPage />} />
            <Route path="proofs" element={<BusinessSubmissionsPage />} />
            <Route path="reports" element={<BusinessReportsPage />} />
            <Route path="billing" element={<BusinessBillingPage />} />
            <Route path="team" element={<BusinessTeamPage />} />
            <Route path="settings" element={<BusinessSettingsPage />} />
            <Route path="support" element={<BusinessSupportPage />} />
          </Route>

          {/* Admin & Super Admin Command Center Routes.
              Moderator support is pending: it requires a coordinated change to
              src/pages/auth/LoginPage.tsx (team-portal accepted roles) and
              UserRole, which live outside this phase's scope. */}
          <Route path="/admin" element={<RoleGuard allowedRoles={['admin', 'superadmin']}><AdminLayout /></RoleGuard>}>
            <Route index element={<AdminOverviewPage />} />
            <Route path="super" element={<RoleGuard allowedRoles={['superadmin']}><SuperAdminPage /></RoleGuard>} />
            <Route path="email" element={<RoleGuard allowedRoles={['superadmin']}><EmailSettingsPanel /></RoleGuard>} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="businesses" element={<AdminBusinessesPage />} />
            <Route path="verification" element={<AdminVerificationCenterPage />} />
            <Route path="payouts" element={<AdminPayoutsPage />} />
            <Route path="withdrawals" element={<AdminPayoutsPage />} />
            <Route path="wallets" element={<AdminWalletsPage />} />
            <Route path="referrals" element={<AdminReferralsPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="campaigns" element={<AdminCampaignsOversightPage />} />
            <Route path="tasks" element={<AdminTasksPage />} />
            <Route path="fraud" element={<AdminFraudPage />} />
            <Route path="support" element={<AdminSupportPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="health" element={<AdminSystemHealthPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="audit" element={<AdminAuditLogsPage />} />
            <Route path="audit-logs" element={<AdminAuditLogsPage />} />
          </Route>

          {/* SuperAdmin alias */}

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Global Floating Live Chat Support Desk (Bottom-Right) */}
        <LiveChatWidget />
      </BrowserRouter>
      </PlatformDataProvider>
    </AuthProvider>
  );
};

export default App;

