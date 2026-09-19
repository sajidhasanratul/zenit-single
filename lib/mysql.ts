import mysql from 'mysql2/promise';

// Connection pool singleton
export const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'zenit_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

let initialized = false;

export async function initMySQLTables(): Promise<void> {
  if (initialized) return;

  try {
    // 1. Settings Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        gtm_id VARCHAR(100) DEFAULT '',
        pixel_id VARCHAR(100) DEFAULT '',
        capi_access_token TEXT,
        capi_test_event_code VARCHAR(100) DEFAULT '',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. Users Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(100) PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin', 'manager') DEFAULT 'manager',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. Services Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS services (
        id VARCHAR(100) PRIMARY KEY,
        slug VARCHAR(200) NOT NULL,
        category VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        tagline TEXT,
        base_price_bdt DECIMAL(12, 2) NOT NULL DEFAULT 0,
        billing_type VARCHAR(50) DEFAULT 'one_time',
        priority INT DEFAULT 0,
        delivery_time_days INT DEFAULT 5,
        demo_url VARCHAR(500) DEFAULT '',
        video_url VARCHAR(500) DEFAULT '',
        image_url VARCHAR(500) DEFAULT '',
        top_badges JSON,
        sub_badges JSON,
        tech_badges JSON,
        features_included JSON,
        is_popular BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. Pricing Plans Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pricing_plans (
        id VARCHAR(100) PRIMARY KEY,
        slug VARCHAR(200) NOT NULL,
        category VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        tagline TEXT,
        base_price_bdt DECIMAL(12, 2) NOT NULL DEFAULT 0,
        billing_type VARCHAR(50) DEFAULT 'one_time',
        delivery_time_days INT DEFAULT 5,
        features_included JSON,
        tech_badges JSON,
        is_popular BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 5. Projects Showcase Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(100) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        client_name VARCHAR(255) NOT NULL,
        tagline TEXT,
        challenge TEXT,
        solution TEXT,
        demo_url VARCHAR(500) DEFAULT '',
        image_url VARCHAR(500) DEFAULT '',
        tech_badges JSON,
        metrics JSON,
        priority INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 6. Orders Table (Service Orders)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(100) PRIMARY KEY,
        project_id VARCHAR(100),
        business_name VARCHAR(255),
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(100) NOT NULL,
        email VARCHAR(255),
        service_id VARCHAR(100),
        service_title VARCHAR(255),
        options_selected JSON,
        total_bdt DECIMAL(12, 2) NOT NULL DEFAULT 0,
        paid_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
        due_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
        status ENUM('pending', 'confirmed', 'hold', 'processing', 'complete', 'cancelled', 'trash') DEFAULT 'pending',
        payment_status ENUM('paid', 'unpaid', 'partial') DEFAULT 'unpaid',
        trx_id VARCHAR(100),
        project_note TEXT,
        is_deleted BOOLEAN DEFAULT FALSE,
        ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 7. Invoices Table (NEW)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id VARCHAR(100) PRIMARY KEY,
        invoice_number VARCHAR(100) UNIQUE NOT NULL,
        client_name VARCHAR(255) NOT NULL,
        business_name VARCHAR(255),
        client_phone VARCHAR(100),
        client_email VARCHAR(255),
        client_address TEXT,
        items JSON NOT NULL,
        subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
        discount DECIMAL(12, 2) NOT NULL DEFAULT 0,
        tax DECIMAL(12, 2) NOT NULL DEFAULT 0,
        total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
        paid_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
        due_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
        status ENUM('paid', 'partial', 'unpaid') DEFAULT 'unpaid',
        issue_date DATE NOT NULL,
        due_date DATE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 8. Ads Payments Table (NEW)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ads_payments (
        id VARCHAR(100) PRIMARY KEY,
        invoice_number VARCHAR(100) NOT NULL,
        business_name VARCHAR(255) NOT NULL,
        client_name VARCHAR(255),
        client_phone VARCHAR(100),
        campaign_type ENUM('awareness', 'message', 'website') NOT NULL DEFAULT 'website',
        total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
        paid_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
        due_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
        status ENUM('paid', 'partial', 'due') DEFAULT 'due',
        payment_date DATE NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 9. Leads Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id VARCHAR(100) PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        business_name VARCHAR(255),
        phone VARCHAR(100) NOT NULL,
        email VARCHAR(255),
        selected_package_category VARCHAR(100),
        selected_items JSON,
        total_estimated_budget_bdt DECIMAL(12, 2),
        source_page VARCHAR(255),
        calculator_metrics JSON,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 10. Visits Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS visits (
        id INT PRIMARY KEY AUTO_INCREMENT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        path VARCHAR(255) NOT NULL,
        referrer VARCHAR(500) DEFAULT 'direct',
        user_agent TEXT,
        ip VARCHAR(100)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 11. Service Metrics Table (Views and Clicks)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS service_metrics (
        service_id VARCHAR(100) PRIMARY KEY,
        views INT DEFAULT 0,
        clicks INT DEFAULT 0,
        last_interacted TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 12. Populate initial default records if MySQL tables are empty
    await seedDefaultDataIfEmpty();

    initialized = true;
    console.log('✅ MySQL tables initialized and connected to dedicated database.');
  } catch (err) {
    console.error('⚠️ MySQL Initialization Notice:', err);
  }
}

async function seedDefaultDataIfEmpty() {
  try {
    // Seed Settings if empty
    const [settingsRows]: any = await pool.query('SELECT COUNT(*) as count FROM settings');
    if (settingsRows[0].count === 0) {
      await pool.query(
        'INSERT INTO settings (id, gtm_id, pixel_id, capi_access_token, capi_test_event_code) VALUES (1, ?, ?, ?, ?)',
        ['GTM-DEMO123', 'PIXEL-DEMO123', '', 'TEST12345']
      );
    }

    // Seed Users if empty
    const [userRows]: any = await pool.query('SELECT COUNT(*) as count FROM users');
    if (userRows[0].count === 0) {
      await pool.query(`
        INSERT IGNORE INTO users (id, username, password_hash, role) VALUES 
        ('usr-admin', 'admin', 'admin123', 'admin'),
        ('usr-manager', 'manager', 'manager123', 'manager')
      `);
    }

    // Seed Services if empty
    const [serviceRows]: any = await pool.query('SELECT COUNT(*) as count FROM services');
    if (serviceRows[0].count === 0) {
      await pool.query(`
        INSERT IGNORE INTO services 
        (id, slug, category, title, tagline, base_price_bdt, billing_type, priority, delivery_time_days, demo_url, video_url, image_url, top_badges, sub_badges, tech_badges, features_included, is_popular) 
        VALUES 
        ('prod-landing-page', 'high-speed-landing-page', 'web_dev', 'High-Speed Next.js Landing Page', 'Lighthouse 95+ performance single page site tailored for maximum Meta ad ROAS.', 12000.00, 'one_time', 10, 5, 'https://skcomart.com', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '', '["Client Website", "Popular"]', '["Next.js", "Tailwind"]', '["Next.js", "Tailwind", "Vercel Edge", "PostCSS"]', '["Lighthouse 95+ guaranteed speed score", "Meta Pixel + Conversions API (CAPI) ready", "Mobile responsive & fluid layout", "WhatsApp click-to-chat integration", "12 Months free technical bug support"]', 1),
        ('prod-ecommerce', 'full-ecommerce-engine', 'web_dev', 'Full E-Commerce Engine', 'Complete e-commerce store with Steadfast courier sync, payment gateways, and inventory.', 35000.00, 'one_time', 9, 14, 'https://skcomart.com', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '', '["Client Website", "Featured"]', '["Node.js", "MySQL"]', '["Next.js", "Node.js", "MySQL", "Steadfast API", "bKash Tokenized"]', '["Dynamic product catalogs & filtering", "Automated Steadfast courier checkout", "Cart abandonment tracking pipe", "Admin invoice generation", "12 Months maintenance warranty"]', 1)
      `);
    }

    // Seed Pricing Plans if empty
    const [planRows]: any = await pool.query('SELECT COUNT(*) as count FROM pricing_plans');
    if (planRows[0].count === 0) {
      await pool.query(`
        INSERT IGNORE INTO pricing_plans 
        (id, slug, category, title, tagline, base_price_bdt, billing_type, delivery_time_days, features_included, tech_badges, is_popular) 
        VALUES 
        ('plan-starter', 'starter-growth-plan', 'Starter Plan', 'Starter Growth Plan', 'Ideal for startups beginning their ad campaigns.', 12000.00, 'one_time', 5, '["1 Page Custom Next.js design", "Lighthouse sub-0.5s speed", "Meta Pixel + dynamic GTM scripts", "WhatsApp chat triggers", "12-Month support bug warranty"]', '["Next.js", "Tailwind", "Vercel"]', 0),
        ('plan-business', 'business-scale-plan', 'Business Plan', 'Business Scale Engine', 'A comprehensive online store setup for retail scale.', 35000.00, 'one_time', 14, '["Full category catalogs & dynamic cart", "Steadfast Courier API checkout sync", "Server-side Meta Conversions API (CAPI)", "Sales dashboard & automated invoices", "12-Month support bug warranty"]', '["Next.js", "Node.js", "MySQL"]', 1)
      `);
    }

    // Seed Projects if empty
    const [projectRows]: any = await pool.query('SELECT COUNT(*) as count FROM projects');
    if (projectRows[0].count === 0) {
      await pool.query(`
        INSERT IGNORE INTO projects 
        (id, title, category, client_name, tagline, challenge, solution, demo_url, image_url, tech_badges, metrics, priority) 
        VALUES 
        ('case-apex-ecom', 'Migrating Legacy WordPress Store to Next.js Engine', 'web_dev', 'Apex E-Commerce BD', 'How speed optimization reduced cart bounce rates and scaled transactions.', 'Apex suffered from slow page paints (LCP: 4.8 seconds), causing cart abandonment.', 'Rebuilt their catalog stack on Next.js App Router on Vercel CDN.', 'https://skcomart.com', '', '["Next.js", "PostCSS", "Steadfast API"]', '[{"label":"Page Load Speed","before":"4.8s","after":"0.4s","lift":"91% Decrease"},{"label":"Sales Transactions","before":"Base","after":"1.45x","lift":"45% Growth"}]', 10)
      `);
    }

    // Seed Sample Ads Payments if empty
    const [adsRows]: any = await pool.query('SELECT COUNT(*) as count FROM ads_payments');
    if (adsRows[0].count === 0) {
      await pool.query(`
        INSERT IGNORE INTO ads_payments 
        (id, invoice_number, business_name, client_name, client_phone, campaign_type, total_amount, paid_amount, due_amount, status, payment_date, notes)
        VALUES 
        ('ads-1', 'ADS-1001', 'Apex Retail BD', 'Tanvir Rahman', '+8801712345678', 'website', 25000.00, 15000.00, 10000.00, 'partial', CURDATE(), 'Meta Pixel purchase conversions campaign'),
        ('ads-2', 'ADS-1002', 'Dhaka Fashion Hub', 'Nusrat Jahan', '+8801899887766', 'message', 12000.00, 12000.00, 0.00, 'paid', CURDATE(), 'WhatsApp lead generation campaign')
      `);
    }

    // Seed Sample Invoice if empty
    const [invRows]: any = await pool.query('SELECT COUNT(*) as count FROM invoices');
    if (invRows[0].count === 0) {
      await pool.query(`
        INSERT IGNORE INTO invoices 
        (id, invoice_number, client_name, business_name, client_phone, client_email, client_address, items, subtotal, discount, tax, total_amount, paid_amount, due_amount, status, issue_date, due_date, notes)
        VALUES 
        ('inv-1', 'INV-2026-1001', 'Zahid Hasan', 'NextGen Retailers', '01799887766', 'zahid@hasan.me', 'Gulshan-1, Dhaka', 
        '[{"description":"High-Speed Next.js Landing Page","qty":1,"unitPrice":12000,"total":12000},{"description":"Domain Registration (.com)","qty":1,"unitPrice":1000,"total":1000}]',
        13000.00, 1000.00, 0.00, 12000.00, 6000.00, 6000.00, 'partial', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'Thank you for partnering with ZenIT Agency!')
      `);
    }

  } catch (err) {
    console.error('Error seeding data to MySQL:', err);
  }
}

// ---------------- INVOICES MYSQL HELPERS ----------------
export async function getMySQLInvoices(): Promise<any[]> {
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
    createdAt: r.created_at
  }));
}

export async function addMySQLInvoice(inv: any): Promise<void> {
  await initMySQLTables();
  await pool.query(
    `INSERT INTO invoices 
     (id, invoice_number, client_name, business_name, client_phone, client_email, client_address, items, subtotal, discount, tax, total_amount, paid_amount, due_amount, status, issue_date, due_date, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      inv.id,
      inv.invoiceNumber,
      inv.clientName,
      inv.businessName || '',
      inv.clientPhone || '',
      inv.clientEmail || '',
      inv.clientAddress || '',
      JSON.stringify(inv.items || []),
      inv.subtotal || 0,
      inv.discount || 0,
      inv.tax || 0,
      inv.totalAmount || 0,
      inv.paidAmount || 0,
      inv.dueAmount || 0,
      inv.status || 'unpaid',
      inv.issueDate,
      inv.dueDate || null,
      inv.notes || ''
    ]
  );
}

export async function updateMySQLInvoice(id: string, inv: any): Promise<void> {
  await initMySQLTables();
  const fields: string[] = [];
  const values: any[] = [];

  if (inv.invoiceNumber !== undefined) { fields.push('invoice_number = ?'); values.push(inv.invoiceNumber); }
  if (inv.clientName !== undefined) { fields.push('client_name = ?'); values.push(inv.clientName); }
  if (inv.businessName !== undefined) { fields.push('business_name = ?'); values.push(inv.businessName); }
  if (inv.clientPhone !== undefined) { fields.push('client_phone = ?'); values.push(inv.clientPhone); }
  if (inv.clientEmail !== undefined) { fields.push('client_email = ?'); values.push(inv.clientEmail); }
  if (inv.clientAddress !== undefined) { fields.push('client_address = ?'); values.push(inv.clientAddress); }
  if (inv.items !== undefined) { fields.push('items = ?'); values.push(JSON.stringify(inv.items)); }
  if (inv.subtotal !== undefined) { fields.push('subtotal = ?'); values.push(Number(inv.subtotal)); }
  if (inv.discount !== undefined) { fields.push('discount = ?'); values.push(Number(inv.discount)); }
  if (inv.tax !== undefined) { fields.push('tax = ?'); values.push(Number(inv.tax)); }
  if (inv.totalAmount !== undefined) { fields.push('total_amount = ?'); values.push(Number(inv.totalAmount)); }
  if (inv.paidAmount !== undefined) { fields.push('paid_amount = ?'); values.push(Number(inv.paidAmount)); }
  if (inv.dueAmount !== undefined) { fields.push('due_amount = ?'); values.push(Number(inv.dueAmount)); }
  if (inv.status !== undefined) { fields.push('status = ?'); values.push(inv.status); }
  if (inv.issueDate !== undefined) { fields.push('issue_date = ?'); values.push(inv.issueDate); }
  if (inv.dueDate !== undefined) { fields.push('due_date = ?'); values.push(inv.dueDate || null); }
  if (inv.notes !== undefined) { fields.push('notes = ?'); values.push(inv.notes); }

  if (fields.length === 0) return;
  values.push(id);
  await pool.query(`UPDATE invoices SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function deleteMySQLInvoice(id: string): Promise<void> {
  await initMySQLTables();
  await pool.query('DELETE FROM invoices WHERE id = ?', [id]);
}

// ---------------- ADS PAYMENTS MYSQL HELPERS ----------------
export async function getMySQLAdsPayments(): Promise<any[]> {
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
    createdAt: r.created_at
  }));
}

