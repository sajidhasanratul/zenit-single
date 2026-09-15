import fs from 'fs';
import path from 'path';
import { CATALOG_PRODUCTS, ProductServiceItem } from './catalogData';

export interface TrackingSettings {
  gtmId: string;
  pixelId: string;
  capiAccessToken: string;
  capiTestEventCode: string;
}

export interface Lead {
  id: string;
  fullName: string;
  businessName: string;
  phone: string;
  email?: string;
  selectedPackageCategory: string;
  selectedItems: string[];
  totalEstimatedBudgetBDT: number;
  sourcePage: string;
  calculatorMetrics?: {
    monthlyTraffic: number;
    currentConversionRate: number;
    projectedRevenueIncrease: number;
  };
  submittedAt: string;
}

export interface Visit {
  timestamp: string;
  path: string;
  referrer: string;
  userAgent: string;
  ip: string;
}

export interface BundleSpec {
  id: string;
  selectedItems: string[];
  totalBDT: number;
  timestamp: string;
}

export interface Order {
  id: string;
  projectId?: string;
  businessName?: string;
  fullName: string;
  phone: string;
  email: string;
  serviceId: string;
  serviceTitle: string;
  optionsSelected: {
    platform: string;
    customization: string;
    hosting: string;
    domain: string;
  };
  totalBDT: number;
  paidAmount?: number;
  status: 'pending' | 'confirmed' | 'hold' | 'processing' | 'complete' | 'cancelled' | 'trash';
  paymentStatus?: 'paid' | 'unpaid' | 'partial';
  dueAmount?: number;
  trxId?: string;
  projectNote?: string;
  isDeleted?: boolean;
  orderedAt: string;
}

export interface PricingPlan {
  id: string;
  slug: string;
  category: string;
  title: string;
  tagline: string;
  pricing: {
    basePriceBDT: number;
    billingType: 'one_time' | 'monthly_retainer';
  };
  deliveryTimeDays: number;
  featuresIncluded: string[];
  techBadges: string[];
  isPopular?: boolean;
}

export interface UserItem {
  id: string;
  username: string;
  passwordHash: string;
  role: 'admin' | 'manager';
  createdAt: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  category: string;
  clientName: string;
  tagline: string;
  challenge?: string;
  solution?: string;
  demoUrl?: string;
  imageUrl?: string;
  techBadges: string[];
  metrics?: {
    label: string;
    before: string;
    after: string;
    lift: string;
  }[];
  priority?: number;
  createdAt?: string;
}

