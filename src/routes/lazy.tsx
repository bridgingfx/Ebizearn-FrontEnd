import React from 'react';

/**
 * Route-level code splitting.
 *
 * Every page is loaded lazily so the initial bundle only carries the shell
 * (providers, router, guards, public layout chrome). Vite/Rolldown groups the
 * dynamic imports into role-based chunks via `manualChunks` in vite.config.ts:
 *   - public/auth pages  → on-demand per page (initial render needs one)
 *   - blog              → single "blog" chunk (index + post share deps)
 *   - /app/*            → single "contributor-app" chunk
 *   - /business/*       → single "business-app" chunk
 *   - /admin/*          → single "admin" chunk (never downloaded by visitors)
 *
 * All page modules use named exports, so each lazy() maps the named export
 * to the default React.lazy() expects. This file must stay free of static
 * imports from ./pages or ./layouts — dynamic import() only — otherwise the
 * chunks collapse back into the main bundle and circular imports can appear.
 */

const named = <T extends object>(p: Promise<T>, name: keyof T) =>
  p.then((m) => ({ default: m[name] as React.ComponentType<any> }));

// ── Layouts (role shells load with their chunk) ──────────────────────────
export const LazyContributorLayout = React.lazy(() =>
  named(import('../layouts/ContributorLayout'), 'ContributorLayout'),
);
export const LazyBusinessLayout = React.lazy(() =>
  named(import('../layouts/BusinessLayout'), 'BusinessLayout'),
);
export const LazyAdminLayout = React.lazy(() =>
  named(import('../layouts/AdminLayout'), 'AdminLayout'),
);

// ── Public & Auth pages ──────────────────────────────────────────────────
export const LazyHomePage = React.lazy(() => named(import('../pages/public/HomePage'), 'HomePage'));
export const LazyHowItWorksPage = React.lazy(() =>
  named(import('../pages/public/HowItWorksPage'), 'HowItWorksPage'),
);
export const LazyNotFoundPage = React.lazy(() =>
  named(import('../pages/public/NotFoundPage'), 'NotFoundPage'),
);

export const LazyPublicTasksPage = React.lazy(() =>
  named(import('../pages/public/PublicTasksPage'), 'PublicTasksPage'),
);
export const LazyEarnPage = React.lazy(() => named(import('../pages/public/EarnPage'), 'EarnPage'));
export const LazyForBusinessesPage = React.lazy(() =>
  named(import('../pages/public/ForBusinessesPage'), 'ForBusinessesPage'),
);
export const LazyAboutPage = React.lazy(() => named(import('../pages/public/AboutPage'), 'AboutPage'));
export const LazyFaqPage = React.lazy(() => named(import('../pages/public/FaqPage'), 'FaqPage'));
export const LazyBlogIndexPage = React.lazy(() =>
  named(import('../pages/public/BlogIndexPage'), 'BlogIndexPage'),
);
export const LazyBlogPostPage = React.lazy(() =>
  named(import('../pages/public/BlogPostPage'), 'BlogPostPage'),
);
export const LazyTrustSafetyPage = React.lazy(() =>
  named(import('../pages/public/TrustSafetyPage'), 'TrustSafetyPage'),
);
export const LazyContactPage = React.lazy(() =>
  named(import('../pages/public/ContactPage'), 'ContactPage'),
);
export const LazyLegalPage = React.lazy(() => named(import('../pages/public/LegalPage'), 'LegalPage'));
export const LazyTermsOfServicePage = React.lazy(() =>
  named(import('../pages/public/TermsOfServicePage'), 'TermsOfServicePage'),
);
export const LazyPrivacyPolicyPage = React.lazy(() =>
  named(import('../pages/public/PrivacyPolicyPage'), 'PrivacyPolicyPage'),
);
export const LazyDisclaimerPage = React.lazy(() =>
  named(import('../pages/public/DisclaimerPage'), 'DisclaimerPage'),
);
export const LazyCookiePolicyPage = React.lazy(() =>
  named(import('../pages/public/CookiePolicyPage'), 'CookiePolicyPage'),
);
export const LazyContributorLoginPage = React.lazy(() =>
  named(import('../pages/auth/ContributorLoginPage'), 'ContributorLoginPage'),
);
export const LazySuperAdminLoginPage = React.lazy(() =>
  named(import('../pages/auth/SuperAdminLoginPage'), 'SuperAdminLoginPage'),
);
export const LazyContributorSignupPage = React.lazy(() =>
  named(import('../pages/auth/ContributorSignupPage'), 'ContributorSignupPage'),
);
export const LazyBusinessSignupPage = React.lazy(() =>
  named(import('../pages/auth/BusinessSignupPage'), 'BusinessSignupPage'),
);
export const LazyBusinessLoginPage = React.lazy(() =>
  named(import('../pages/auth/BusinessLoginPage'), 'BusinessLoginPage'),
);
export const LazyModeratorLoginPage = React.lazy(() =>
  named(import('../pages/auth/ModeratorLoginPage'), 'ModeratorLoginPage'),
);
export const LazyOnboardingWizardPage = React.lazy(() =>
  named(import('../pages/auth/OnboardingWizardPage'), 'OnboardingWizardPage'),
);
export const LazyForgotPasswordPage = React.lazy(() =>
  named(import('../pages/auth/ForgotPasswordPage'), 'ForgotPasswordPage'),
);
export const LazyResetPasswordPage = React.lazy(() =>
  named(import('../pages/auth/ResetPasswordPage'), 'ResetPasswordPage'),
);
export const LazyVerifyEmailPage = React.lazy(() =>
  named(import('../components/auth/EmailVerification'), 'VerifyEmailPage'),
);
export const LazyVerifyOtpPage = React.lazy(() =>
  named(import('../pages/auth/VerifyOtpPage'), 'VerifyOtpPage'),
);
export const LazyPhoneSetupPage = React.lazy(() =>
  named(import('../pages/auth/PhoneSetupPage'), 'PhoneSetupPage'),
);

