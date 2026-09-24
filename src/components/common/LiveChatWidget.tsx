import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MessageCircle,
  X,
  Send,
  Paperclip,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Clock,
  Sparkles,
  ChevronDown,
  ArrowUpRight,
  Headphones,
  Ticket,
  AlertCircle,
  Coins,
  FileText,
  UserCheck,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { usePlatform, type PlatformSupportTicket } from '../../context/PlatformDataContext';
import { useAuth } from '../../context/AuthContext';
import { supportApi, getApiError } from '../../api';
import type { TicketCategory } from '../../types';

/** Widget category labels -> API ticket categories. */
const WIDGET_CATEGORY_MAP: Record<string, TicketCategory> = {
  'Task Verification Dispute': 'dispute',
  'Payout Inquiry': 'payout',
  'KYC Verification': 'kyc',
  'Business Campaign Escrow': 'business',
  'Account & General': 'account',
};

interface ChatMessage {
  id: string;
  sender: 'system' | 'agent' | 'user';
  text: string;
  timestamp: string;
  chips?: string[];
  actionLinks?: { label: string; url: string; icon?: any }[];
  ticketCard?: PlatformSupportTicket;
  isHumanEscalation?: boolean;
}

// Comprehensive Business Knowledge Base
const KNOWLEDGE_RESPONSES = [
  {
    keywords: ['geo', 'target', 'location', 'local', 'city', 'state', 'country', 'worldwide', 'global', 'group', 'whatsapp', 'community', 'broadcast'],
    reply: `🌐 **Worldwide & Geo-Targeted Community Broadcast Tasks:**
When an enterprise runs a campaign targeting specific global regions, countries, states, or cities:
- **How to Earn:** Join active local or professional WhatsApp groups, LinkedIn chapters, or community forums matching the target region (or open global networks) and share the sponsor's announcement flyer and link.
- **Fair Regional Pricing:** All task payouts are credited in US Dollars (USD $) regardless of contributor country — your payout provider converts to local currency at withdrawal.
- **Proof Requirement:** Upload a clean screenshot clearly displaying the group name matching the campaign target region along with your published message and timestamp.
- **Automated Validation:** Vision OCR AI automatically cross-checks verified workplace IP, GPS geofence compliance, and group member counts.

👉 Do this now: [Browse Available Tasks](/tasks) or [Submit Task Proof](/app/tasks) to claim your rewards!`,
    actionLinks: [
      { label: 'Browse Worldwide Tasks', url: '/tasks' },
      { label: 'Submit Task Proof', url: '/app/tasks' },
    ],
  },
  {
    keywords: ['trustpilot', 'google review', 'google map', 'review', 'rating', 'star'],
    reply: `⭐ **Trustpilot & Google Maps Review Tasks:**
Verified businesses in the UAE pay real consumers to test their services and leave genuine feedback:
- **How to Earn:** Open the sponsor's direct link on Trustpilot or Google Maps, write an honest 4 to 5-star review based on campaign guidelines, and publish it.
- **Reward:** **$8.00 to $18.00 USD** per verified review.
- **Proof Requirement:** Submit the live review URL and a screenshot of your published review showing your name and date.
- **Anti-Deletion Lock:** Under our 72-hour retention hold, funds are protected in your Pending Balance to safeguard against post-deletion.

👉 Do this now: [Browse Review Tasks](/tasks) and start earning immediately!`,
    actionLinks: [
      { label: 'Explore Review Tasks', url: '/tasks' },
      { label: 'View Contributor Wallet', url: '/app/wallet' },
    ],
  },
  {
    keywords: ['payout', 'withdraw', 'cashout', 'wps', 'bank', 'currency', 'aed', 'money', 'payment gateway'],
    reply: `💳 **USD Rewards & Global Payout Rails:**
- **Currency:** All earnings and platform balances are 100% in **US Dollars (USD)**.
- **Minimum Withdrawal:** Strictly **$50.00** with 0 account fees.
- **Supported Payout Rails:**
  1. **CBUAE Wages Protection System (WPS):** Direct payroll settlement to any UAE IBAN.
  2. **Emirates NBD & FAB Instant Wire:** Real-time host-to-host settlement.
  3. **Checkout.com UAE & Stripe:** Instant card & mobile wallet payouts.
  4. **Circle USDC Rail:** High-speed blockchain treasury settlement.

👉 Do this now: [Open Your Contributor Wallet](/app/wallet) to check your balance and request an instant payout!`,
    actionLinks: [
      { label: 'Open Contributor Wallet', url: '/app/wallet' },
      { label: 'View Payout Guide', url: '/trust-safety' },
    ],
  },
  {
    keywords: ['retention', '72', '72h', 'hold', 'pending balance', 'pending', 'anti-deletion'],
    reply: `🛡️ **72-Hour Retention & Anti-Deletion Lock (T+0, T+24h, T+72h):**
Per eBiz Security Specification:
- **Why it exists:** Protects enterprise sponsors from fraudulent earners deleting their reviews or posts immediately after collecting payouts.
- **How it works:**
  1. **T+0 (Immediate):** Upon AI & moderator approval, your reward enters your **Pending Retention Balance**.
  2. **T+24h (Re-check):** Automated crawler verifies the post or review is still live.
  3. **T+72h (Final Release):** Once the 72-hour retention cycle completes, funds automatically move into your **Available Balance** ready for immediate CBUAE WPS bank transfer.

👉 Check your balances: [View Dual-Balance Breakdown](/app/wallet) or read our [Trust & Safety Standards](/trust-safety).`,
    actionLinks: [
      { label: 'View Wallet Balances', url: '/app/wallet' },
      { label: 'Read Trust & Safety Policy', url: '/trust-safety' },
    ],
  },
  {
    keywords: ['kyc', 'emirates id', 'passport', 'tier 3', 'identity', 'verification', 'aml'],
    reply: `🆔 **Emirates ID (Tier 3) KYC Verification:**
In compliance with Central Bank of the UAE (CBUAE) anti-money laundering regulations:
- **Threshold:** KYC is mandatory for cumulative withdrawals exceeding **$50.00**.
- **Documents Accepted:** Emirates ID (Front & Back) or UAE Residence Visa.
- **Automated AI Scan:** Our Vision AI checks optical holograms, EXIF authenticity, and matches legal names in under 60 seconds.
- **Privacy:** All documents are encrypted with AES-256 and stored strictly in UAE data centers.

👉 Do this now: [Complete Your Emirates ID KYC](/app/wallet) to unlock unlimited withdrawals!`,
    actionLinks: [
      { label: 'Verify Emirates ID Now', url: '/app/wallet' },
    ],
  },
  {
    keywords: ['campaign', 'business', 'sponsor', 'brand', 'create campaign', 'promote', 'advertise'],
    reply: `🏢 **For Businesses & Enterprise Advertisers:**
Grow your brand across local and global communities with 100% verified human engagement:
- **Cascading Targeting:** Country (Worldwide, US, UK, UAE, KSA, EU, etc.) 🌐 → State / Province → City / District → Channel (WhatsApp, LinkedIn, Google Maps, Trustpilot).
- **Escrow Protection:** Your budget is safely locked in automated escrow. Funds are ONLY released after verified proof.
- **Zero Admin Burden:** eBiz AI Vision OCR and our compliance moderation team verify all contributor screenshots—you never have to review thousands of submissions manually!

👉 Do this now: [Launch New Business Campaign](/business/campaigns/new) or learn more on [For Businesses](/for-businesses)!`,
    actionLinks: [
      { label: 'Launch Campaign Wizard', url: '/business/campaigns/new' },
      { label: 'Enterprise Solutions', url: '/for-businesses' },
    ],
  },
  {
    keywords: ['human', 'agent', 'person', 'operator', 'representative', 'live agent', 'talk to human', 'real person', 'support agent'],
    reply: `👨‍💼 **Talk to a human:**
I'm a fully automated assistant — no live agent is connected to this chat right now, and I can't transfer you to one.

If you need a person to investigate your account, re-review a verification decision, or handle an escrow inquiry:
👉 [🎫 Generate a Support Ticket](/contact) or use the **'Create Support Ticket'** form directly in this chat, and a real support specialist will follow up there (typically within 2 hours for general inquiries).`,
    isHumanEscalation: true,
    actionLinks: [
      { label: '🎫 Generate Support Ticket', url: '/contact' },
      { label: 'Visit Contact Desk', url: '/contact' },
    ],
  },
  {
    keywords: ['ticket', 'generate ticket', 'support ticket', 'dispute', 'complaint', 'issue', 'help desk'],
    reply: `🎫 **Official Support Ticket Portal:**
Our Global Operations Desk investigates all priority tickets with a response target of **< 2 hours** (not a guarantee):
- **Common Tickets:** Proof OCR verification disputes, multi-currency bank transfer inquiries, KYC approvals, and Business escrow adjustments.
- **Tracking:** Every ticket receives a canonical tracking ID (e.g. \`#TKT-GLB-8921\`) that you can monitor in real time.

👉 You can [🎫 Click to Generate Support Ticket on Contact Page](/contact) or click the button below to fill out a ticket right inside this chat!`,
    actionLinks: [
      { label: '🎫 Open Support Ticket Page', url: '/contact' },
      { label: 'Contributor Support Center', url: '/app/support' },
    ],
  },
];

