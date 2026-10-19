# Master Admin Panel & Firestore Integration Implementation Plan

Integrate advanced Master Admin features (Product CSV bulk import, category management, SHA-256 PIN & role-based authentication, and real-time Firestore synchronization with optimistic state) into GalanganShop Suite.

## User Review & Critical Decisions

> [!IMPORTANT]
> The implementation plan incorporates the user's clarified choices: Product CSV bulk import and category management prioritized first, SHA-256 PIN & role password authentication, and real-time Firestore listeners with optimistic state updates.

- **Confirmed Decision 1**: Focus initial admin enhancement on Product CSV bulk import, category management, and store branding CMS.
- **Confirmed Decision 2**: Secure admin access using SHA-256 PIN and role-based password protection.
- **Confirmed Decision 3**: Synchronize data with Firebase Firestore using real-time `onSnapshot` listeners combined with optimistic local state updates.

---

## 1. Overview & Core Concept

- **What It Does**: Upgrades the Master Admin Panel in GalanganShop Suite with robust CSV bulk import/export for products, category CRUD management, store profile/branding CMS, and secure authentication backed by Firebase Firestore real-time listeners.
- **Target Audience / Persona**: Store owners, inventory managers, and master cashiers.
- **Key Value**: Eliminates manual data entry with instant CSV bulk uploads, provides centralized store configuration, and ensures real-time inventory and order synchronization across devices.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. Admin Login via secure PIN / Password gate with SHA-256 validation.
  2. Master Admin Dashboard tab navigation: Products & CSV Import, Categories, Store Branding, Inventory, Orders, Accounting, and Security.
  3. Product CSV Bulk Import: Drag-and-drop CSV uploader with column preview, automatic normalization, and validation feedback.
  4. Real-time updates reflecting immediately across storefront and POS without page refreshes.
- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Clean, professional utilitarian SaaS dashboard.
  - *Color Palette*: 60-30-10 distribution (Slate neutral canvas, crisp card surfaces, high-contrast primary action accents).
  - *Typography*: Plus Jakarta Sans display & body, JetBrains Mono for SKU / tabular metrics (`tabular-nums`).
  - *Component Styling*: Tailwind CSS v4, zero-pill metadata discipline, unboxed typographic separators.
- **Interactive Feedback & Motion**: Smooth micro-interactions (`≤200ms`), toast notifications for successful imports/saves, loading skeletons during Firestore fetch, and error boundaries.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1**: Real-time Firestore Listeners vs. Polling
  - *Chosen Approach*: Real-time `onSnapshot` listeners with optimistic local state updates.
  - *Why*: Instant UI feedback with zero latency while maintaining cloud persistence and cross-device sync.
- **Decision 2**: CSV Import Client-Side Parsing
  - *Chosen Approach*: Use `papaparse` for client-side CSV parsing and validation prior to batch writing to Firestore.
  - *Why*: Fast feedback for administrators and seamless preview before committing changes.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────┐
│               GalanganShop Suite (React SPA)           │
├────────────────────────────────────────────────────────┤
│  Storefront & POS   │  Master Admin Panel (Tabs)       │
│  - Product Catalog  │  - Product CRUD & CSV Import     │
│  - Cart & Checkout  │  - Category Management           │
│  - Order Tracking   │  - Store Branding & CMS          │
└─────────┬───────────┴──────────────┬───────────────────┘
          │                          │
          ▼                          ▼
┌────────────────────────────────────────────────────────┐
│            firestoreService.ts (Storage Layer)         │
│  - Real-time onSnapshot listeners                      │
│  - Optimistic mutations & batch writes                 │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│                Firebase Firestore                      │
│  - /menu, /categories, /orders, /inventory, /settings  │
└────────────────────────────────────────────────────────┘
```

- **Data Model & State**:
  - `menu` collection: Products (sku, name, price, category, stock, image, description, showOnMain).
  - `categories` collection: Category items (id, name, icon, description).
  - `storeData/siteSettings`: Branding, hero banner, WhatsApp owner numbers.
- **Interactive Component & State Mapping**:
  - CSV Import Uploader parses file -> validates schema -> displays preview table -> executes batch Firestore writes -> triggers toast success.
  - Admin tab switches update active views instantly with live Firestore subscription data.