// ── Contributor portal (/app/*) ──────────────────────────────────────────
export const LazyContributorDashboardPage = React.lazy(() =>
  named(import('../pages/contributor/ContributorDashboardPage'), 'ContributorDashboardPage'),
);
export const LazyTaskDetailPage = React.lazy(() =>
  named(import('../pages/contributor/TaskDetailPage'), 'TaskDetailPage'),
);
export const LazyTaskFeedPage = React.lazy(() =>
  named(import('../pages/contributor/TaskFeedPage'), 'TaskFeedPage'),
);
export const LazyContributorWalletPage = React.lazy(() =>
  named(import('../pages/contributor/ContributorWalletPage'), 'ContributorWalletPage'),
);
export const LazyContributorEarningsPage = React.lazy(() =>
  named(import('../pages/contributor/ContributorEarningsPage'), 'ContributorEarningsPage'),
);
export const LazyContributorMyTasksPage = React.lazy(() =>
  named(import('../pages/contributor/ContributorMyTasksPage'), 'ContributorMyTasksPage'),
);
export const LazyContributorReferralsPage = React.lazy(() =>
  named(import('../pages/contributor/ContributorReferralsPage'), 'ContributorReferralsPage'),
);
export const LazyContributorNotificationsPage = React.lazy(() =>
  named(import('../pages/contributor/ContributorNotificationsPage'), 'ContributorNotificationsPage'),
);
export const LazyContributorProfilePage = React.lazy(() =>
  named(import('../pages/contributor/ContributorProfilePage'), 'ContributorProfilePage'),
);
export const LazyContributorSupportPage = React.lazy(() =>
  named(import('../pages/contributor/ContributorSupportPage'), 'ContributorSupportPage'),
);

// ── Business CRM (/business/*) ───────────────────────────────────────────
export const LazyBusinessDashboardPage = React.lazy(() =>
  named(import('../pages/business/BusinessDashboardPage'), 'BusinessDashboardPage'),
);
export const LazyBusinessCampaignsPage = React.lazy(() =>
  named(import('../pages/business/BusinessCampaignsPage'), 'BusinessCampaignsPage'),
);
export const LazyBusinessCampaignDetailPage = React.lazy(() =>
  named(import('../pages/business/BusinessCampaignDetailPage'), 'BusinessCampaignDetailPage'),
);
export const LazyBusinessTaskLibraryPage = React.lazy(() =>
  named(import('../pages/business/BusinessTaskLibraryPage'), 'BusinessTaskLibraryPage'),
);
export const LazyBusinessContributorsPage = React.lazy(() =>
  named(import('../pages/business/BusinessContributorsPage'), 'BusinessContributorsPage'),
);
export const LazyBusinessSubmissionsPage = React.lazy(() =>
  named(import('../pages/business/BusinessSubmissionsPage'), 'BusinessSubmissionsPage'),
);
export const LazyBusinessReportsPage = React.lazy(() =>
  named(import('../pages/business/BusinessReportsPage'), 'BusinessReportsPage'),
);
export const LazyBusinessBillingPage = React.lazy(() =>
  named(import('../pages/business/BusinessBillingPage'), 'BusinessBillingPage'),
);
export const LazyBusinessSettingsPage = React.lazy(() =>
  named(import('../pages/business/BusinessSettingsPage'), 'BusinessSettingsPage'),
);
export const LazyBusinessSupportPage = React.lazy(() =>
  named(import('../pages/business/BusinessSupportPage'), 'BusinessSupportPage'),
);
export const LazyCreateCampaignWizardPage = React.lazy(() =>
  named(import('../pages/business/CreateCampaignWizardPage'), 'CreateCampaignWizardPage'),
);
export const LazyBusinessTeamPage = React.lazy(() =>
  named(import('../pages/business/BusinessTeamPage'), 'BusinessTeamPage'),
);

