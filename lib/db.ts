import { pool, initMySQLTables } from './mysql';
import { ProductServiceItem } from './catalogData';

export interface InvoiceItem {
  description: string;
  qty: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  businessName?: string;
  clientPhone?: string;
  clientEmail?: string;
  clientAddress?: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: 'paid' | 'partial' | 'unpaid';
  issueDate: string;
  dueDate?: string;
  notes?: string;
  createdAt?: string;
}

export interface AdsPayment {
  id: string;
  invoiceNumber: string;
  businessName: string;
  clientName?: string;
  clientPhone?: string;
  campaignType: 'awareness' | 'message' | 'website';
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: 'paid' | 'partial' | 'due';
  paymentDate: string;
  notes?: string;
  createdAt?: string;
}

export interface ServiceMetric {
  serviceId: string;
  views: number;
  clicks: number;
  lastInteracted?: string;
}

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

// ---------------- SETTINGS (MySQL) ----------------
export async function getSettings(): Promise<TrackingSettings> {
  await initMySQLTables();
  try {
    const [rows]: any = await pool.query('SELECT * FROM settings ORDER BY id DESC LIMIT 1');
    if (rows && rows.length > 0) {
      return {
        gtmId: rows[0].gtm_id || '',
        pixelId: rows[0].pixel_id || '',
        capiAccessToken: rows[0].capi_access_token || '',
        capiTestEventCode: rows[0].capi_test_event_code || ''
      };
    }
  } catch (err) {
    console.error('MySQL getSettings error:', err);
  }
  return { gtmId: '', pixelId: '', capiAccessToken: '', capiTestEventCode: '' };
}

export async function saveSettings(settings: TrackingSettings): Promise<void> {
  await initMySQLTables();
  const [rows]: any = await pool.query('SELECT id FROM settings LIMIT 1');
  if (rows && rows.length > 0) {
    await pool.query(
      'UPDATE settings SET gtm_id = ?, pixel_id = ?, capi_access_token = ?, capi_test_event_code = ? WHERE id = ?',
      [settings.gtmId || '', settings.pixelId || '', settings.capiAccessToken || '', settings.capiTestEventCode || '', rows[0].id]
    );
  } else {
    await pool.query(
      'INSERT INTO settings (gtm_id, pixel_id, capi_access_token, capi_test_event_code) VALUES (?, ?, ?, ?)',
      [settings.gtmId || '', settings.pixelId || '', settings.capiAccessToken || '', settings.capiTestEventCode || '']
    );
  }
}

// ---------------- LEADS (MySQL) ----------------
export async function getLeads(): Promise<Lead[]> {
  await initMySQLTables();
  const [rows]: any = await pool.query('SELECT * FROM leads ORDER BY submitted_at DESC');
  return rows.map((r: any) => ({
    id: r.id,
    fullName: r.full_name,
    businessName: r.business_name || '',
    phone: r.phone,
    email: r.email || '',
    selectedPackageCategory: r.selected_package_category || '',
    selectedItems: typeof r.selected_items === 'string' ? JSON.parse(r.selected_items) : (r.selected_items || []),
    totalEstimatedBudgetBDT: Number(r.total_estimated_budget_bdt) || 0,
    sourcePage: r.source_page || '',
    calculatorMetrics: r.calculator_metrics ? (typeof r.calculator_metrics === 'string' ? JSON.parse(r.calculator_metrics) : r.calculator_metrics) : undefined,
    submittedAt: r.submitted_at instanceof Date ? r.submitted_at.toISOString() : String(r.submitted_at || '')
  }));
}

