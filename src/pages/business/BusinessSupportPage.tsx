import React from 'react';
import { Mail, HelpCircle, BookOpen, FileText, MessagesSquare } from 'lucide-react';

/**
 * Honest support surface. There is no backend ticketing endpoint, so the
 * previous fabricated ticket list, fake account manager, fake SLA promises
 * and fake phone number are gone. Support is directed to the real channel.
 */
const SUPPORT_EMAIL = 'support@ebizearn.com';

export const BusinessSupportPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Support</h1>
        <p className="text-sm text-gray-500 mt-1">Get help with your business account.</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E7ECF3] shadow-xs p-8 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-[#168BFF]/10 text-[#168BFF] flex items-center justify-center mx-auto">
          <Mail className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-lg font-extrabold text-gray-900">Talk to our team</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
            Campaign issues, billing questions, or help with targeting — email us and a member of the team
            will get back to you.
          </p>
        </div>
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#168BFF] hover:bg-[#1275DD] text-white text-sm font-bold rounded-xl transition-colors"
        >
          <Mail className="w-4 h-4" /> {SUPPORT_EMAIL}
        </a>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          {
            icon: BookOpen,
            title: 'Help articles',
            text: 'Step-by-step guides for launching and managing campaigns.',
            available: false,
          },
          {
            icon: FileText,
            title: 'Billing & invoices',
            text: 'Copy your invoices and fund your balance from the billing page.',
            available: true,
            href: '/business/billing',
          },
          {
            icon: MessagesSquare,
            title: 'In-app tickets',
            text: 'Support tickets need backend support and are not available yet.',
            available: false,
          },
        ].map((c) => (
          <div key={c.title} className="bg-white rounded-2xl border border-[#E7ECF3] shadow-xs p-5">
            <div className="p-2 rounded-xl bg-gray-100 text-gray-500 w-fit mb-3">
              <c.icon className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-extrabold text-gray-900 mb-1">{c.title}</h4>
            <p className="text-[11px] text-gray-500 leading-relaxed mb-3">{c.text}</p>
            {c.available && c.href ? (
              <a href={c.href} className="text-xs font-bold text-[#168BFF] hover:underline inline-flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" /> Open
              </a>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Coming soon</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