// ── Admin command center (/admin/*) ───────────────────────────────────────
export const LazyAdminOverviewPage = React.lazy(() =>
  named(import('../pages/admin/AdminOverviewPage'), 'AdminOverviewPage'),
);
export const LazyAdminVerificationCenterPage = React.lazy(() =>
  named(import('../pages/admin/AdminVerificationCenterPage'), 'AdminVerificationCenterPage'),
);
export const LazyAdminFraudPage = React.lazy(() =>
  named(import('../pages/admin/AdminFraudPage'), 'AdminFraudPage'),
);
export const LazyAdminPayoutsPage = React.lazy(() =>
  named(import('../pages/admin/AdminPayoutsPage'), 'AdminPayoutsPage'),
);
export const LazyAdminUsersPage = React.lazy(() =>
  named(import('../pages/admin/AdminUsersPage'), 'AdminUsersPage'),
);
export const LazyAdminCampaignsOversightPage = React.lazy(() =>
  named(import('../pages/admin/AdminCampaignsOversightPage'), 'AdminCampaignsOversightPage'),
);
export const LazyAdminSupportPage = React.lazy(() =>
  named(import('../pages/admin/AdminSupportPage'), 'AdminSupportPage'),
);
export const LazyAdminKycPage = React.lazy(() =>
  named(import('../pages/admin/AdminKycPage'), 'AdminKycPage'),
);
export const LazyAdminUserDetailPage = React.lazy(() =>
  named(import('../pages/admin/AdminUserDetailPage'), 'AdminUserDetailPage'),
);
export const LazyAdminPermissionsPage = React.lazy(() =>
  named(import('../pages/admin/AdminPermissionsPage'), 'AdminPermissionsPage'),
);
export const LazyAdminAnalyticsPage = React.lazy(() =>
  named(import('../pages/admin/AdminAnalyticsPage'), 'AdminAnalyticsPage'),
);
export const LazyAdminSystemHealthPage = React.lazy(() =>
  named(import('../pages/admin/AdminSystemHealthPage'), 'AdminSystemHealthPage'),
);
export const LazyAdminSettingsPage = React.lazy(() =>
  named(import('../pages/admin/AdminSettingsPage'), 'AdminSettingsPage'),
);
export const LazyAdminAuditLogsPage = React.lazy(() =>
  named(import('../pages/admin/AdminAuditLogsPage'), 'AdminAuditLogsPage'),
);
export const LazyAdminBusinessesPage = React.lazy(() =>
  named(import('../pages/admin/AdminBusinessesPage'), 'AdminBusinessesPage'),
);
export const LazyAdminTasksPage = React.lazy(() =>
  named(import('../pages/admin/AdminTasksPage'), 'AdminTasksPage'),
);
export const LazyAdminWalletsPage = React.lazy(() =>
  named(import('../pages/admin/AdminWalletsPage'), 'AdminWalletsPage'),
);
export const LazyAdminReferralsPage = React.lazy(() =>
  named(import('../pages/admin/AdminReferralsPage'), 'AdminReferralsPage'),
);
export const LazyAdminDemoRequestsPage = React.lazy(() =>
  named(import('../pages/admin/AdminDemoRequestsPage'), 'AdminDemoRequestsPage'),
);
export const LazyAdminReportsPage = React.lazy(() =>
  named(import('../pages/admin/AdminReportsPage'), 'AdminReportsPage'),
);
export const LazyEmailSettingsPanel = React.lazy(() =>
  named(import('../pages/admin/email/EmailSettingsPanel'), 'EmailSettingsPanel'),
);
