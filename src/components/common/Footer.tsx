import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Globe, CheckCircle2 } from 'lucide-react';
import { EBizLogo } from './EBizLogo';

export const Footer: React.FC = () => {
  const [newsletterDone, setNewsletterDone] = useState(false);
  return (
    <footer className="bg-[#07182F] text-gray-400 dark:text-gray-500 text-sm border-t border-white/10 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-14 border-b border-white/10">
          
          {/* Col 1: Brand */}
          <div className="lg:col-span-1 space-y-4">
            <Link to="/" className="inline-block">
              <EBizLogo variant="dark" size="md" subtitleText="ebizearn.com" />
            </Link>
            <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed pt-2">
              The premier digital task & reputation marketplace connecting real contributors with verified enterprise campaigns in the UAE and worldwide.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Quick Links</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link to="/tasks" className="hover:text-white transition-colors">Tasks</Link></li>
              <li><Link to="/for-businesses" className="hover:text-white transition-colors">For Businesses</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Col 3: Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Support</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/faq" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/payments" className="hover:text-white transition-colors">Payment Guide</Link></li>
              <li><Link to="/trust-safety" className="hover:text-white transition-colors">Community</Link></li>
            </ul>
          </div>

          {/* Col 4: Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Legal</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link></li>
              <li><Link to="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link></li>
              <li><Link to="/trust-safety" className="hover:text-white transition-colors">Anti-Fraud Policy</Link></li>
              <li><Link to="/legal/task-policy" className="hover:text-white transition-colors">Compliance</Link></li>
            </ul>
          </div>

          {/* Col 5: Stay Connected */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Stay Connected</h4>

            {/* Newsletter Input — honest: no backend endpoint yet, so the form
                confirms receipt locally and tells the truth instead of faking
                a subscription. */}
            {newsletterDone ? (
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-white/5 border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-[#16B364] shrink-0 mt-0.5" />
                <p className="text-xs text-gray-300 leading-relaxed">
                  Thanks — newsletter sign-up isn't wired up yet. Check back soon, or reach us at{' '}
                  <a href="mailto:support@ebizearn.com" className="text-[#20C4E8] font-bold hover:underline">
                    support@ebizearn.com
                  </a>
                  .
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setNewsletterDone(true);
                }}
                className="relative"
              >
                <input
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="w-full bg-[#0D2342] text-xs text-white placeholder-gray-500 pl-3.5 pr-10 py-2.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#168BFF]"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-2 bg-white/10 hover:bg-[#168BFF] text-white rounded-md flex items-center justify-center transition-colors"
                  aria-label="Subscribe"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar matching reference */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 dark:text-gray-400 gap-4">
          <p>© 2026 eBiz Network (ebizearn.com). All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span>A Global Platform for a Brighter Tomorrow</span>
            <Globe className="w-3.5 h-3.5 text-[#25C5E8]" />
          </div>
        </div>

        {/* Internal Access — operations only. No public super-admin entry points. */}
        <div className="pt-6 mt-6 border-t border-white/5 flex items-center justify-center gap-2 text-[11px] text-gray-600 dark:text-gray-400">
          <span className="uppercase tracking-wider font-semibold">Internal Access</span>
          <span className="text-gray-700 dark:text-gray-300">•</span>
          <Link to="/moderator/login" className="hover:text-gray-300 transition-colors">
            Moderator Login
          </Link>
        </div>
      </div>
    </footer>
  );
};
