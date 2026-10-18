# PROPOSAL PENGEMBANGAN GALANGAN SHOP
## Perubahan Arsitektur: RTDB → Firestore (Orders, Inventory, Suppliers, Categories, Menu, Accounting)

## 1. KONDISI SAAT INI
- galanganshop-suite: UI lengkap (Storefront, POS, Admin, Accounting, B2B, Tracking, Checkout, Catering, PDF Receipt) — data masih localStorage.
- galanganshop-main/apps/digitalculinary: Backend lengkap dengan Firebase Functions (orders, inventory, suppliers, categories, menu, accounting/reconcile/settlements/report-pl/receipt/online-orders/pending-orders/returns) — menggunakan RTDB (Realtime Database).
- galanganshop-main/apps/sst-catalog: Catalog frontend dengan Firestore.

## 2. PERUBAHAN UTAMA (REALTIME DATA → FIRESTORE)
Semua data realtime disimpan di Firestore, bukan RTDB:
- orders / online-orders / pending-orders
- inventory / inventory_logs / inventory_receives
- suppliers
- categories / categoriesMeta
- menu
- accounting (settlements, reconcile, report-pl, receipt)
- notifications_log

## 3. LANGKAH-LANGKAH KERJA

### A. Struktur Koleksi Firestore
```
orders/
  {orderId} -> { ... }
online-orders/
  {orderId} -> { ... }
pending-orders/
  {orderId} -> { ... }
inventory/
  {sku} -> { jumlah_stok, ... }
  logs/{logId} -> { ... }
suppliers/
  {supplierId} -> { ... }
categories/
  {catName} -> { ... }
  meta/{metaId} -> { ... }
menu/
  {itemId} -> { ... }
accounting/
  settlements/{id} -> { ... }
  reconcile/{id} -> { ... }
  reports/{id} -> { ... }
  receipts/{id} -> { ... }
notifications/
  {notifId} -> { ... }
storeData/
  siteSettings / storeProfile / categoriesMeta / infoTrends / notifications / products
```

### B. Adapter Service (galanganshop-suite/src/services/)
1. Buat `firestoreService.ts` — wrapper read/write/query Firestore untuk semua koleksi di atas.
2. Ganti semua `getOrders()`, `saveOrders()`, `getInventory()`, `getProducts()`, `getSuppliers()`, `getCategories()` — arahkan ke Firestore service.
3. Tambahkan real-time listener (`onSnapshot`) untuk orders, inventory, menu, notifications.

### C. Backend Functions (galanganshop-main/apps/digitalculinary/functions/)
1. Ubah semua endpoint RTDB (`env.FIREBASE_DATABASE_URL`) menjadi Firestore (`env.FIREBASE_PROJECT_ID` + Firestore SDK atau REST Firestore).
2. Konversi endpoint `orders`, `inventory`, `suppliers`, `categories`, `menu`, `settlements`, `reconcile`, `report-pl` ke operasi Firestore.
3. Pertahankan CORS headers dan auth parameter (menggunakan Firebase Auth token / custom token).

### D. Sinkronisasi Data
1. Saat order baru dibuat (POS / Checkout) → simpan ke `orders/` dan kurangi `inventory/`.
2. Saat settlement / pembayaran diterima → simpan ke `accounting/settlements/` dan update `reconcile/`.
3. Saat supplier diterima barang → tambah `inventory/` dan catat di `inventory_logs/`.

### E. Testing & Deployment
1. Unit test adapter service dengan Firestore emulator (`firebase emulators:start`).
2. End-to-end test: buat order via POS → cek orders di Firestore → cek inventory berkurang → generate receipt PDF.
3. Deploy Functions ke Firebase dan hubungkan ke Cloudflare Pages.

## 4. STRATEGI EKSEKUSI
- Gunakan subagent paralel: satu untuk adapter service (frontend), satu untuk backend Functions (Firestore conversion), satu untuk data migration RTDB→Firestore (jika diperlukan).
- Setiap subagent melaporkan hasil dengan verifikasi file aktual (`git diff`) sebelum commit.