export async function addLead(lead: Omit<Lead, 'id'>): Promise<Lead> {
  await initMySQLTables();
  const newId = `lead-${Date.now()}`;
  await pool.query(
    `INSERT INTO leads 
     (id, full_name, business_name, phone, email, selected_package_category, selected_items, total_estimated_budget_bdt, source_page, calculator_metrics, submitted_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      newId,
      lead.fullName,
      lead.businessName || '',
      lead.phone,
      lead.email || '',
      lead.selectedPackageCategory || '',
      JSON.stringify(lead.selectedItems || []),
      lead.totalEstimatedBudgetBDT || 0,
      lead.sourcePage || '',
      lead.calculatorMetrics ? JSON.stringify(lead.calculatorMetrics) : null
    ]
  );
  return { ...lead, id: newId, submittedAt: new Date().toISOString() };
}

// ---------------- VISITS (MySQL) ----------------
export async function getVisits(): Promise<Visit[]> {
  await initMySQLTables();
  const [rows]: any = await pool.query('SELECT * FROM visits ORDER BY timestamp DESC LIMIT 1000');
  return rows.map((r: any) => ({
    timestamp: r.timestamp instanceof Date ? r.timestamp.toISOString() : String(r.timestamp || ''),
    path: r.path,
    referrer: r.referrer,
    userAgent: r.user_agent,
    ip: r.ip
  }));
}

export async function addVisit(visit: Visit): Promise<void> {
  await initMySQLTables();
  await pool.query(
    'INSERT INTO visits (path, referrer, user_agent, ip, timestamp) VALUES (?, ?, ?, ?, NOW())',
    [visit.path || '/', visit.referrer || 'direct', visit.userAgent || '', visit.ip || '']
  );
}

// ---------------- SERVICES (MySQL) ----------------
export async function getServices(): Promise<ProductServiceItem[]> {
  await initMySQLTables();
  const [rows]: any = await pool.query('SELECT * FROM services ORDER BY priority DESC, created_at DESC');
  return rows.map((r: any) => ({
    id: r.id,
    slug: r.slug,
    category: r.category,
    title: r.title,
    tagline: r.tagline || '',
    pricing: {
      basePriceBDT: Number(r.base_price_bdt) || 0,
      billingType: (r.billing_type as any) || 'one_time'
    },
    priority: Number(r.priority) || 0,
    deliveryTimeDays: Number(r.delivery_time_days) || 5,
    demoUrl: r.demo_url || '',
    videoUrl: r.video_url || '',
    imageUrl: r.image_url || '',
    topBadges: typeof r.top_badges === 'string' ? JSON.parse(r.top_badges) : (r.top_badges || []),
    subBadges: typeof r.sub_badges === 'string' ? JSON.parse(r.sub_badges) : (r.sub_badges || []),
    techBadges: typeof r.tech_badges === 'string' ? JSON.parse(r.tech_badges) : (r.tech_badges || []),
    featuresIncluded: typeof r.features_included === 'string' ? JSON.parse(r.features_included) : (r.features_included || []),
    featuresExcluded: [],
    isPopular: Boolean(r.is_popular)
  }));
}

export async function addService(s: Omit<ProductServiceItem, 'id'>): Promise<ProductServiceItem> {
  await initMySQLTables();
  const id = `service-${Date.now()}`;
  const basePrice = s.pricing?.basePriceBDT !== undefined ? Number(s.pricing.basePriceBDT) : (Number((s as any).basePriceBDT) || 0);
  const billingType = s.pricing?.billingType || 'one_time';
  await pool.query(
    `INSERT INTO services 
     (id, slug, category, title, tagline, base_price_bdt, billing_type, priority, delivery_time_days, demo_url, video_url, image_url, top_badges, sub_badges, tech_badges, features_included, is_popular)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      s.slug || '',
      s.category,
      s.title,
      s.tagline || '',
      basePrice,
      billingType,
      Number(s.priority) || 0,
      Number(s.deliveryTimeDays) || 5,
      s.demoUrl || '',
      s.videoUrl || '',
      s.imageUrl || '',
      JSON.stringify(s.topBadges || []),
      JSON.stringify(s.subBadges || []),
      JSON.stringify(s.techBadges || []),
      JSON.stringify(s.featuresIncluded || []),
      s.isPopular ? 1 : 0
    ]
  );
  return { ...s, id };
}

