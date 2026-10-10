import React from 'react';
import { Link } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { EBizLogo } from './EBizLogo';
import { useRegion } from '../../context/RegionContext';

export const Footer: React.FC = () => {
  const { t } = useRegion();

  const quickLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/how-it-works', label: t('nav.howItWorks') },
    { to: '/tasks', label: t('nav.tasks') },
    { to: '/for-businesses', label: t('nav.forBusinesses') },
    { to: '/blog', label: t('nav.blog') },
    { to: '/about', label: t('footer.aboutUs') },
  ];
  const supportLinks = [
    { to: '/faq', label: t('footer.helpCenter') },
    { to: '/contact', label: t('footer.contactUs') },
    { to: '/payments', label: t('footer.paymentGuide') },
    { to: '/trust-safety', label: t('footer.community') },
  ];
  const legalLinks = [
    { to: '/terms', label: t('footer.terms') },
    { to: '/privacy', label: t('footer.privacy') },
    { to: '/disclaimer', label: t('footer.disclaimer') },
    { to: '/cookies', label: t('footer.cookies') },
    { to: '/trust-safety', label: t('footer.antiFraud') },
    { to: '/legal/task-policy', label: t('footer.compliance') },
  ];

  return (
    <footer className="bg-[#07182F] text-gray-400 dark:text-gray-500 text-sm border-t border-white/10 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-14 border-b border-white/10">

          {/* Col 1: Brand */}
          <div className="lg:col-span-1 space-y-4">
            <Link to="/" className="inline-block">
              <EBizLogo variant="dark" size="md" subtitleText="ebizearn.com" />
            </Link>
            <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed pt-2">
              {t('footer.tagline')}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-500 leading-relaxed">
              {t('footer.address')}
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2.5 text-xs">
              {quickLinks.map((l) => (
                <li key={l.to + l.label}><Link to={l.to} className="inline-block py-1.5 hover:text-white transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Col 3: Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">{t('footer.support')}</h4>
            <ul className="space-y-2.5 text-xs">
              {supportLinks.map((l) => (
                <li key={l.to + l.label}><Link to={l.to} className="inline-block py-1.5 hover:text-white transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Col 4: Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">{t('footer.legal')}</h4>
            <ul className="space-y-2.5 text-xs">
              {legalLinks.map((l) => (
                <li key={l.to + l.label}><Link to={l.to} className="inline-block py-1.5 hover:text-white transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>

        </div>

        {/* Compact legal disclaimer */}
        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
          <p className="text-[11px] leading-relaxed text-gray-400 dark:text-gray-500">
            <span className="font-bold text-gray-300 dark:text-gray-400">{t('footer.disclaimerNote')}</span>{' '}
            {t('footer.disclaimerText')}{' '}
            <Link to="/terms" className="underline hover:text-white transition-colors">{t('footer.terms')}</Link>{' '}
            {t('footer.disclaimerAnd')}{' '}
            <Link to="/privacy" className="underline hover:text-white transition-colors">{t('footer.privacy')}</Link>.{' '}
            {t('footer.disclaimerLaw')}
          </p>
        </div>

        {/* Bottom Bar matching reference */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 dark:text-gray-400 gap-4">
          <p>{t('footer.rights')}</p>
          <div className="flex items-center gap-2">
            <span>{t('footer.slogan')}</span>
            <Globe className="w-3.5 h-3.5 text-[#25C5E8]" />
          </div>
        </div>
      </div>
    </footer>
  );
};
