export interface ProductServiceItem {
  id: string;
  slug: string;
  category: string;
  title: string;
  tagline: string;
  pricing: {
    basePriceBDT: number;
    billingType: 'one_time' | 'monthly_retainer';
    discountedPriceBDT?: number;
  };
  deliveryTimeDays: number;
  featuresIncluded: string[];
  featuresExcluded?: string[];
  techBadges: string[];
  isPopular?: boolean;
  demoUrl?: string;
  videoUrl?: string;
  topBadges?: string[];
  subBadges?: string[];
  imageUrl?: string;
  priority?: number;
}

export const CATALOG_PRODUCTS: ProductServiceItem[] = [
  // Web Development
  {
    id: 'prod-landing-page',
    slug: 'high-speed-landing-page',
    category: 'web_dev',
    title: 'High-Speed Landing Page',
    tagline: 'Sub-second speed loading landing pages conversion-tuned for high advertising ROAS.',
    pricing: {
      basePriceBDT: 12000,
      billingType: 'one_time',
      discountedPriceBDT: 9500
    },
    deliveryTimeDays: 5,
    featuresIncluded: [
      '1 Custom Page Design & Build',
      'Google Lighthouse Performance score 95+',
      'Full Responsive Layout (Mobile-first)',
      'Meta Pixel + Server-Side CAPI setup',
      'WhatsApp Integration & Click-to-Chat',
      'Contact Forms with Lead Ingestion'
    ],
    featuresExcluded: [
      'Multi-page navigation flow',
      'Add-to-cart or shopping cart engine',
      'Client dashboard log-in interface'
    ],
    techBadges: ['Next.js', 'Tailwind CSS', 'Framer Motion', 'Vercel'],
    isPopular: false
  },
  {
    id: 'prod-ecommerce',
    slug: 'full-ecommerce-engine',
    category: 'web_dev',
    title: 'Full E-Commerce Engine',
    tagline: 'High-converting online store with dynamic cart, local checkout, and shipping API hooks.',
    pricing: {
      basePriceBDT: 35000,
      billingType: 'one_time',
      discountedPriceBDT: 32000
    },
    deliveryTimeDays: 14,
    featuresIncluded: [
      'Full Product Catalog & Categories',
      'Dynamic Sliding Cart & Quick checkout',
      'Local courier integrations (Steadfast, Pathao API)',
      'Automatic fraud warning dashboard',
      'Server-side purchase tracking (Meta CAPI)',
      'Admin order management panel'
    ],
    featuresExcluded: [
      'Multi-vendor marketplace capability',
      'Automated multi-currency taxes'
    ],
    techBadges: ['Next.js', 'Node.js', 'Supabase', 'Steadfast API'],
    isPopular: true
  },
  {
    id: 'prod-enterprise-app',
    slug: 'enterprise-web-application',
    category: 'web_dev',
    title: 'Enterprise Web Application',
    tagline: 'Custom databases, secure user roles, advanced logic, and dedicated server environments.',
    pricing: {
      basePriceBDT: 85000,
      billingType: 'one_time'
    },
    deliveryTimeDays: 30,
    featuresIncluded: [
      'Advanced Postgres Database structure',
      'Secure User Auth & RBAC (Role-based Control)',
      'Custom Analytics & Admin Dashboard metrics',
      'Cron job schedulers & background task engines',
      'API webhook development',
      'Dedicated server deployment (AWS/DigitalOcean)'
    ],
    featuresExcluded: [
      'Free ongoing copywriter services'
    ],
    techBadges: ['Next.js', 'Node/Laravel', 'PostgreSQL', 'Docker', 'AWS'],
    isPopular: false
  },
  // Meta Ads & Tracking
  {
    id: 'prod-meta-capi',
    slug: 'meta-tracking-capi-precision',
    category: 'meta_ads',
    title: 'Meta Tracking & CAPI Precision',
    tagline: 'Bypass ad blockers and browser privacy shields with server-side event tracking.',
    pricing: {
      basePriceBDT: 8000,
      billingType: 'one_time'
    },
    deliveryTimeDays: 3,
    featuresIncluded: [
      'Meta Conversions API (CAPI) Integration',
      'Event Deduplication (Client & Server keys)',
      'Custom Meta Data Layer implementation',
      'Catalog feed diagnostic review',
      'Advanced Matching Setup (hashed emails/phones)'
    ],
    techBadges: ['Meta Conversions API', 'GTM Server-side', 'Node.js'],
    isPopular: true
  },
  {
    id: 'prod-ads-retainer',
    slug: 'meta-ads-growth-retainer',
    category: 'meta_ads',
    title: 'Meta Ads Growth Retainer',
    tagline: 'Scaling your sales through data-driven campaigns, retargeting funnels, and creative splits.',
    pricing: {
      basePriceBDT: 25000,
      billingType: 'monthly_retainer'
    },
    deliveryTimeDays: 30,
    featuresIncluded: [
      'Full Meta Ads account auditing & structuring',
      'High-converting ad copy write-ups',
      'Targeted custom & lookalike audience sets',
      'A/B testing (ad copy, layouts, creatives)',
      'Weekly reports + Monthly alignment meeting',
      'Budget Optimization (CBO & ABO configuration)'
    ],
    techBadges: ['Meta Ads Manager', 'Looker Studio', 'A/B Testing'],
    isPopular: false
  },
  // AI Business Automations
  {
    id: 'prod-ai-bot',
    slug: 'ai-sales-agent-lead-automation',
    category: 'ai_automation',
    title: 'AI Sales Agent & Lead Automation',
    tagline: 'Qualify and capture customers 24/7 on WhatsApp/Messenger and sync instantly to your CRM.',
    pricing: {
      basePriceBDT: 22000,
      billingType: 'one_time'
    },
    deliveryTimeDays: 7,
    featuresIncluded: [
      '24/7 AI Sales conversational assistant',
      'WhatsApp Cloud API/Messenger integration',
      'Lead qualification logic & smart handoff',
      'Instant CRM syncing (Google Sheets, Notion, HubSpot)',
      'Daily AI response report log'
    ],
    techBadges: ['OpenAI / Gemini', 'Make.com / n8n', 'WhatsApp API', 'CRM Webhooks'],
    isPopular: true
  },
  // Digital Products & Templates
  {
    id: 'prod-saas-template',
    slug: 'saas-starter-template',
    category: 'digital_products',
    title: 'SaaS Starter Boilerplate',
    tagline: 'Pre-configured codebase with Authentication, Stripe billing, and dashboard interface.',
    pricing: {
      basePriceBDT: 5000,
      billingType: 'one_time',
      discountedPriceBDT: 4000
    },
    deliveryTimeDays: 1,
    featuresIncluded: [
      'Next.js 14 template',
      'Supabase Authentication built-in',
      'Stripe checkout dynamic pricing route',
      'Tailwind Glassmorphic responsive layouts'
    ],
    techBadges: ['Next.js', 'Supabase Auth', 'Stripe'],
    isPopular: false
  }
];