export async function updateService(id: string, updated: any): Promise<void> {
  await initMySQLTables();
  const fields: string[] = [];
  const values: any[] = [];

  if (updated.title !== undefined) { fields.push('title = ?'); values.push(updated.title); }
  if (updated.category !== undefined) { fields.push('category = ?'); values.push(updated.category); }
  if (updated.slug !== undefined) { fields.push('slug = ?'); values.push(updated.slug); }
  if (updated.tagline !== undefined) { fields.push('tagline = ?'); values.push(updated.tagline); }
  if (updated.pricing?.basePriceBDT !== undefined) { fields.push('base_price_bdt = ?'); values.push(Number(updated.pricing.basePriceBDT)); }
  if (updated.basePriceBDT !== undefined) { fields.push('base_price_bdt = ?'); values.push(Number(updated.basePriceBDT)); }
  if (updated.pricing?.billingType !== undefined) { fields.push('billing_type = ?'); values.push(updated.pricing.billingType); }
  if (updated.priority !== undefined) { fields.push('priority = ?'); values.push(Number(updated.priority)); }
  if (updated.deliveryTimeDays !== undefined) { fields.push('delivery_time_days = ?'); values.push(Number(updated.deliveryTimeDays)); }
  if (updated.demoUrl !== undefined) { fields.push('demo_url = ?'); values.push(updated.demoUrl); }
  if (updated.videoUrl !== undefined) { fields.push('video_url = ?'); values.push(updated.videoUrl); }
  if (updated.imageUrl !== undefined) { fields.push('image_url = ?'); values.push(updated.imageUrl); }
  if (updated.topBadges !== undefined) { fields.push('top_badges = ?'); values.push(JSON.stringify(updated.topBadges)); }
  if (updated.subBadges !== undefined) { fields.push('sub_badges = ?'); values.push(JSON.stringify(updated.subBadges)); }
  if (updated.techBadges !== undefined) { fields.push('tech_badges = ?'); values.push(JSON.stringify(updated.techBadges)); }
  if (updated.featuresIncluded !== undefined) { fields.push('features_included = ?'); values.push(JSON.stringify(updated.featuresIncluded)); }
  if (updated.isPopular !== undefined) { fields.push('is_popular = ?'); values.push(updated.isPopular ? 1 : 0); }

  if (fields.length === 0) return;
  values.push(id);
  await pool.query(`UPDATE services SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function deleteService(id: string): Promise<void> {
  await initMySQLTables();
  await pool.query('DELETE FROM services WHERE id = ?', [id]);
}

// ---------------- PRICING PLANS (MySQL) ----------------
export async function getPricingPlans(): Promise<PricingPlan[]> {
  await initMySQLTables();
  const [rows]: any = await pool.query('SELECT * FROM pricing_plans ORDER BY created_at ASC');
  return rows.map((r: any) => ({
    id: r.id,
    slug: r.slug,
    category: r.category,
    title: r.title,
    tagline: r.tagline || '',
    pricing: {
      basePriceBDT: Number(r.base_price_bdt) || 0,
      billingType: (r.billing_type as any) || 'one_time'
    },
    deliveryTimeDays: Number(r.delivery_time_days) || 5,
    featuresIncluded: typeof r.features_included === 'string' ? JSON.parse(r.features_included) : (r.features_included || []),
    techBadges: typeof r.tech_badges === 'string' ? JSON.parse(r.tech_badges) : (r.tech_badges || []),
    isPopular: Boolean(r.is_popular)
  }));
}

export async function addPricingPlan(plan: Omit<PricingPlan, 'id'>): Promise<PricingPlan> {
  await initMySQLTables();
  const id = `plan-${Date.now()}`;
  const basePrice = plan.pricing?.basePriceBDT !== undefined ? Number(plan.pricing.basePriceBDT) : 0;
  const billingType = plan.pricing?.billingType || 'one_time';
  await pool.query(
    `INSERT INTO pricing_plans 
     (id, slug, category, title, tagline, base_price_bdt, billing_type, delivery_time_days, features_included, tech_badges, is_popular)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      plan.slug || '',
      plan.category,
      plan.title,
      plan.tagline || '',
      basePrice,
      billingType,
      Number(plan.deliveryTimeDays) || 5,
      JSON.stringify(plan.featuresIncluded || []),
      JSON.stringify(plan.techBadges || []),
      plan.isPopular ? 1 : 0
    ]
  );
  return { ...plan, id };
}