export const LiveChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isHumanActive, setIsHumanActive] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);

  // Ticket Form State
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Task Verification Dispute');
  const [ticketPriority, setTicketPriority] = useState<'Normal' | 'High' | 'Urgent'>('High');
  const [ticketDescription, setTicketDescription] = useState('');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { createSupportTicket } = usePlatform();
  const { user } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'agent',
      text: `Hello! 👋 Welcome to the **eBiz AI Live Desk**.

I'm an **automated assistant, not a human agent** — I answer instantly from our help guides. For anything that needs a real person, [🎫 generate a support ticket](/contact) and our support team will follow up with you.

I can help with:
- Earning rewards with 🌐 [Worldwide & Geo-Targeted Tasks](/tasks)
- [Trustpilot & Google Reviews](/tasks)
- [USD Cashouts (auto-convert to local currency)](/app/wallet) & 72h retention hold
- [ID & Profile KYC Verification](/app/wallet)
- [Launching Geo-Targeted Enterprise Campaigns](/business/campaigns/new)

If you wish to speak to a human officer or file an official dispute, you can [🎫 Generate a Support Ticket](/contact) anytime. How can I help you today?`,
      timestamp: 'Just now',
      chips: [
        '🌐 How do geo-targeted & global tasks work?',
        '⭐ How do Trustpilot & Google reviews work?',
        '💳 How do I withdraw funds & currencies?',
        '🛡️ What is the 72-hour retention hold?',
        '🆔 How does KYC identity verification work?',
        '🏢 How do businesses launch campaigns?',
        '👨‍💼 Can I talk to a human agent?',
        '🎫 Generate a Support Ticket',
      ],
      actionLinks: [
        { label: 'Browse Tasks (Earn Rewards)', url: '/tasks' },
        { label: 'Contributor Wallet', url: '/app/wallet' },
      ],
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnreadCount(0);
    }
  }, [isOpen, messages, isTyping, showTicketModal]);

  // Markdown link & bold text parser
  const renderFormattedText = (rawText: string) => {
    const lines = rawText.split('\n');

    return lines.map((line, lineIdx) => {
      // Process markdown links [label](url)
      const parts: React.ReactNode[] = [];
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      let lastIdx = 0;
      let match;

      while ((match = linkRegex.exec(line)) !== null) {
        if (match.index > lastIdx) {
          parts.push(renderBoldText(line.substring(lastIdx, match.index)));
        }
        const label = match[1];
        const url = match[2];
        parts.push(
          <Link
            key={`link-${lineIdx}-${match.index}`}
            to={url}
            onClick={() => {
              if (window.innerWidth < 640) setIsOpen(false);
            }}
            className="inline-flex items-center gap-0.5 font-bold text-emerald-700 hover:text-emerald-950 underline underline-offset-2 decoration-emerald-500 hover:decoration-emerald-700 transition-colors bg-emerald-50 hover:bg-emerald-100/90 px-1.5 py-0.5 rounded text-[11px] sm:text-xs mx-0.5"
          >
            <span>{label}</span>
            <ArrowUpRight className="w-3 h-3 text-emerald-600 inline" />
          </Link>
        );
        lastIdx = match.index + match[0].length;
      }

      if (lastIdx < line.length) {
        parts.push(renderBoldText(line.substring(lastIdx)));
      }

      return (
        <div key={`line-${lineIdx}`} className={line === '' ? 'h-2' : 'min-h-[1.25rem]'}>
          {parts.length > 0 ? parts : renderBoldText(line)}
        </div>
      );
    });
  };

  // Helper for **bold** text
  const renderBoldText = (str: string): React.ReactNode => {
    const boldParts = str.split(/(\*\*[^*]+\*\*)/g);
    return boldParts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-slate-900 dark:text-gray-100">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    // If query requests a ticket directly, open ticket modal
    if (query.toLowerCase().includes('generate a support ticket') || query.toLowerCase().includes('create ticket')) {
      setTimeout(() => {
        setIsTyping(false);
        setShowTicketModal(true);
      }, 500);
      return;
    }

    setTimeout(() => {
      const lower = query.toLowerCase();

      // Find best match in knowledge base
      let matchedEntry = KNOWLEDGE_RESPONSES.find((entry) =>
        entry.keywords.some((kw) => lower.includes(kw))
      );

      let replyText = '';
      let actionLinks: { label: string; url: string }[] | undefined = undefined;
      let isHuman = false;

      if (matchedEntry) {
        replyText = matchedEntry.reply;
        actionLinks = matchedEntry.actionLinks;
        isHuman = !!matchedEntry.isHumanEscalation;
      } else {
        replyText = `Thank you for reaching out regarding: "${query}".

Our AI operations system and Dubai HQ verification desk 🇦🇪 have analyzed your request. On **eBiz Networking**, all tasks and payouts are governed by CBUAE escrow protocols with strict geo-targeting and anti-deletion holds.

Here are key actions you can take right now:
- **Earn Money in USD:** [Browse Verified Tasks](/tasks)
- **Review Platform Tasks:** [Trustpilot & Google Reviews](/tasks)
- **Check Your Balance:** [Contributor Wallet & Payouts](/app/wallet)
- **Launch Campaign for Your Brand:** [Create Business Campaign](/business/campaigns/new)
- **Need Personalized Assistance?** [🎫 Generate a Support Ticket](/contact) to receive human review in < 2 hours.`;

        actionLinks = [
          { label: 'Browse Tasks (Earn USD)', url: '/tasks' },
          { label: 'Contributor Wallet', url: '/app/wallet' },
          { label: '🎫 Generate Support Ticket', url: '/contact' },
        ];
      }

      if (isHuman) {
        setIsHumanActive(true);
      }

      const agentMsg: ChatMessage = {
        id: `agent_${Date.now()}`,
        sender: 'agent',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        chips: [
          '🌐 How do geo-targeted & global tasks work?',
          '💳 How do multi-currency payouts work?',
          '🛡️ What is the 72-hour retention hold?',
          '🎫 Generate a Support Ticket',
        ],
        actionLinks,
        isHumanEscalation: isHuman,
      };

      setMessages((prev) => [...prev, agentMsg]);
      setIsTyping(false);
    }, 800);
  };

  const pushTicketConfirmation = (createdTicket: PlatformSupportTicket, trackUrl: string) => {
    const confirmationMsg: ChatMessage = {
      id: `ticket_confirm_${Date.now()}`,
      sender: 'system',
      text: `✅ **Support Ticket Created Successfully!**\n\nYour ticket **#${createdTicket.id}** is now in our support team's queue.\n\n- **Category:** ${createdTicket.category}\n- **Priority:** ${createdTicket.priority}\n- **Typical first response:** within 2 hours for general inquiries\n\nTrack replies anytime in [My Support Center](${trackUrl}).`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ticketCard: createdTicket,
      actionLinks: [
        { label: 'Track in Support Center', url: trackUrl },
        { label: 'Return to Browse Tasks', url: '/tasks' },
      ],
    };
    setMessages((prev) => [...prev, confirmationMsg]);
  };

  // Submit Support Ticket from Inline Chat Widget
  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDescription.trim()) return;

    setIsSubmittingTicket(true);

    // Signed-in contributors / businesses: real ticket via the API so the
    // support desk (admin → Support) sees it.
    if (user && (user.role === 'contributor' || user.role === 'business')) {
      try {
        const res = await supportApi.create({
          subject: ticketSubject.trim(),
          category: WIDGET_CATEGORY_MAP[ticketCategory] ?? 'general',
          priority: ticketPriority === 'Normal' ? 'normal' : 'high',
          message: ticketDescription.trim(),
        });
        if (!res.success) throw new Error(res.message);
        setShowTicketModal(false);
        setTicketSubject('');
        setTicketDescription('');
        pushTicketConfirmation(
          {
            id: res.data.reference,
            subject: res.data.subject,
            category: ticketCategory,
            priority: ticketPriority,
            status: 'Open',
            statusColor: '',
            userName: user.name,
            userEmail: user.email,
            createdAt: 'Just now',
            updatedAt: 'Just now',
            description: res.data.description ?? ticketDescription,
            assignedAgent: 'eBizEarn Support Desk',
            repliesCount: 1,
            source: user.role === 'business' ? 'business_portal' : 'contributor_portal',
          },
          user.role === 'business' ? '/business/support' : '/app/support'
        );
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            id: `ticket_error_${Date.now()}`,
            sender: 'system',
            text: `⚠️ ${getApiError(err, 'We could not submit your ticket. Please try again or email support@ebizearn.com.')}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } finally {
        setIsSubmittingTicket(false);
      }
      return;
    }

    setTimeout(() => {
      const createdTicket = createSupportTicket({
        subject: ticketSubject,
        category: ticketCategory,
        priority: ticketPriority,
        description: ticketDescription,
        userName: user?.name || 'Guest visitor',
        userEmail: user?.email || '',
        source: 'web_chat',
      });

      setShowTicketModal(false);
      setIsSubmittingTicket(false);
      setTicketSubject('');
      setTicketDescription('');

      const confirmationMsg: ChatMessage = {
        id: `ticket_confirm_${Date.now()}`,
        sender: 'system',
        text: `✅ **Support Ticket Created Successfully!**\n\nYour official ticket **#${createdTicket.id}** has been registered directly into our Dubai Operations moderation queue.\n\n- **Category:** ${createdTicket.category}\n- **Priority:** ${createdTicket.priority}\n- **Assigned Team:** ${createdTicket.assignedAgent}\n- **Typical first response:** within 2 hours for general inquiries\n\nYou can track updates on your ticket anytime in [My Support Center](/app/support) or from the [Contact Page](/contact).`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ticketCard: createdTicket,
        actionLinks: [
          { label: 'Track in Contributor Support', url: '/app/support' },
          { label: 'Return to Browse Tasks', url: '/tasks' },
        ],
      };

      setMessages((prev) => [...prev, confirmationMsg]);
    }, 600);
  };

  return (
    <>
      {/* =========================================================================
          FLOATING LAUNCHER BUTTON: RIGHT SIDE (fixed bottom-5 right-5 z-50)
         ========================================================================= */}
      <div className="fixed bottom-5 right-5 z-50 font-sans select-none">
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-3 bg-gradient-to-r from-emerald-600/90 via-teal-600/90 to-slate-900/90 backdrop-blur-xl text-white px-4 py-3 rounded-full shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 transform hover:-translate-y-1 border border-white/25"
            aria-label="Open eBiz AI Live Chat Assistant"
          >
            <div className="relative">
              <MessageCircle className="w-6 h-6 text-white transition-transform group-hover:scale-110" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-emerald-900 animate-ping" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-300 rounded-full border-2 border-emerald-900" />
            </div>

            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold tracking-wide flex items-center gap-1.5">
                <span>eBiz AI Support</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                <span className="text-[10px] bg-emerald-800/90 text-emerald-100 px-1.5 py-0.2 rounded font-mono font-bold">
                  🇦🇪 UAE
                </span>
              </div>
              <div className="text-[11px] text-emerald-100/90 font-medium">Instant AI Answers & Live Desk</div>
            </div>

            {unreadCount > 0 && (
              <span className="bg-amber-400 text-slate-950 text-xs font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                {unreadCount}
              </span>
            )}
          </button>
        )}

        {/* =========================================================================
            LIVE CHAT WINDOW DRAWER (Right Side)
           ========================================================================= */}
        {isOpen && (
          <div className="w-[calc(100vw-2.5rem)] max-w-[360px] sm:max-w-[430px] max-h-[640px] h-[86vh] bg-white dark:bg-[#0C1322] rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white px-4 py-3.5 flex items-center justify-between border-b border-emerald-500/30 shadow-md">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 flex items-center justify-center font-black text-slate-950 text-base shadow-inner">
                    AI
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full"></span>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-white">eBiz AI Support</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full border border-emerald-400/40 flex items-center gap-1 font-mono font-semibold">
                      <ShieldCheck className="w-2.5 h-2.5" /> Automated
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 flex items-center gap-1.5">
                    {isHumanActive ? (
                      <>
                        <span className="text-emerald-300 font-bold">Human review requested</span>
                        <span className="text-slate-500 dark:text-gray-400">•</span>
                        <span className="text-[11px] text-slate-300">create a ticket for a real-person reply</span>
                      </>
                    ) : (
                      <>
                        <span>Automated assistant</span>
                        <span className="text-slate-500 dark:text-gray-400">•</span>
                        <span className="text-[11px] text-emerald-400 font-medium">not a human agent</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowTicketModal(!showTicketModal)}
                  className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                    showTicketModal
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white/10 hover:bg-white/20 text-emerald-200'
                  }`}
                  title="Generate Support Ticket"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">Ticket</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 dark:text-gray-500 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                  title="Minimize chat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* CBUAE & Escrow Compliance Strip */}
            <div className="bg-emerald-50/90 border-b border-emerald-100/80 px-3.5 py-1.5 text-[11px] text-emerald-900 flex items-center justify-between">
              <div className="flex items-center gap-1.5 truncate">
                <Building2 className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                <span className="truncate font-semibold">CBUAE WPS & Escrow Guaranteed</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase shrink-0">
                T+72h Anti-Fraud
              </span>
            </div>

            {/* Inline Support Ticket Form Drawer */}
            {showTicketModal && (
              <div className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 p-3.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-gray-200">
                    <Ticket className="w-4 h-4 text-emerald-600" />
                    <span>Generate Official Support Ticket</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTicketModal(false)}
                    className="text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-400 text-xs font-bold"
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleSubmitTicket} className="mt-2.5 space-y-2 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-gray-300 mb-0.5">
                      Category
                    </label>
                    <select
                      value={ticketCategory}
                      onChange={(e) => setTicketCategory(e.target.value)}
                      className="w-full bg-white dark:bg-[#0C1322] border border-slate-300 dark:border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-gray-200 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="Task Verification Dispute">🌐 Geo-Targeted Task Dispute (Global / Local)</option>
                      <option value="Payout Inquiry">💳 Multi-Currency Payout & Bank Transfer</option>
                      <option value="KYC Verification">🆔 Identity & Profile KYC Verification</option>
                      <option value="Business Campaign Escrow">🏢 Business Campaign & Escrow</option>
                      <option value="Account & General">⚙️ Account & Technical Support</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-gray-300 mb-0.5">
                        Priority
                      </label>
                      <select
                        value={ticketPriority}
                        onChange={(e) => setTicketPriority(e.target.value as any)}
                        className="w-full bg-white dark:bg-[#0C1322] border border-slate-300 dark:border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-gray-200 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      >
                        <option value="Normal">Normal (SLA {'<'} 6h)</option>
                        <option value="High">High (SLA {'<'} 2h)</option>
                        <option value="Urgent">Urgent (SLA {'<'} 45m)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-gray-300 mb-0.5">
                        Your Identity
                      </label>
                      <input
                        type="text"
                        disabled
                        value={user?.name || 'Verified Member'}
                        className="w-full bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 dark:text-gray-400 font-mono truncate"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-gray-300 mb-0.5">
                      Subject
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. OCR proof re-check for community group post..."
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      className="w-full bg-white dark:bg-[#0C1322] border border-slate-300 dark:border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-gray-200 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-gray-300 mb-0.5">
                      Description & Evidence Details
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Describe your issue with group names, transaction IDs, or links..."
                      value={ticketDescription}
                      onChange={(e) => setTicketDescription(e.target.value)}
                      className="w-full bg-white dark:bg-[#0C1322] border border-slate-300 dark:border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-gray-200 focus:ring-1 focus:ring-emerald-500 focus:outline-none resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-500 dark:text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-600" /> Assigned to Dubai HQ Desk
                    </span>

                    <button
                      type="submit"
                      disabled={isSubmittingTicket || !ticketSubject.trim()}
                      className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow flex items-center gap-1.5"
                    >
                      {isSubmittingTicket ? (
                        <span>Submitting...</span>
                      ) : (
                        <>
                          <span>Submit Ticket</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Message Conversation Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/60">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-none'
                        : msg.sender === 'system'
                        ? 'bg-amber-50/90 text-slate-900 dark:text-gray-100 border border-amber-200 rounded-bl-none'
                        : 'bg-white dark:bg-[#0C1322] text-slate-800 dark:text-gray-200 border border-slate-200 dark:border-white/10 rounded-bl-none'
                    }`}
                  >
                    {/* Render message body with styled links & bolding */}
                    <div className="space-y-1 text-xs sm:text-[12.5px] leading-relaxed">
                      {renderFormattedText(msg.text)}
                    </div>

                    {/* Ticket confirmation card */}
                    {msg.ticketCard && (
                      <div className="mt-3 bg-white dark:bg-[#0C1322] p-3 rounded-xl border border-emerald-200 shadow-sm space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                            #{msg.ticketCard.id}
                          </span>
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            {msg.ticketCard.status}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-900 dark:text-gray-100">{msg.ticketCard.subject}</p>
                        <p className="text-[11px] text-slate-600 dark:text-gray-400 line-clamp-2">{msg.ticketCard.description}</p>
                        <div className="text-[10px] text-slate-500 dark:text-gray-400 pt-1 border-t border-slate-100 flex items-center justify-between">
                          <span>{msg.ticketCard.assignedAgent}</span>
                          <span className="text-emerald-600 font-semibold">{msg.ticketCard.createdAt}</span>
                        </div>
                      </div>
                    )}

                    {/* Proactive Action Buttons ('You do this, you get this') */}
                    {msg.actionLinks && msg.actionLinks.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5">
                        {msg.actionLinks.map((action, aIdx) => (
                          <Link
                            key={aIdx}
                            to={action.url}
                            onClick={() => {
                              if (window.innerWidth < 640) setIsOpen(false);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg shadow-xs hover:shadow transition-all"
                          >
                            <span>{action.label}</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Quick Inquiry Suggestion Chips */}
                    {msg.chips && msg.chips.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-emerald-600" /> Suggested Inquiries
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.chips.map((chip, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSendMessage(chip)}
                              className="text-left text-[11px] bg-slate-100 dark:bg-white/10 hover:bg-emerald-50 text-slate-700 dark:text-gray-300 hover:text-emerald-800 font-medium px-2 py-1 rounded-md border border-slate-200/80 hover:border-emerald-300 transition-colors"
                            >
                              {chip}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-400 dark:text-gray-500 mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400 text-xs pl-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]"></div>
                  <span className="text-[11px] text-slate-600 dark:text-gray-400">
                    {isHumanActive ? 'A support specialist will follow up on your ticket.' : 'eBiz AI is typing...'}
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Navigation Bar */}
            <div className="bg-slate-100/90 border-t border-slate-200 dark:border-white/10 px-3 py-1.5 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                <button
                  type="button"
                  onClick={() => handleSendMessage('Can I talk to a human agent?')}
                  className="shrink-0 flex items-center gap-1 text-[10.5px] font-semibold text-slate-700 dark:text-gray-300 bg-white dark:bg-[#0C1322] hover:bg-slate-50 dark:hover:bg-white/5 border border-slate-300 dark:border-white/20 px-2 py-0.5 rounded-full transition-colors"
                >
                  <Headphones className="w-3 h-3 text-emerald-600" />
                  <span>Talk to Human</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowTicketModal(true)}
                  className="shrink-0 flex items-center gap-1 text-[10.5px] font-semibold text-emerald-800 bg-emerald-100/70 hover:bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full transition-colors"
                >
                  <Ticket className="w-3 h-3 text-emerald-700" />
                  <span>Create Ticket</span>
                </button>

                <Link
                  to="/tasks"
                  onClick={() => {
                    if (window.innerWidth < 640) setIsOpen(false);
                  }}
                  className="shrink-0 flex items-center gap-1 text-[10.5px] font-semibold text-slate-700 dark:text-gray-300 bg-white dark:bg-[#0C1322] hover:bg-slate-50 dark:hover:bg-white/5 border border-slate-300 dark:border-white/20 px-2 py-0.5 rounded-full transition-colors"
                >
                  <Coins className="w-3 h-3 text-amber-500" />
                  <span>Tasks (USD)</span>
                </Link>
              </div>

              <span className="text-[10px] text-slate-400 dark:text-gray-500 font-mono shrink-0 pl-2">24/7 AI Desk</span>
            </div>

            {/* Input Form Bar */}
            <div className="p-3 bg-white dark:bg-[#0C1322] border-t border-slate-200 dark:border-white/10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Ask about global tasks, geo-targeting, payouts, KYC verification..."
                    className="w-full text-xs sm:text-sm pl-3 pr-8 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-[#0C1322] text-slate-800 dark:text-gray-200 transition-colors placeholder:text-slate-400 dark:placeholder:text-gray-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendMessage('Please check my task verification status')}
                    title="Attach Proof / File"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-400"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white p-2.5 rounded-xl shadow-md transition-all flex items-center justify-center"
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 dark:text-gray-500 px-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-600" /> Automated answers • human review via ticket
                </span>
                <span className="font-mono text-[10px] text-slate-400 dark:text-gray-500">eBiz Desk v5.3 • Dubai 🇦🇪</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