export const DEFAULT_PROJECTS: ProjectItem[] = [
  {
    id: 'case-apex-ecom',
    category: 'web_dev',
    clientName: 'Apex E-Commerce BD',
    title: 'Migrating Legacy WordPress Store to Next.js Engine',
    tagline: 'How speed optimization reduced cart bounce rates and scaled transactions.',
    challenge: 'Apex suffered from slow page paints (LCP: 4.8 seconds), causing a 38% cart abandonment rate on mobile traffic and a poor Lighthouse performance score (32/100).',
    solution: 'Rebuilt their catalog stack on Next.js App Router on Vercel CDN. Configured static generation for products index and dynamic checkout flows with local Steafast Courier hooks.',
    demoUrl: 'https://skcomart.com',
    imageUrl: '',
    metrics: [
      { label: 'Page Load Speed', before: '4.8s', after: '0.4s', lift: '91% Decrease' },
      { label: 'Cart Abandonment', before: '38%', after: '12%', lift: '68% Lower' },
      { label: 'Sales Transactions', before: 'Base', after: '1.45x', lift: '45% Growth' }
    ],
    techBadges: ['Next.js', 'PostCSS', 'Steadfast API', 'Vercel Edge'],
    priority: 10,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'case-meta-attributions',
    category: 'meta_ads',
    clientName: 'NextGen Retailers',
    title: 'Meta Pixel Conversions API (CAPI) Integration',
    tagline: 'Regaining 30%+ lost pixel signals caused by ad blockers and iOS 14 policies.',
    challenge: 'iOS 14 privacy parameters and browser ad blockers blocked up to 35% of client-side purchase pixels, leaving ad campaigns under-attributed and causing high CPA.',
    solution: 'Established a secure server-side tracking pipe. Events (Purchase, Lead, ViewContent) are dispatched directly from the Next.js server with unique event_id deduplication keys.',
    demoUrl: '',
    imageUrl: '',
    metrics: [
      { label: 'Event Match Score', before: '4.2/10', after: '9.4/10', lift: '123% Increase' },
      { label: 'Attributed Sales', before: '65%', after: '100%', lift: '35% Found' },
      { label: 'Cost Per Purchase', before: '৳320', after: '৳195', lift: '39% Lower CPA' }
    ],
    techBadges: ['Conversions API', 'GTM Server-side', 'Node.js'],
    priority: 8,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'case-ai-automation',
    category: 'ai_automation',
    clientName: 'Dhaka Logistics Hub',
    title: 'WhatsApp NLP AI Sales & CRM Integration',
    tagline: 'Automating customer support queries and booking calendar syncs 24/7.',
    challenge: 'Customer support teams spent 5+ hours daily responding manually to FAQs and courier bookings, delaying response times and losing potential leads overnight.',
    solution: 'Built a custom WhatsApp Cloud NLP agent synced directly to their Google Sheets and Notion CRM. The bot qualifies leads and books appointments autonomously.',
    demoUrl: '',
    imageUrl: '',
    metrics: [
      { label: 'Response Latency', before: '4 hrs', after: 'Instant', lift: '99.9% Faster' },
      { label: 'Qualified Leads', before: '100%', after: '3.4x', lift: '240% Volume' },
      { label: 'Support Overhead', before: '5 hrs', after: '0.5 hrs', lift: '90% Saved' }
    ],
    techBadges: ['OpenAI Assistant', 'Make.com', 'Notion Webhooks', 'WhatsApp API'],
    priority: 6,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export interface DatabaseSchema {
  settings: TrackingSettings;
  leads: Lead[];
  visits: Visit[];
  bundleSpecs: BundleSpec[];
  services: ProductServiceItem[];
  pricingPlans: PricingPlan[];
  orders: Order[];
  users?: UserItem[];
  projects?: ProjectItem[];
}

const DB_FILE = path.join(process.cwd(), 'data', 'db.json');

function initializeDb() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const defaultData: DatabaseSchema = {
    settings: {
      gtmId: 'GTM-DEMO123',
      pixelId: 'PIXEL-DEMO123',
      capiAccessToken: '',
      capiTestEventCode: 'TEST12345'
    },
    leads: [
      {
        id: 'lead-1',
        fullName: 'Tanvir Rahman',
        businessName: 'Apex E-com BD',
        phone: '+8801712345678',
        email: 'tanvir@apex.com.bd',
        selectedPackageCategory: 'web_dev',
        selectedItems: ['Full E-Commerce Engine'],
        totalEstimatedBudgetBDT: 35000,
        sourcePage: '/',
        submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    visits: [
      ...Array.from({ length: 12 }, (_, i) => ({
        timestamp: new Date(Date.now() - (i * 12 * 60 * 60 * 1000)).toISOString(),
        path: i % 3 === 0 ? '/services' : i % 5 === 0 ? '/about' : '/',
        referrer: 'direct',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        ip: `192.168.1.${10 + i}`
      }))
    ],
    bundleSpecs: [],
    services: CATALOG_PRODUCTS.map(p => ({
      ...p,
      demoUrl: p.demoUrl || 'https://skcomart.com',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      topBadges: p.isPopular ? ['Client Website', 'Premium'] : ['Client Website'],
      subBadges: p.techBadges.slice(0, 2)
    })),
    pricingPlans: [
      {
        id: 'plan-starter',
        slug: 'high-speed-landing-page',
        category: 'Starter Plan',
        title: 'High-Speed Landing Page',
        tagline: 'Ideal for early startups and small brands running active Meta Ads campaigns.',
        pricing: { basePriceBDT: 12000, billingType: 'one_time' },
        deliveryTimeDays: 5,
        featuresIncluded: [
          '1 Page Custom Next.js design',
          'Lighthouse speed index sub-0.5s',
          'Meta Pixel + dynamic GTM scripts',
          'WhatsApp click-to-chat triggers',
          '12-Month support bug warranty'
        ],
        techBadges: ['Next.js', 'Tailwind', 'Vercel'],
        isPopular: false
      },
      {
        id: 'plan-business',
        slug: 'full-ecommerce-engine',
        category: 'Business Plan',
        title: 'Full E-Commerce Engine',
        tagline: 'A comprehensive, sub-second online store setup for retail scale.',
        pricing: { basePriceBDT: 35000, billingType: 'one_time' },
        deliveryTimeDays: 14,
        featuresIncluded: [
          'Full category catalogs & dynamic cart',
          'Steadfast Courier API checkout sync',
          'Server-side Meta Conversions API (CAPI)',
          'Sales dashboard & automated invoices',
          '12-Month support bug warranty'
        ],
        techBadges: ['Next.js', 'Node.js', 'Supabase'],
        isPopular: true
      },
      {
        id: 'plan-enterprise',
        slug: 'enterprise-web-application',
        category: 'Enterprise Plan',
        title: 'Enterprise Custom Portal',
        tagline: 'Bespoke software logic, secure user controls, and advanced database indexes.',
        pricing: { basePriceBDT: 85000, billingType: 'one_time' },
        deliveryTimeDays: 30,
        featuresIncluded: [
          'Postgres databases & RBAC access',
          'Client panel logins & statistics grids',
          'Automated webhook scripts',
          'Dedicated cloud node setups (AWS/DigitalOcean)',
          '12-Month support bug warranty'
        ],
        techBadges: ['Next.js', 'Laravel/Laravel', 'Docker', 'AWS'],
        isPopular: false
      }
    ],
    orders: [
      {
        id: 'order-1',
        fullName: 'Zahid Hasan',
        phone: '01799887766',
        email: 'zahid@hasan.me',
        serviceId: 'prod-landing-page',
        serviceTitle: 'High-Speed Landing Page',
        optionsSelected: {
          platform: 'website',
          customization: 'as_is',
          hosting: 'hosted',
          domain: 'need'
        },
        totalBDT: 16000,
        status: 'pending',
        orderedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ],
    projects: DEFAULT_PROJECTS
  };

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
  } else {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const db = JSON.parse(raw);
      let updated = false;

      // Schema migrations
      if (!db.services) {
        db.services = defaultData.services;
        updated = true;
      } else {
        // Enforce demoUrl / videoUrl / tags on services
        db.services = db.services.map((s: any) => ({
          ...s,
          demoUrl: s.demoUrl || 'https://skcomart.com',
          videoUrl: s.videoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          topBadges: s.topBadges || (s.isPopular ? ['Client Website', 'Premium'] : ['Client Website']),
          subBadges: s.subBadges || s.techBadges.slice(0, 2)
        }));
        updated = true;
      }

      if (!db.pricingPlans) {
        db.pricingPlans = defaultData.pricingPlans;
        updated = true;
      }
      if (!db.orders) {
        db.orders = defaultData.orders;
        updated = true;
      }
      if (!db.projects || !Array.isArray(db.projects) || db.projects.length === 0) {
        db.projects = DEFAULT_PROJECTS;
        updated = true;
      }
      if (!db.users) {
        db.users = [
          {
            id: 'user-admin',
            username: 'admin',
            passwordHash: 'admin123',
            role: 'admin',
            createdAt: new Date().toISOString()
          },
          {
            id: 'user-manager',
            username: 'manager',
            passwordHash: 'manager123',
            role: 'manager',
            createdAt: new Date().toISOString()
          }
        ];
        updated = true;
      }
      if (updated) {
        fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
      }
    } catch (err) {
      console.error('Failed schema migration checklist:', err);
    }
  }
}

export function readDb(): DatabaseSchema {
  initializeDb();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading local JSON db:', err);
    return {
      settings: { gtmId: '', pixelId: '', capiAccessToken: '', capiTestEventCode: '' },
      leads: [],
      visits: [],
      bundleSpecs: [],
      services: [],
      pricingPlans: [],
      orders: [],
      users: []
    };
  }
}

export function writeDb(data: DatabaseSchema): void {
  initializeDb();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local JSON db:', err);
  }
}