export async function updatePricingPlan(id: string, updated: Partial<PricingPlan>): Promise<void> {
  await initMySQLTables();
  const fields: string[] = [];
  const values: any[] = [];

  if (updated.title !== undefined) { fields.push('title = ?'); values.push(updated.title); }
  if (updated.category !== undefined) { fields.push('category = ?'); values.push(updated.category); }
  if (updated.slug !== undefined) { fields.push('slug = ?'); values.push(updated.slug); }
  if (updated.tagline !== undefined) { fields.push('tagline = ?'); values.push(updated.tagline); }
  if (updated.pricing?.basePriceBDT !== undefined) { fields.push('base_price_bdt = ?'); values.push(Number(updated.pricing.basePriceBDT)); }
  if (updated.pricing?.billingType !== undefined) { fields.push('billing_type = ?'); values.push(updated.pricing.billingType); }
  if (updated.deliveryTimeDays !== undefined) { fields.push('delivery_time_days = ?'); values.push(Number(updated.deliveryTimeDays)); }
  if (updated.featuresIncluded !== undefined) { fields.push('features_included = ?'); values.push(JSON.stringify(updated.featuresIncluded)); }
  if (updated.techBadges !== undefined) { fields.push('tech_badges = ?'); values.push(JSON.stringify(updated.techBadges)); }
  if (updated.isPopular !== undefined) { fields.push('is_popular = ?'); values.push(updated.isPopular ? 1 : 0); }

  if (fields.length === 0) return;
  values.push(id);
  await pool.query(`UPDATE pricing_plans SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function deletePricingPlan(id: string): Promise<void> {
  await initMySQLTables();
  await pool.query('DELETE FROM pricing_plans WHERE id = ?', [id]);
}

// ---------------- PROJECTS (MySQL) ----------------
export async function getProjects(): Promise<ProjectItem[]> {
  await initMySQLTables();
  const [rows]: any = await pool.query('SELECT * FROM projects ORDER BY priority DESC, created_at DESC');
  return rows.map((r: any) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    clientName: r.client_name,
    tagline: r.tagline || '',
    challenge: r.challenge || '',
    solution: r.solution || '',
    demoUrl: r.demo_url || '',
    imageUrl: r.image_url || '',
    techBadges: typeof r.tech_badges === 'string' ? JSON.parse(r.tech_badges) : (r.tech_badges || []),
    metrics: typeof r.metrics === 'string' ? JSON.parse(r.metrics) : (r.metrics || []),
    priority: Number(r.priority) || 0,
    createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at || '')
  }));
}

export async function addProject(project: Omit<ProjectItem, 'id'>): Promise<ProjectItem> {
  await initMySQLTables();
  const id = `project-${Date.now()}`;
  await pool.query(
    `INSERT INTO projects 
     (id, title, category, client_name, tagline, challenge, solution, demo_url, image_url, tech_badges, metrics, priority, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      id,
      project.title,
      project.category,
      project.clientName,
      project.tagline || '',
      project.challenge || '',
      project.solution || '',
      project.demoUrl || '',
      project.imageUrl || '',
      JSON.stringify(project.techBadges || []),
      JSON.stringify(project.metrics || []),
      Number(project.priority) || 0
    ]
  );
  return { ...project, id, createdAt: new Date().toISOString() };
}

