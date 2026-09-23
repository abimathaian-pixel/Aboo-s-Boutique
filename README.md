# Aboo'sBoutique — Haute Couture & Artisanal Tailoring

A modern luxury clothing and fashion e-commerce web application featuring two integrated experiences:
1. **Customer / Patron Portal** (`/` and `/shop`): Multi-filter catalog, product detail pages with fabric/care guides, slide-over bag, and UPI QR checkout.
2. **Admin Portal** (`/admin`): Executive KPI dashboard, inventory management with direct image uploads, category controls, and live store settings.

---

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS with custom luxury palette (Sapphire `#0F4C64`, Rose Gold `#CFA276`, Obsidian `#0A0E14`)
- **Database & ORM**: SQLite & Prisma ORM
- **Authentication**: JWT with HTTP-only cookies & role-based route middleware
- **Icons**: Lucide React
- **Payments**: Dynamic merchant UPI QR generation (`6369537463@ptsbi`)

---

## 🛠️ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database & Seed Catalog
```bash
npx prisma db push
npm run seed
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 🔑 Demo Credentials

| Role | Portal URL | Email | Password |
| :--- | :--- | :--- | :--- |
| **Admin** | `/admin/login` | `admin@aboosboutique.com` | `Admin@12345` |
| **Customer** | `/login` | `customer@aboosboutique.com` | `Customer@12345` |

*(Both login pages include an **Auto-Fill Demo Credentials** button for instant testing).*
