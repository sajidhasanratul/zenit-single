# ZenIT Single Domain Deployment Guide

This guide describes how to deploy and host the ZenIT Single-Domain website and admin panel.

In this single-domain configuration:
- **Public Website:** `https://yourdomain.com` (Homepage, Services, Pricing, Projects, Contact)
- **Admin Panel:** `https://yourdomain.com/admin` (Overview, Orders, Catalog, Pricing, Showcase, Leads, Settings)
- **Backend APIs:** `https://yourdomain.com/api/...`

No subdomains (like `admin.yourdomain.com`) or wildcard SSL certificates are required.

---

## 🌟 Recommended Hosting Options

| Option | Ease of Setup | Persistent Storage | Cost | Best For |
| :--- | :--- | :--- | :--- | :--- |
| **1. Render / Railway** (PaaS) | Easiest | Yes (Disk Volume) | Low | Fast deployment with automatic SSL |
| **2. VPS (DigitalOcean / AWS / Ubuntu)** | Medium | Yes (Full control) | Low/Medium | High performance, complete server freedom |
| **3. cPanel Shared Hosting** | Harder | Yes (Filesystem) | Low | Using existing cPanel Node.js hosting |

---

## 🚀 Option 1: PaaS Deployment (Render / Railway)

Platforms like **Render** or **Railway** allow you to connect your Git repository and deploy automatically. To prevent losing your database on restarts, configure a **Persistent Disk Volume**.

### Deploying on Render (with Persistent Disk)
1. Sign up on [Render.com](https://render.com) and create a **Web Service**.
2. Connect your GitHub repository containing the `ZenIT Single` code.
3. Configure settings:
   - **Environment:** `Node`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm run start`
4. Under **Disks**, add a persistent volume:
   - **Mount Path:** `/data`
   - **Size:** `1 GB`
5. Under **Environment**, add the environment variable:
   - `PORT = 3000`
6. Click **Deploy Web Service**. Render provides automatic free SSL for `yourdomain.com`.

---

## 🖥️ Option 2: VPS Deployment (DigitalOcean / Vultr / Linode / AWS)

Standard Ubuntu Linux server with PM2 and Nginx.

### Step 1: Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Step 2: Upload Files to the Server
Upload project files into `/var/www/zenit` (excluding `.next` and `node_modules`):
```bash
mkdir -p /var/www/zenit
```

### Step 3: Install Dependencies and Build
```bash
cd /var/www/zenit
npm install
npm run build
```

### Step 4: Run with PM2 Process Manager
```bash
sudo npm install pm2 -g
pm2 start npm --name "zenit" -- start
pm2 startup
pm2 save
```

### Step 5: Configure Nginx Reverse Proxy (Single Domain)
Create the Nginx configuration:
```bash
sudo nano /etc/nginx/sites-available/zenit
```

Paste this simple single-domain configuration (replace `yourdomain.com` with your actual domain):
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the configuration:
```bash
sudo ln -s /etc/nginx/sites-available/zenit /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 6: Free SSL with Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Now visiting `https://yourdomain.com` opens the public site, and visiting `https://yourdomain.com/admin` opens the secure admin dashboard!

---

## 📁 Option 3: cPanel Shared Hosting (Node.js App)

If your cPanel provider has **"Setup Node.js App"**:

1. **Compress files:** Create a `.zip` archive of the `ZenIT Single` folder (exclude `node_modules` and `.next`).
2. **Upload:** In cPanel File Manager, upload and extract to `/home/username/zenit`.
3. **Setup App:** In cPanel &rarr; **Setup Node.js App** &rarr; **Create Application**:
   - **Node.js version:** `20.x`
   - **Application Mode:** `Production`
   - **Application root:** `zenit`
   - **Application URL:** Select `yourdomain.com`
   - **Application startup file:** `node_modules/next/dist/bin/next`
4. **Install & Build:**
   - Click **Run JS Script** or connect via SSH terminal:
     ```bash
     npm install
     npm run build
     ```
5. **Restart:** Click **Restart Application** in the cPanel Node.js interface.