export async function updateProject(id: string, updated: any): Promise<void> {
  await initMySQLTables();
  const fields: string[] = [];
  const values: any[] = [];

  if (updated.title !== undefined) { fields.push('title = ?'); values.push(updated.title); }
  if (updated.category !== undefined) { fields.push('category = ?'); values.push(updated.category); }
  if (updated.clientName !== undefined) { fields.push('client_name = ?'); values.push(updated.clientName); }
  if (updated.tagline !== undefined) { fields.push('tagline = ?'); values.push(updated.tagline); }
  if (updated.challenge !== undefined) { fields.push('challenge = ?'); values.push(updated.challenge); }
  if (updated.solution !== undefined) { fields.push('solution = ?'); values.push(updated.solution); }
  if (updated.demoUrl !== undefined) { fields.push('demo_url = ?'); values.push(updated.demoUrl); }
  if (updated.imageUrl !== undefined) { fields.push('image_url = ?'); values.push(updated.imageUrl); }
  if (updated.techBadges !== undefined) { fields.push('tech_badges = ?'); values.push(JSON.stringify(updated.techBadges)); }
  if (updated.metrics !== undefined) { fields.push('metrics = ?'); values.push(JSON.stringify(updated.metrics)); }
  if (updated.priority !== undefined) { fields.push('priority = ?'); values.push(Number(updated.priority)); }

  if (fields.length === 0) return;
  values.push(id);
  await pool.query(`UPDATE projects SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function deleteProject(id: string): Promise<void> {
  await initMySQLTables();
  await pool.query('DELETE FROM projects WHERE id = ?', [id]);
}

// ---------------- ORDERS (MySQL) ----------------
export async function getOrders(): Promise<Order[]> {
  await initMySQLTables();
  const [rows]: any = await pool.query('SELECT * FROM orders ORDER BY ordered_at DESC');
  return rows.map((r: any) => ({
    id: r.id,
    projectId: r.project_id,
    businessName: r.business_name || '',
    fullName: r.full_name,
    phone: r.phone,
    email: r.email,
    serviceId: r.service_id,
    serviceTitle: r.service_title,
    optionsSelected: typeof r.options_selected === 'string' ? JSON.parse(r.options_selected) : (r.options_selected || {}),
    totalBDT: Number(r.total_bdt) || 0,
    paidAmount: Number(r.paid_amount) || 0,
    dueAmount: Number(r.due_amount) || 0,
    status: r.status,
    paymentStatus: r.payment_status,
    trxId: r.trx_id || '',
    projectNote: r.project_note || '',
    isDeleted: Boolean(r.is_deleted),
    orderedAt: r.ordered_at instanceof Date ? r.ordered_at.toISOString() : String(r.ordered_at || '')
  }));
}

export async function addOrder(order: Omit<Order, 'id' | 'status' | 'orderedAt'> & { status?: Order['status'] }): Promise<Order> {
  await initMySQLTables();
  const id = `order-${Date.now()}`;
  const [countRows]: any = await pool.query('SELECT COUNT(*) as cnt FROM orders');
  const projectNumber = 1001 + (countRows[0]?.cnt || 0);
  const projectId = order.projectId || `ZEN-${projectNumber}`;

  const total = Number(order.totalBDT) || 0;
  const paid = Number(order.paidAmount) || 0;
  const due = total - paid;
  const status = order.status || 'pending';
  const paymentStatus = order.paymentStatus || (paid >= total && total > 0 ? 'paid' : paid > 0 ? 'partial' : 'unpaid');

  await pool.query(
    `INSERT INTO orders 
     (id, project_id, business_name, full_name, phone, email, service_id, service_title, options_selected, total_bdt, paid_amount, due_amount, status, payment_status, trx_id, project_note, is_deleted, ordered_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NOW())`,
    [
      id,
      projectId,
      order.businessName || '',
      order.fullName,
      order.phone,
      order.email,
      order.serviceId,
      order.serviceTitle,
      JSON.stringify(order.optionsSelected || {}),
      total,
      paid,
      due,
      status,
      paymentStatus,
      order.trxId || '',
      order.projectNote || ''
    ]
  );

  return {
    ...order,
    id,
    projectId,
    totalBDT: total,
    paidAmount: paid,
    dueAmount: due,
    status,
    paymentStatus,
    isDeleted: false,
    orderedAt: new Date().toISOString()
  };
}

export async function updateOrder(id: string, updatedFields: Partial<Order>): Promise<void> {
  await initMySQLTables();
  const [rows]: any = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
  if (!rows || rows.length === 0) return;
  const cur = rows[0];

  const total = updatedFields.totalBDT !== undefined ? Number(updatedFields.totalBDT) : Number(cur.total_bdt);
  const paid = updatedFields.paidAmount !== undefined ? Number(updatedFields.paidAmount) : Number(cur.paid_amount);
  const due = total - paid;

  const fields: string[] = [];
  const values: any[] = [];

  if (updatedFields.status !== undefined) {
    fields.push('status = ?');
    values.push(updatedFields.status);
    if (updatedFields.status !== 'trash') {
      fields.push('is_deleted = 0');
    }
  }
  if (updatedFields.paymentStatus !== undefined) { fields.push('payment_status = ?'); values.push(updatedFields.paymentStatus); }
  if (updatedFields.totalBDT !== undefined) { fields.push('total_bdt = ?'); values.push(total); }
  if (updatedFields.paidAmount !== undefined) { fields.push('paid_amount = ?'); values.push(paid); }
  fields.push('due_amount = ?'); values.push(due);
  if (updatedFields.trxId !== undefined) { fields.push('trx_id = ?'); values.push(updatedFields.trxId); }
  if (updatedFields.projectNote !== undefined) { fields.push('project_note = ?'); values.push(updatedFields.projectNote); }
  if (updatedFields.businessName !== undefined) { fields.push('business_name = ?'); values.push(updatedFields.businessName); }
  if (updatedFields.fullName !== undefined) { fields.push('full_name = ?'); values.push(updatedFields.fullName); }
  if (updatedFields.phone !== undefined) { fields.push('phone = ?'); values.push(updatedFields.phone); }
  if (updatedFields.email !== undefined) { fields.push('email = ?'); values.push(updatedFields.email); }
  if (updatedFields.isDeleted !== undefined) { fields.push('is_deleted = ?'); values.push(updatedFields.isDeleted ? 1 : 0); }

  if (fields.length === 0) return;
  values.push(id);
  await pool.query(`UPDATE orders SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function deleteOrder(id: string): Promise<void> {
  await initMySQLTables();
  await pool.query("UPDATE orders SET is_deleted = 1, status = 'trash' WHERE id = ?", [id]);
}

export async function restoreOrder(id: string): Promise<void> {
  await initMySQLTables();
  await pool.query("UPDATE orders SET is_deleted = 0, status = 'pending' WHERE id = ?", [id]);
}

export async function updateOrderStatus(id: string, status: Order['status']): Promise<void> {
  await updateOrder(id, { status });
}

// ---------------- INVOICES (MySQL) ----------------
export async function getInvoices(): Promise<Invoice[]> {
  await initMySQLTables();
  const [rows]: any = await pool.query('SELECT * FROM invoices ORDER BY created_at DESC');
  return rows.map((r: any) => ({
    id: r.id,
    invoiceNumber: r.invoice_number,
    clientName: r.client_name,
    businessName: r.business_name || '',
    clientPhone: r.client_phone || '',
    clientEmail: r.client_email || '',
    clientAddress: r.client_address || '',
    items: typeof r.items === 'string' ? JSON.parse(r.items) : (r.items || []),
    subtotal: Number(r.subtotal) || 0,
    discount: Number(r.discount) || 0,
    tax: Number(r.tax) || 0,
    totalAmount: Number(r.total_amount) || 0,
    paidAmount: Number(r.paid_amount) || 0,
    dueAmount: Number(r.due_amount) || 0,
    status: r.status,
    issueDate: r.issue_date instanceof Date ? r.issue_date.toISOString().split('T')[0] : String(r.issue_date || ''),
    dueDate: r.due_date ? (r.due_date instanceof Date ? r.due_date.toISOString().split('T')[0] : String(r.due_date)) : '',
    notes: r.notes || '',
    createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at || '')
  }));
}

export const getInvoicesAsync = getInvoices;

export async function addInvoice(invoice: Omit<Invoice, 'id' | 'createdAt'>): Promise<Invoice> {
  await initMySQLTables();
  const id = `inv-${Date.now()}`;
  const subtotal = Number(invoice.subtotal) || 0;
  const discount = Number(invoice.discount) || 0;
  const tax = Number(invoice.tax) || 0;
  const totalAmount = Number(invoice.totalAmount ?? (subtotal - discount + tax)) || 0;
  const paidAmount = Number(invoice.paidAmount) || 0;
  const dueAmount = totalAmount - paidAmount;

  let status = invoice.status;
  if (!status) {
    if (paidAmount >= totalAmount && totalAmount > 0) status = 'paid';
    else if (paidAmount > 0) status = 'partial';
    else status = 'unpaid';
  }

  await pool.query(
    `INSERT INTO invoices 
     (id, invoice_number, client_name, business_name, client_phone, client_email, client_address, items, subtotal, discount, tax, total_amount, paid_amount, due_amount, status, issue_date, due_date, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      id,
      invoice.invoiceNumber,
      invoice.clientName,
      invoice.businessName || '',
      invoice.clientPhone || '',
      invoice.clientEmail || '',
      invoice.clientAddress || '',
      JSON.stringify(invoice.items || []),
      subtotal,
      discount,
      tax,
      totalAmount,
      paidAmount,
      dueAmount,
      status,
      invoice.issueDate,
      invoice.dueDate || null,
      invoice.notes || ''
    ]
  );

  return {
    ...invoice,
    id,
    subtotal,
    discount,
    tax,
    totalAmount,
    paidAmount,
    dueAmount,
    status,
    createdAt: new Date().toISOString()
  };
}

export async function updateInvoice(id: string, updated: Partial<Invoice>): Promise<void> {
  await initMySQLTables();
  const fields: string[] = [];
  const values: any[] = [];

  if (updated.invoiceNumber !== undefined) { fields.push('invoice_number = ?'); values.push(updated.invoiceNumber); }
  if (updated.clientName !== undefined) { fields.push('client_name = ?'); values.push(updated.clientName); }
  if (updated.businessName !== undefined) { fields.push('business_name = ?'); values.push(updated.businessName); }
  if (updated.clientPhone !== undefined) { fields.push('client_phone = ?'); values.push(updated.clientPhone); }
  if (updated.clientEmail !== undefined) { fields.push('client_email = ?'); values.push(updated.clientEmail); }
  if (updated.clientAddress !== undefined) { fields.push('client_address = ?'); values.push(updated.clientAddress); }
  if (updated.items !== undefined) { fields.push('items = ?'); values.push(JSON.stringify(updated.items)); }
  if (updated.subtotal !== undefined) { fields.push('subtotal = ?'); values.push(Number(updated.subtotal)); }
  if (updated.discount !== undefined) { fields.push('discount = ?'); values.push(Number(updated.discount)); }
  if (updated.tax !== undefined) { fields.push('tax = ?'); values.push(Number(updated.tax)); }
  if (updated.totalAmount !== undefined) { fields.push('total_amount = ?'); values.push(Number(updated.totalAmount)); }
  if (updated.paidAmount !== undefined) { fields.push('paid_amount = ?'); values.push(Number(updated.paidAmount)); }
  if (updated.dueAmount !== undefined) { fields.push('due_amount = ?'); values.push(Number(updated.dueAmount)); }
  if (updated.status !== undefined) { fields.push('status = ?'); values.push(updated.status); }
  if (updated.issueDate !== undefined) { fields.push('issue_date = ?'); values.push(updated.issueDate); }
  if (updated.dueDate !== undefined) { fields.push('due_date = ?'); values.push(updated.dueDate || null); }
  if (updated.notes !== undefined) { fields.push('notes = ?'); values.push(updated.notes); }

  if (fields.length === 0) return;
  values.push(id);
  await pool.query(`UPDATE invoices SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function deleteInvoice(id: string): Promise<void> {
  await initMySQLTables();
  await pool.query('DELETE FROM invoices WHERE id = ?', [id]);
}

// ---------------- ADS PAYMENTS (MySQL) ----------------
export async function getAdsPayments(): Promise<AdsPayment[]> {
  await initMySQLTables();
  const [rows]: any = await pool.query('SELECT * FROM ads_payments ORDER BY payment_date DESC, created_at DESC');
  return rows.map((r: any) => ({
    id: r.id,
    invoiceNumber: r.invoice_number,
    businessName: r.business_name,
    clientName: r.client_name || '',
    clientPhone: r.client_phone || '',
    campaignType: r.campaign_type,
    totalAmount: Number(r.total_amount) || 0,
    paidAmount: Number(r.paid_amount) || 0,
    dueAmount: Number(r.due_amount) || 0,
    status: r.status,
    paymentDate: r.payment_date instanceof Date ? r.payment_date.toISOString().split('T')[0] : String(r.payment_date || ''),
    notes: r.notes || '',
    createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at || '')
  }));
}

export const getAdsPaymentsAsync = getAdsPayments;

export async function addAdsPayment(item: Omit<AdsPayment, 'id' | 'createdAt'>): Promise<AdsPayment> {
  await initMySQLTables();
  const id = `ads-${Date.now()}`;
  const total = Number(item.totalAmount) || 0;
  const paid = Number(item.paidAmount) || 0;
  const due = total - paid;
  let status = item.status;
  if (!status) {
    if (paid >= total && total > 0) status = 'paid';
    else if (paid > 0) status = 'partial';
    else status = 'due';
  }

  await pool.query(
    `INSERT INTO ads_payments 
     (id, invoice_number, business_name, client_name, client_phone, campaign_type, total_amount, paid_amount, due_amount, status, payment_date, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      id,
      item.invoiceNumber,
      item.businessName,
      item.clientName || '',
      item.clientPhone || '',
      item.campaignType || 'website',
      total,
      paid,
      due,
      status,
      item.paymentDate,
      item.notes || ''
    ]
  );

  return {
    ...item,
    id,
    totalAmount: total,
    paidAmount: paid,
    dueAmount: due,
    status,
    createdAt: new Date().toISOString()
  };
}

export async function updateAdsPayment(id: string, updated: Partial<AdsPayment>): Promise<void> {
  await initMySQLTables();
  const fields: string[] = [];
  const values: any[] = [];

  if (updated.invoiceNumber !== undefined) { fields.push('invoice_number = ?'); values.push(updated.invoiceNumber); }
  if (updated.businessName !== undefined) { fields.push('business_name = ?'); values.push(updated.businessName); }
  if (updated.clientName !== undefined) { fields.push('client_name = ?'); values.push(updated.clientName); }
  if (updated.clientPhone !== undefined) { fields.push('client_phone = ?'); values.push(updated.clientPhone); }
  if (updated.campaignType !== undefined) { fields.push('campaign_type = ?'); values.push(updated.campaignType); }
  if (updated.totalAmount !== undefined) { fields.push('total_amount = ?'); values.push(Number(updated.totalAmount)); }
  if (updated.paidAmount !== undefined) { fields.push('paid_amount = ?'); values.push(Number(updated.paidAmount)); }
  if (updated.dueAmount !== undefined) { fields.push('due_amount = ?'); values.push(Number(updated.dueAmount)); }
  if (updated.status !== undefined) { fields.push('status = ?'); values.push(updated.status); }
  if (updated.paymentDate !== undefined) { fields.push('payment_date = ?'); values.push(updated.paymentDate); }
  if (updated.notes !== undefined) { fields.push('notes = ?'); values.push(updated.notes); }

  if (fields.length === 0) return;
  values.push(id);
  await pool.query(`UPDATE ads_payments SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function deleteAdsPayment(id: string): Promise<void> {
  await initMySQLTables();
  await pool.query('DELETE FROM ads_payments WHERE id = ?', [id]);
}

// ---------------- USERS (MySQL) ----------------
export async function getUsers(): Promise<UserItem[]> {
  await initMySQLTables();
  const [rows]: any = await pool.query('SELECT * FROM users ORDER BY created_at ASC');
  return rows.map((r: any) => ({
    id: r.id,
    username: r.username,
    passwordHash: r.password_hash,
    role: r.role,
    createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at || '')
  }));
}

export async function addUser(user: Omit<UserItem, 'id' | 'createdAt'>): Promise<UserItem> {
  await initMySQLTables();
  const id = `user-${Date.now()}`;
  await pool.query(
    'INSERT INTO users (id, username, password_hash, role, created_at) VALUES (?, ?, ?, ?, NOW())',
    [id, user.username, user.passwordHash, user.role]
  );
  return { ...user, id, createdAt: new Date().toISOString() };
}

export async function deleteUser(id: string): Promise<void> {
  await initMySQLTables();
  await pool.query('DELETE FROM users WHERE id = ?', [id]);
}

// ---------------- SERVICE METRICS (MySQL) ----------------
export async function recordServiceMetric(serviceId: string, type: 'view' | 'click'): Promise<void> {
  await initMySQLTables();
  const viewInc = type === 'view' ? 1 : 0;
  const clickInc = type === 'click' ? 1 : 0;
  await pool.query(
    `INSERT INTO service_metrics (service_id, views, clicks)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE 
       views = views + VALUES(views),
       clicks = clicks + VALUES(clicks),
       last_interacted = CURRENT_TIMESTAMP`,
    [serviceId, viewInc, clickInc]
  );
}

export async function getServiceMetricsAsync(): Promise<Record<string, { views: number; clicks: number }>> {
  await initMySQLTables();
  const [rows]: any = await pool.query('SELECT service_id, views, clicks FROM service_metrics');
  const metricsMap: Record<string, { views: number; clicks: number }> = {};
  for (const r of rows) {
    metricsMap[r.service_id] = {
      views: Number(r.views) || 0,
      clicks: Number(r.clicks) || 0
    };
  }
  return metricsMap;
}

// ---------------- STATS (MySQL) ----------------
export async function getStats() {
  await initMySQLTables();
  const [visits] = await Promise.all([getVisits()]);
  const [leads, orders, services, projects, pricingPlans, settings, users, invoices, adsPayments, serviceMetrics] = await Promise.all([
    getLeads(),
    getOrders(),
    getServices(),
    getProjects(),
    getPricingPlans(),
    getSettings(),
    getUsers(),
    getInvoices(),
    getAdsPayments(),
    getServiceMetricsAsync()
  ]);

  const totalVisits = visits.length;
  const uniqueIps = new Set(visits.map(v => v.ip)).size;
  const totalLeads = leads.length;
  const conversionRate = totalVisits > 0 ? ((totalLeads + orders.length) / totalVisits) * 100 : 0;

  const pathViews: Record<string, number> = {};
  visits.forEach(v => {
    pathViews[v.path] = (pathViews[v.path] || 0) + 1;
  });

  const referrers: Record<string, number> = {};
  visits.forEach(v => {
    const ref = v.referrer || 'direct';
    referrers[ref] = (referrers[ref] || 0) + 1;
  });

  const totalRevenue = orders
    .filter(o => o.status === 'complete')
    .reduce((sum, o) => sum + o.totalBDT, 0);

  return {
    totalVisits,
    uniqueVisitors: uniqueIps,
    totalLeads,
    totalOrders: orders.length,
    totalRevenue,
    conversionRate: Number(conversionRate.toFixed(2)),
    pathViews,
    referrers,
    leads,
    orders,
    services,
    projects,
    pricingPlans,
    settings,
    users,
    invoices,
    adsPayments,
    serviceMetrics
  };
}