export async function addMySQLAdsPayment(item: any): Promise<void> {
  await initMySQLTables();
  await pool.query(
    `INSERT INTO ads_payments 
     (id, invoice_number, business_name, client_name, client_phone, campaign_type, total_amount, paid_amount, due_amount, status, payment_date, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      item.id,
      item.invoiceNumber,
      item.businessName,
      item.clientName || '',
      item.clientPhone || '',
      item.campaignType || 'website',
      item.totalAmount || 0,
      item.paidAmount || 0,
      item.dueAmount || 0,
      item.status || 'due',
      item.paymentDate,
      item.notes || ''
    ]
  );
}

export async function updateMySQLAdsPayment(id: string, item: any): Promise<void> {
  await initMySQLTables();
  const fields: string[] = [];
  const values: any[] = [];

  if (item.invoiceNumber !== undefined) { fields.push('invoice_number = ?'); values.push(item.invoiceNumber); }
  if (item.businessName !== undefined) { fields.push('business_name = ?'); values.push(item.businessName); }
  if (item.clientName !== undefined) { fields.push('client_name = ?'); values.push(item.clientName); }
  if (item.clientPhone !== undefined) { fields.push('client_phone = ?'); values.push(item.clientPhone); }
  if (item.campaignType !== undefined) { fields.push('campaign_type = ?'); values.push(item.campaignType); }
  if (item.totalAmount !== undefined) { fields.push('total_amount = ?'); values.push(Number(item.totalAmount)); }
  if (item.paidAmount !== undefined) { fields.push('paid_amount = ?'); values.push(Number(item.paidAmount)); }
  if (item.dueAmount !== undefined) { fields.push('due_amount = ?'); values.push(Number(item.dueAmount)); }
  if (item.status !== undefined) { fields.push('status = ?'); values.push(item.status); }
  if (item.paymentDate !== undefined) { fields.push('payment_date = ?'); values.push(item.paymentDate); }
  if (item.notes !== undefined) { fields.push('notes = ?'); values.push(item.notes); }

  if (fields.length === 0) return;
  values.push(id);
  await pool.query(`UPDATE ads_payments SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function deleteMySQLAdsPayment(id: string): Promise<void> {
  await initMySQLTables();
  await pool.query('DELETE FROM ads_payments WHERE id = ?', [id]);
}

// ---------------- SERVICE METRICS MYSQL HELPERS ----------------
export async function recordMySQLServiceMetric(serviceId: string, type: 'view' | 'click'): Promise<void> {
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

export async function getMySQLServiceMetrics(): Promise<Record<string, { views: number; clicks: number }>> {
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

// ---------------- ORDERS MYSQL HELPERS ----------------
export async function getMySQLOrders(): Promise<any[]> {
  await initMySQLTables();
  const [rows]: any = await pool.query('SELECT * FROM orders ORDER BY ordered_at DESC');
  return rows.map((r: any) => ({
    id: r.id,
    projectId: r.project_id,
    businessName: r.business_name,
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
    trxId: r.trx_id,
    projectNote: r.project_note,
    isDeleted: Boolean(r.is_deleted),
    orderedAt: r.ordered_at
  }));
}

export async function addMySQLOrder(o: any): Promise<void> {
  await initMySQLTables();
  await pool.query(
    `INSERT INTO orders 
     (id, project_id, business_name, full_name, phone, email, service_id, service_title, options_selected, total_bdt, paid_amount, due_amount, status, payment_status, trx_id, project_note, is_deleted)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      o.id,
      o.projectId || '',
      o.businessName || '',
      o.fullName,
      o.phone,
      o.email,
      o.serviceId,
      o.serviceTitle,
      JSON.stringify(o.optionsSelected || {}),
      o.totalBDT || 0,
      o.paidAmount || 0,
      o.dueAmount || 0,
      o.status || 'pending',
      o.paymentStatus || 'unpaid',
      o.trxId || '',
      o.projectNote || '',
      o.isDeleted ? 1 : 0
    ]
  );
}

export async function updateMySQLOrder(id: string, o: any): Promise<void> {
  await initMySQLTables();
  const fields: string[] = [];
  const values: any[] = [];

  if (o.status !== undefined) { fields.push('status = ?'); values.push(o.status); }
  if (o.paymentStatus !== undefined) { fields.push('payment_status = ?'); values.push(o.paymentStatus); }
  if (o.totalBDT !== undefined) { fields.push('total_bdt = ?'); values.push(Number(o.totalBDT)); }
  if (o.paidAmount !== undefined) { fields.push('paid_amount = ?'); values.push(Number(o.paidAmount)); }
  if (o.dueAmount !== undefined) { fields.push('due_amount = ?'); values.push(Number(o.dueAmount)); }
  if (o.trxId !== undefined) { fields.push('trx_id = ?'); values.push(o.trxId); }
  if (o.projectNote !== undefined) { fields.push('project_note = ?'); values.push(o.projectNote); }
  if (o.businessName !== undefined) { fields.push('business_name = ?'); values.push(o.businessName); }
  if (o.fullName !== undefined) { fields.push('full_name = ?'); values.push(o.fullName); }
  if (o.phone !== undefined) { fields.push('phone = ?'); values.push(o.phone); }
  if (o.email !== undefined) { fields.push('email = ?'); values.push(o.email); }
  if (o.isDeleted !== undefined) { fields.push('is_deleted = ?'); values.push(o.isDeleted ? 1 : 0); }

  if (fields.length === 0) return;
  values.push(id);
  await pool.query(`UPDATE orders SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function deleteMySQLOrder(id: string): Promise<void> {
  await initMySQLTables();
  await pool.query("UPDATE orders SET is_deleted = 1, status = 'trash' WHERE id = ?", [id]);
}

