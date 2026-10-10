import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PhoneRequiredModal } from './components/auth/PhoneRequiredModal';
import { PlatformDataProvider } from './context/PlatformDataContext';
import { LiveChatWidget } from './components/common/LiveChatWidget';
import { CookieConsent } from './components/common/CookieConsent';
import { RouteSeo } from './components/common/Seo';
import { RoleGuard } from './components/common/RoleGuard';
import { DeferredPageLoader } from './components/common/PageLoader';
import { Toaster } from './components/common/Toast';
import { usePageTracking } from './hooks/usePageTracking';
import { useSessionTimeout } from './hooks/useSessionTimeout';
import { reapplyGTranslateLang, GTranslateEngine } from './components/common/GTranslate';

// Layouts — the public shell stays in the main bundle (first paint);
// role shells are lazy so their code ships with their portal chunk.
import { PublicLayout } from './layouts/PublicLayout';
import {
  LazyContributorLayout,
  LazyBusinessLayout,
  LazyAdminLayout,
  LazyHomePage,
  LazyHowItWorksPage,
  LazyPublicTasksPage,
  LazyEarnPage,
  LazyForBusinessesPage,
  LazyAboutPage,
  LazyFaqPage,
  LazyBlogIndexPage,
  LazyBlogPostPage,
  LazyTrustSafetyPage,
  LazyContactPage,
  LazyLegalPage,
  LazyTermsOfServicePage,
  LazyPrivacyPolicyPage,
  LazyDisclaimerPage,
  LazyCookiePolicyPage,
  LazyContributorLoginPage,
  LazySuperAdminLoginPage,
  LazyContributorSignupPage,
  LazyBusinessSignupPage,
  LazyBusinessLoginPage,
  LazyModeratorLoginPage,
  LazyOnboardingWizardPage,
  LazyForgotPasswordPage,
  LazyResetPasswordPage,
  LazyVerifyEmailPage,
  LazyVerifyOtpPage,
  LazyPhoneSetupPage,
  LazyNotFoundPage,
  LazyContributorDashboardPage,
  LazyTaskDetailPage,
  LazyTaskFeedPage,
  LazyContributorWalletPage,
  LazyContributorEarningsPage,
  LazyContributorMyTasksPage,
  LazyContributorTaskHistoryPage,
  LazyContributorTaskHistoryDetailPage,
  LazyContributorReferralsPage,
  LazyContributorNotificationsPage,
  LazyContributorProfilePage,
  LazyContributorSupportPage,
  LazyBusinessDashboardPage,
  LazyBusinessCampaignsPage,
  LazyBusinessCampaignDetailPage,
  LazyBusinessTaskLibraryPage,
  LazyBusinessContributorsPage,
  LazyBusinessSubmissionsPage,
  LazyBusinessReportsPage,
  LazyBusinessBillingPage,
  LazyBusinessSettingsPage,
  LazyBusinessSupportPage,
  LazyBusinessProfilePage,
  LazyAdminTaskHistoryPage,
  LazyAdminTaskHistoryDetailPage,
  LazyBusinessNotificationsPage,
  LazyCreateCampaignWizardPage,
  LazyBusinessTeamPage,
  LazyAdminOverviewPage,
  LazyAdminVerificationCenterPage,
  LazyAdminFraudPage,
  LazyAdminPayoutsPage,
  LazyAdminUsersPage,
  LazyAdminRankTiersPage,
  LazyAdminCampaignsOversightPage,
  LazyAdminSupportPage,
  LazyAdminKycPage,
  LazyAdminSocialChannelsPage,
  LazyAdminDepositsPage,
  LazyAdminUserDetailPage,
  LazyAdminPermissionsPage,
  LazyAdminAnalyticsPage,
  LazyAdminTrafficPage,
  LazyAdminSystemHealthPage,
  LazyAdminSettingsPage,
  LazyAdminAuditLogsPage,
  LazyAdminNotificationsPage,
  LazyAdminDropdownListsPage,
  LazyAdminPlatformsPage,
  LazyAdminPaymentGatewaysPage,
  LazyAdminBusinessesPage,
  LazyAdminTasksPage,
  LazyAdminTaskLibraryPage,
  LazyAdminWalletsPage,
  LazyAdminReferralsPage,
  LazyAdminDemoRequestsPage,
  LazyAdminReportsPage,
  LazyEmailSettingsPanel,
} from './routes/lazy';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