export function getSettings(): TrackingSettings {
  return readDb().settings;
}

export function saveSettings(settings: TrackingSettings): void {
  const db = readDb();
  db.settings = settings;
  writeDb(db);
}

export function addLead(lead: Omit<Lead, 'id'>): Lead {
  const db = readDb();
  const newLead: Lead = {
    ...lead,
    id: `lead-${Date.now()}`
  };
  db.leads.unshift(newLead);
  writeDb(db);
  return newLead;
}

export function getLeads(): Lead[] {
  return readDb().leads;
}

export function addVisit(visit: Visit): void {
  const db = readDb();
  db.visits.unshift(visit);
  if (db.visits.length > 1000) {
    db.visits = db.visits.slice(0, 1000);
  }
  writeDb(db);
}

export function getVisits(): Visit[] {
  return readDb().visits;
}

// Services CRUD
export function getServices(): ProductServiceItem[] {
  const services = readDb().services || [];
  return [...services].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
}

export function addService(service: Omit<ProductServiceItem, 'id'>): ProductServiceItem {
  const db = readDb();
  const newService: ProductServiceItem = {
    ...service,
    priority: service.priority !== undefined ? Number(service.priority) : 0,
    id: `service-${Date.now()}`
  };
  db.services.push(newService);
  writeDb(db);
  return newService;
}