/** Logs every page view for the traffic analytics dashboard. */
const PageViewTracker: React.FC = () => {
  usePageTracking();
  return null;
};

/** Enforces the Super Admin-configured inactivity auto-logout. */
const SessionTimeoutEnforcer: React.FC = () => {
  useSessionTimeout();
  return null;
};

/** Re-apply the current Google translation on SPA route changes — Google
 *  doesn't always translate dynamically rendered nodes by itself. */
const ReapplyTranslation: React.FC = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    const id = window.setTimeout(() => reapplyGTranslateLang(), 300);
    return () => window.clearTimeout(id);
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
        <PageViewTracker />
        <SessionTimeoutEnforcer />
        <PhoneRequiredModal />
        <ReapplyTranslation />
        <GTranslateEngine />
        <RouteSeo />
        <BootAuth />
        <Suspense fallback={<DeferredPageLoader />}>
        <Routes>
          {/* Public Marketing Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LazyHomePage />} />
            <Route path="/how-it-works" element={<LazyHowItWorksPage />} />
            <Route path="/tasks" element={<LazyPublicTasksPage />} />
            <Route path="/earn" element={<LazyEarnPage />} />
            <Route path="/for-businesses" element={<LazyForBusinessesPage />} />
            <Route path="/about" element={<LazyAboutPage />} />
            <Route path="/faq" element={<LazyFaqPage />} />
            <Route path="/blog" element={<LazyBlogIndexPage />} />
            <Route path="/blog/:slug" element={<LazyBlogPostPage />} />
            <Route path="/trust-safety" element={<LazyTrustSafetyPage />} />
            <Route path="/pricing" element={<LazyForBusinessesPage />} />
            <Route path="/payments" element={<LazyFaqPage />} />
            <Route path="/contact" element={<LazyContactPage />} />
            <Route path="/legal" element={<Navigate to="/legal/terms" replace />} />
            <Route path="/legal/terms" element={<LazyLegalPage />} />
            <Route path="/legal/privacy" element={<LazyLegalPage />} />
            <Route path="/legal/cookies" element={<LazyLegalPage />} />
            <Route path="/legal/task-policy" element={<LazyLegalPage />} />

            {/* Full standalone legal documents */}
            <Route path="/terms" element={<LazyTermsOfServicePage />} />
            <Route path="/privacy" element={<LazyPrivacyPolicyPage />} />
            <Route path="/disclaimer" element={<LazyDisclaimerPage />} />
            <Route path="/cookies" element={<LazyCookiePolicyPage />} />

            <Route path="/forgot-password" element={<LazyForgotPasswordPage />} />
            <Route path="/reset-password" element={<LazyResetPasswordPage />} />
            <Route path="/onboarding" element={<LazyOnboardingWizardPage />} />
          </Route>

          {/* Dedicated portal auth routes (full-screen, unbranded nav chrome).
              Each role gets its own entry page — no shared login hub. */}
          <Route path="/login" element={<LazyContributorLoginPage />} />
          <Route path="/contributor/login" element={<Navigate to="/login" replace />} />
          <Route path="/contributor/register" element={<LazyContributorSignupPage />} />
          <Route path="/business/login" element={<LazyBusinessLoginPage />} />
          <Route path="/business/register" element={<LazyBusinessSignupPage />} />
          <Route path="/moderator/login" element={<LazyModeratorLoginPage />} />
          {/* Email-verification gate (post-signup + unverified sign-ins). */}
          <Route path="/verify-email" element={<LazyVerifyEmailPage />} />
          {/* Email-OTP step: shown right after email signup (register → otp/send → code entry → otp/verify → auto-login). */}
          <Route path="/verify-otp" element={<LazyVerifyOtpPage />} />
          {/* Post-Google-signup required phone step (no email OTP in this flow). */}
          <Route path="/setup-phone" element={<LazyPhoneSetupPage />} />
          {/* Hidden Super Admin console sign-in (no public chrome; unlinked everywhere). */}
          <Route path="/secure-control-panel/login" element={<LazySuperAdminLoginPage />} />

          {/* Legacy signup aliases */}
          <Route path="/signup" element={<Navigate to="/contributor/register" replace />} />
          <Route path="/signup/contributor" element={<Navigate to="/contributor/register" replace />} />
          <Route path="/signup/business" element={<Navigate to="/business/register" replace />} />

          {/* Contributor Portal Routes */}
          <Route path="/app" element={<RoleGuard allowedRoles={['contributor']}><LazyContributorLayout /></RoleGuard>}>
            <Route index element={<LazyContributorDashboardPage />} />
            <Route path="tasks" element={<LazyTaskFeedPage variant="cards" />} />
            <Route path="feed" element={<Navigate to="/app/tasks" replace />} />
            <Route path="tasks/:id" element={<LazyTaskDetailPage />} />
            <Route path="tasks/:id/submit" element={<LazyTaskDetailPage />} />
            <Route path="my-tasks" element={<LazyContributorMyTasksPage />} />
            <Route path="task-history" element={<LazyContributorTaskHistoryPage />} />
            <Route path="task-history/:id" element={<LazyContributorTaskHistoryDetailPage />} />
            <Route path="earnings" element={<LazyContributorEarningsPage />} />
            <Route path="wallet" element={<LazyContributorWalletPage />} />
            <Route path="referrals" element={<LazyContributorReferralsPage />} />
            <Route path="notifications" element={<LazyContributorNotificationsPage />} />
            <Route path="profile" element={<LazyContributorProfilePage />} />
            <Route path="support" element={<LazyContributorSupportPage />} />
          </Route>

          {/* Business CRM Routes */}
          <Route path="/business" element={<RoleGuard allowedRoles={['business']}><LazyBusinessLayout /></RoleGuard>}>
            <Route index element={<LazyBusinessDashboardPage />} />
            <Route path="campaigns" element={<LazyBusinessCampaignsPage />} />
            <Route path="campaigns/create" element={<LazyCreateCampaignWizardPage />} />
            <Route path="campaigns/:id" element={<LazyBusinessCampaignDetailPage />} />
            <Route path="tasks" element={<LazyBusinessTaskLibraryPage />} />
            <Route path="contributors" element={<LazyBusinessContributorsPage />} />
            <Route path="submissions" element={<LazyBusinessSubmissionsPage />} />
            <Route path="proofs" element={<LazyBusinessSubmissionsPage />} />
            <Route path="reports" element={<LazyBusinessReportsPage />} />
            <Route path="billing" element={<LazyBusinessBillingPage />} />
            <Route path="team" element={<LazyBusinessTeamPage />} />
            <Route path="settings" element={<LazyBusinessSettingsPage />} />
            <Route path="support" element={<LazyBusinessSupportPage />} />
            <Route path="profile" element={<LazyBusinessProfilePage />} />
            <Route path="notifications" element={<LazyBusinessNotificationsPage />} />
          </Route>

          {/* Admin & Super Admin Command Center Routes. Moderators share the
              admin shell; superadmin-only pages (ops, email) stay restricted. */}
          <Route path="/admin" element={<RoleGuard allowedRoles={['admin', 'superadmin', 'moderator']}><LazyAdminLayout /></RoleGuard>}>
            <Route index element={<LazyAdminOverviewPage />} />
            {/* Super-admin landing (from the restricted console route):
                real platform overview, no demo data. Dedicated super-admin
                provisioning UI arrives with the ops provisioning API. */}
            <Route path="super" element={<RoleGuard allowedRoles={['superadmin']}><LazyAdminOverviewPage /></RoleGuard>} />
            <Route path="email" element={<RoleGuard allowedRoles={['superadmin']}><LazyEmailSettingsPanel /></RoleGuard>} />
            <Route path="users" element={<LazyAdminUsersPage />} />
            <Route path="users/:id" element={<LazyAdminUserDetailPage />} />
            <Route path="ranks" element={<RoleGuard allowedRoles={['superadmin']}><LazyAdminRankTiersPage /></RoleGuard>} />
            {/* Admins / moderators reach it with manage_roles (sidebar + API enforce it). */}
            <Route path="permissions" element={<RoleGuard allowedRoles={['superadmin', 'admin', 'moderator']}><LazyAdminPermissionsPage /></RoleGuard>} />
            <Route path="businesses" element={<LazyAdminBusinessesPage />} />
            <Route path="verification" element={<LazyAdminVerificationCenterPage />} />
            <Route path="payouts" element={<LazyAdminPayoutsPage />} />
            <Route path="withdrawals" element={<LazyAdminPayoutsPage />} />
            <Route path="deposits" element={<LazyAdminDepositsPage />} />
            <Route path="wallets" element={<LazyAdminWalletsPage />} />
            <Route path="referrals" element={<LazyAdminReferralsPage />} />
            <Route path="demo-requests" element={<LazyAdminDemoRequestsPage />} />
            <Route path="reports" element={<LazyAdminReportsPage />} />
            <Route path="campaigns" element={<LazyAdminCampaignsOversightPage />} />
            <Route path="tasks" element={<LazyAdminTasksPage />} />
            <Route path="task-library" element={<LazyAdminTaskLibraryPage />} />
            <Route path="task-history" element={<LazyAdminTaskHistoryPage />} />
            <Route path="task-history/:id" element={<LazyAdminTaskHistoryDetailPage />} />
            <Route path="fraud" element={<LazyAdminFraudPage />} />
            <Route path="support" element={<LazyAdminSupportPage />} />
            <Route path="kyc" element={<LazyAdminKycPage />} />
            <Route path="social-channels" element={<LazyAdminSocialChannelsPage />} />
            <Route path="analytics" element={<LazyAdminAnalyticsPage />} />
            <Route path="traffic" element={<LazyAdminTrafficPage />} />
            <Route path="health" element={<LazyAdminSystemHealthPage />} />
            <Route path="settings" element={<LazyAdminSettingsPage />} />
            <Route path="platforms" element={<LazyAdminPlatformsPage />} />
            <Route path="payment-gateways" element={<LazyAdminPaymentGatewaysPage />} />
            <Route path="audit" element={<LazyAdminAuditLogsPage />} />
            <Route path="audit-logs" element={<LazyAdminAuditLogsPage />} />
            <Route path="notifications" element={<RoleGuard allowedRoles={['admin', 'superadmin']}><LazyAdminNotificationsPage /></RoleGuard>} />
            <Route path="dropdown-lists" element={<RoleGuard allowedRoles={['superadmin']}><LazyAdminDropdownListsPage /></RoleGuard>} />
          </Route>

          {/* SuperAdmin alias */}

          {/* Branded 404 — the catch-all renders a real page, never a blank redirect. */}
          <Route path="*" element={<LazyNotFoundPage />} />
        </Routes>
        </Suspense>

        {/* Global Floating Live Chat Support Desk (Bottom-Right) */}
        <LiveChatWidget />
        {/* Global Cookie Consent Notice (bottom; one-time until answered) */}
        <CookieConsent />
        {/* Global toast stack (top-center) — errors / confirmations. */}
        <Toaster />
      </BrowserRouter>
      </PlatformDataProvider>
    </AuthProvider>
  );
};

export default App;