export function deleteService(id: string): void {
  const db = readDb();
  db.services = db.services.filter(s => s.id !== id);
  writeDb(db);
}

export function updateService(id: string, updated: any): void {
  const db = readDb();
  const idx = db.services.findIndex(s => s.id === id);
  if (idx !== -1) {
    const current = db.services[idx];
    const newPricing = {
      ...current.pricing,
      ...(updated.pricing || {})
    };
    if (updated.basePriceBDT !== undefined) {
      newPricing.basePriceBDT = Number(updated.basePriceBDT);
    }

    db.services[idx] = {
      ...current,
      ...updated,
      pricing: newPricing,
      priority: updated.priority !== undefined ? Number(updated.priority) : (current.priority ?? 0)
    };
    writeDb(db);
  }
}

// Projects CRUD
export function getProjects(): ProjectItem[] {
  const db = readDb();
  const projects = db.projects || DEFAULT_PROJECTS;
  return [...projects].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
}

export function addProject(project: Omit<ProjectItem, 'id'>): ProjectItem {
  const db = readDb();
  if (!db.projects) {
    db.projects = [...DEFAULT_PROJECTS];
  }
  const newProject: ProjectItem = {
    ...project,
    priority: project.priority !== undefined ? Number(project.priority) : 0,
    createdAt: new Date().toISOString(),
    id: `project-${Date.now()}`
  };
  db.projects.unshift(newProject);
  writeDb(db);
  return newProject;
}

export function updateProject(id: string, updated: any): void {
  const db = readDb();
  if (!db.projects) {
    db.projects = [...DEFAULT_PROJECTS];
  }
  const idx = db.projects.findIndex(p => p.id === id);
  if (idx !== -1) {
    db.projects[idx] = {
      ...db.projects[idx],
      ...updated,
      priority: updated.priority !== undefined ? Number(updated.priority) : (db.projects[idx].priority ?? 0)
    };
    writeDb(db);
  }
}

export function deleteProject(id: string): void {
  const db = readDb();
  if (db.projects) {
    db.projects = db.projects.filter(p => p.id !== id);
    writeDb(db);
  }
}

// Pricing Plans CRUD
export function getPricingPlans(): PricingPlan[] {
  return readDb().pricingPlans;
}

export function updatePricingPlan(id: string, updated: Partial<PricingPlan>): void {
  const db = readDb();
  const idx = db.pricingPlans.findIndex(p => p.id === id);
  if (idx !== -1) {
    db.pricingPlans[idx] = {
      ...db.pricingPlans[idx],
      ...updated
    };
    writeDb(db);
  }
}


export function addPricingPlan(plan: Omit<PricingPlan, 'id'>): PricingPlan {
  const db = readDb();
  const newPlan: PricingPlan = {
    ...plan,
    id: `plan-${Date.now()}`
  };
  db.pricingPlans.push(newPlan);
  writeDb(db);
  return newPlan;
}

export function deletePricingPlan(id: string): void {
  const db = readDb();
  db.pricingPlans = db.pricingPlans.filter(p => p.id !== id);
  writeDb(db);
}

// Orders CRUD
export function getOrders(): Order[] {
  return readDb().orders;
}

export function addOrder(order: Omit<Order, 'id' | 'status' | 'orderedAt'> & { status?: Order['status'] }): Order {
  const db = readDb();
  const projectNumber = 1001 + db.orders.length;
  const generatedId = `ZEN-${projectNumber}`;
  
  const paid = Number(order.paidAmount) || 0;
  const total = Number(order.totalBDT) || 0;
  const due = total - paid;

  const newOrder: Order = {
    ...order,
    projectId: order.projectId || generatedId,
    paidAmount: paid,
    dueAmount: due,
    id: `order-${Date.now()}`,
    status: order.status || 'pending',
    isDeleted: false,
    orderedAt: new Date().toISOString()
  };
  db.orders.unshift(newOrder);
  writeDb(db);
  return newOrder;
}

export function updateOrder(id: string, updatedFields: Partial<Order>): void {
  const db = readDb();
  const index = db.orders.findIndex(o => o.id === id);
  if (index !== -1) {
    const original = db.orders[index];
    const finalFields = { ...updatedFields };

    // Auto calculate due amount if total or paid amount changes
    if ('totalBDT' in finalFields || 'paidAmount' in finalFields) {
      const total = Number(finalFields.totalBDT ?? original.totalBDT) || 0;
      const paid = Number(finalFields.paidAmount ?? original.paidAmount) || 0;
      finalFields.dueAmount = total - paid;
    }

    if (finalFields.status && finalFields.status !== 'trash') {
      finalFields.isDeleted = false;
    }

    db.orders[index] = {
      ...original,
      ...finalFields
    };
    writeDb(db);
  }
}

export function deleteOrder(id: string): void {
  const db = readDb();
  const index = db.orders.findIndex(o => o.id === id);
  if (index !== -1) {
    db.orders[index].isDeleted = true;
    db.orders[index].status = 'trash';
    writeDb(db);
  }
}

export function restoreOrder(id: string): void {
  const db = readDb();
  const index = db.orders.findIndex(o => o.id === id);
  if (index !== -1) {
    db.orders[index].isDeleted = false;
    db.orders[index].status = 'pending';
    writeDb(db);
  }
}

export function updateOrderStatus(id: string, status: Order['status']): void {
  updateOrder(id, { status });
}

export function getStats() {
  const db = readDb();
  const totalVisits = db.visits.length;
  const uniqueIps = new Set(db.visits.map(v => v.ip)).size;
  const totalLeads = db.leads.length;
  const conversionRate = totalVisits > 0 ? ((totalLeads + db.orders.length) / totalVisits) * 100 : 0;
  
  const pathViews: Record<string, number> = {};
  db.visits.forEach(v => {
    pathViews[v.path] = (pathViews[v.path] || 0) + 1;
  });

  const referrers: Record<string, number> = {};
  db.visits.forEach(v => {
    const ref = v.referrer || 'direct';
    referrers[ref] = (referrers[ref] || 0) + 1;
  });

  const totalRevenue = db.orders
    .filter(o => o.status === 'complete')
    .reduce((sum, o) => sum + o.totalBDT, 0);

  return {
    totalVisits,
    uniqueVisitors: uniqueIps,
    totalLeads,
    totalOrders: db.orders.length,
    totalRevenue,
    conversionRate: Number(conversionRate.toFixed(2)),
    pathViews,
    referrers,
    leads: db.leads,
    orders: db.orders,
    services: getServices(),
    projects: getProjects(),
    pricingPlans: db.pricingPlans,
    settings: db.settings,
    users: db.users || []
  };
}

export function getUsers(): UserItem[] {
  const db = readDb();
  return db.users || [];
}

export function addUser(user: Omit<UserItem, 'id' | 'createdAt'>): UserItem {
  const db = readDb();
  if (!db.users) db.users = [];
  
  const newUser: UserItem = {
    ...user,
    id: `user-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  
  db.users.push(newUser);
  writeDb(db);
  return newUser;
}

export function deleteUser(id: string): void {
  const db = readDb();
  if (db.users) {
    db.users = db.users.filter(u => u.id !== id);
    writeDb(db);
  }
}
