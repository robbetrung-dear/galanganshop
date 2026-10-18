/**
 * functions/api/sync-products.js
 * Cloudflare Pages Function — POST /api/sync-products
 *
 * TUGAS FASE 2 (Sinkronisasi Katalog):
 * Menarik data produk dari Cloud Firestore (app: sst-catalog) dan menyimpannya
 * ke Firebase Realtime Database yang dipakai POS Digital Culinary.
 *
 * Sumber  : Firestore collection `products` (field: id, nama, merk, kategori, type,
 *           harga, harga_diskon, deskripsi, jumlah_stok, jumlah_pieces_packing,
 *           satuan_packing, angka_produk_favorit, url_foto)
 * Tujuan  : RTDB `/menu_items` (node yang dibaca POS kasir & Admin CMS)
 *           + RTDB `/menu_categories` (kategori hasil turunan, supaya filter
 *             kategori di POS ikut terisi)
 *
 * Env yang dibaca (semua opsional, ada default yang aman):
 *   SST_FIRESTORE_PROJECT_ID / FIREBASE_PROJECT_ID  (default: galanganshop)
 *   SST_FIRESTORE_COLLECTION                        (default: products)
 *   FIREBASE_DATABASE_URL                          (default: RTDB digitalculinary)
 *   FIREBASE_DATABASE_SECRET                       (opsional, untuk RTDB ber-rules tertutup)
 *   FIREBASE_API_KEY                               (opsional, hanya bila Firestore menolak akses publik)
 *   CATALOG_SYNC_PATH / CATALOG_SYNC_CATEGORY_PATH  (opsional, override path — dipakai untuk uji)
 *
 * Body JSON (semua opsional):
 *   { "mode": "merge" | "replace", "dryRun": true|false, "confirm": true, "syncCategories": true|false }
 *     - merge  (default) : produk hasil tarik di-upsert by `id`; item & field admin
 *                          yang sudah ada TIDAK dihapus.
 *     - replace          : katalog diganti total (destruktif) — wajib `confirm: true`.
 *     - dryRun           : hanya menghitung & menampilkan contoh, tidak menulis apa pun.
 */

const DEFAULT_RTDB_URL = "https://digitalculinary-app-default-rtdb.asia-southeast1.firebasedatabase.app";
const DEFAULT_FS_PROJECT = "galanganshop";
const DEFAULT_FS_COLLECTION = "products";

// Field milik admin yang TIDAK boleh ditimpa saat re-sync (harga grosir, badge,
// visibilitas, tautan bahan baku) — supaya sinkronisasi ulang tidak menghapus
// pekerjaan admin di Master Data.
const PRESERVE_FIELDS = [
  'enable_grosir', 'harga_partai', 'harga_agen', 'minimum_order', 'minimum_order_agen',
  'badge', 'badgeColor', 'showOnMain', 'active', 'isSpicy',
  'inventoryId', 'supplierId', 'supplierName', 'isConsignment', 'cost',
  'createdAt'
];

const json = (payload, status, cors, extra = {}) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { ...cors, "Content-Type": "application/json", ...extra }
  });

/** Ambil nilai bertipe dari format Firestore REST (map {tipe: nilai}). */
function fsValue(node) {
  if (!node || typeof node !== 'object') return undefined;
  if ('stringValue' in node) return node.stringValue;
  if ('integerValue' in node) return Number(node.integerValue);
  if ('doubleValue' in node) return Number(node.doubleValue);
  if ('booleanValue' in node) return Boolean(node.booleanValue);
  if ('timestampValue' in node) return node.timestampValue;
  if ('nullValue' in node) return null;
  if ('arrayValue' in node) return (node.arrayValue.values || []).map(fsValue);
  if ('mapValue' in node) return fsFields(node.mapValue.fields);
  return undefined;
}

/** Ubah `fields` gaya Firestore REST menjadi objek JS biasa. */
function fsFields(fields) {
  const out = {};
  if (!fields || typeof fields !== 'object') return out;
  for (const [key, val] of Object.entries(fields)) out[key] = fsValue(val);
  return out;
}

const toNumber = (v) => {
  const n = Number(String(v ?? '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

const toText = (v) => (v === undefined || v === null) ? '' : String(v).trim();

const slugify = (v) => toText(v)
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '_')
  .replace(/^_+|_+$/g, '') || 'lainnya';

/** Normalisasi node RTDB yang bentuknya bisa array (0..n) atau objek ber-id. */
function rtdbList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(v => v && typeof v === 'object');
  if (typeof value === 'object') {
    return Object.entries(value)
      .map(([key, v]) => (v && typeof v === 'object') ? { ...v, id: v.id || key } : null)
      .filter(Boolean);
  }
  return [];
}

/** Mapping 1 dokumen Firestore `products` → 1 item RTDB `menu_items`. */
function mapProduct(p) {
  const harga = toNumber(p.harga);
  const hargaDiskon = toNumber(p.harga_diskon);
  const promo = hargaDiskon > 0 && harga > 0 && hargaDiskon < harga;
  const kategori = toText(p.kategori) || 'Produk';
  const packQty = toNumber(p.jumlah_pieces_packing);
  const satuanPack = toText(p.satuan_packing);

  return {
    id: toText(p.id) || ('prd_' + slugify(p.nama)),
    name: toText(p.nama) || 'Produk Tanpa Nama',
    // Harga jual = harga promo bila ada (mengikuti ProductCard sst-catalog),
    // harga normal disimpan sebagai harga coret.
    price: promo ? hargaDiskon : harga,
    originalPrice: promo ? harga : 0,
    category: slugify(kategori),
    categoryLabel: kategori,
    desc: toText(p.deskripsi),
    image: toText(p.url_foto),
    // Item katalog tanpa resep/BOM memakai stok langsung dari `stock`.
    stock: toNumber(p.jumlah_stok),
    unit: satuanPack || toText(p.type) || 'Pcs',
    packQty: packQty,
    satuanPacking: satuanPack,
    merk: toText(p.merk),
    tipeProduk: toText(p.type),
    favorit: toNumber(p.angka_produk_favorit),
    source: 'sst-catalog',
    fromCatalog: true,
    active: true,
    // Default grosir: OFF. Admin yang menyalakan + mengisi harga partai/agen
    // di Master Data (field ini dipertahankan saat re-sync).
    enable_grosir: false,
    harga_partai: 0,
    harga_agen: 0,
    minimum_order: packQty > 0 ? packQty : 1,
    // Ambang agen opsional (0 = ikut minimum_order). Bisa diubah admin di Master Data.
    minimum_order_agen: 0,
    updatedAt: Date.now()
  };
}

/** Ambil seluruh dokumen collection Firestore via REST + pagination. */
async function fetchFirestoreProducts({ projectId, collection, apiKey, maxPages = 8, pageSize = 300 }) {
  const docs = [];
  let pageToken = '';
  let pages = 0;
  let truncated = false;

  while (pages < maxPages) {
    const params = new URLSearchParams({ pageSize: String(pageSize) });
    if (pageToken) params.set('pageToken', pageToken);
    if (apiKey) params.set('key', apiKey);

    const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}` +
      `/databases/(default)/documents/${encodeURIComponent(collection)}?${params.toString()}`;

    const res = await fetch(url);
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(`Firestore ${res.status}: ${(body && body.error && body.error.message) || 'gagal membaca koleksi ' + collection}`);
    }

    (body.documents || []).forEach(doc => docs.push(fsFields(doc.fields)));
    pages += 1;

    pageToken = body.nextPageToken || '';
    if (!pageToken) break;
    if (pages >= maxPages) truncated = true;
  }

  return { docs, pages, truncated };
}

export async function onRequest(context) {
  const { request, env = {} } = context;
  const method = request.method;

  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  const projectId = env.SST_FIRESTORE_PROJECT_ID || env.FIREBASE_PROJECT_ID || DEFAULT_FS_PROJECT;
  const collection = env.SST_FIRESTORE_COLLECTION || DEFAULT_FS_COLLECTION;
  const dbUrl = (env.FIREBASE_DATABASE_URL || DEFAULT_RTDB_URL).replace(/\/$/, "");
  const secret = env.FIREBASE_DATABASE_SECRET || "";
  const authParam = secret ? `?auth=${encodeURIComponent(secret)}` : "";
  const menuPath = (env.CATALOG_SYNC_PATH || 'menu_items').replace(/^\/+|\/+$/g, '');
  const categoryPath = (env.CATALOG_SYNC_CATEGORY_PATH || 'menu_categories').replace(/^\/+|\/+$/g, '');

  // GET — info konfigurasi yang sedang aktif (tanpa membocorkan secret).
  if (method === 'GET') {
    return json({
      success: true,
      endpoint: '/api/sync-products',
      usage: 'POST { "mode": "merge" | "replace", "dryRun": true | false, "confirm": true }',
      resolved: {
        firestoreProject: projectId,
        firestoreCollection: collection,
        firestoreAuth: (env.FIREBASE_API_KEY || env.VITE_FIREBASE_API_KEY) ? 'api-key' : 'public (tanpa key)',
        rtdbUrl: dbUrl,
        rtdbAuth: secret ? 'database-secret' : 'anonim',
        targetPath: menuPath,
        categoryPath: categoryPath
      }
    }, 200, cors);
  }

  if (method !== 'POST') {
    return json({ success: false, error: 'Gunakan POST untuk menjalankan sinkronisasi katalog' }, 405, cors);
  }

  const startedAt = Date.now();

  try {
    const body = await request.json().catch(() => ({}));
    const mode = body.mode === 'replace' ? 'replace' : 'merge';
    const dryRun = body.dryRun === true;
    const syncCategories = body.syncCategories !== false;

    if (mode === 'replace' && body.confirm !== true) {
      return json({
        success: false,
        error: 'Mode replace akan mengganti SELURUH katalog. Kirim { "mode": "replace", "confirm": true } bila memang disengaja.'
      }, 400, cors);
    }

    const steps = {};

    // ------------------------------------------------------------------
    // 1. Baca katalog sumber dari Firestore (sst-catalog)
    // ------------------------------------------------------------------
    let fs;
    try {
      fs = await fetchFirestoreProducts({
        projectId,
        collection,
        apiKey: env.FIREBASE_API_KEY || env.VITE_FIREBASE_API_KEY || ''
      });
      steps.firestore = `ok: ${fs.docs.length} dokumen (${fs.pages} halaman${fs.truncated ? ', terpotong' : ''})`;
    } catch (err) {
      return json({ success: false, error: `Gagal membaca Firestore: ${err.message}`, steps }, 502, cors);
    }

    const mapped = fs.docs
      .filter(p => toText(p.nama) || toNumber(p.harga) > 0)
      .map(mapProduct)
      .filter(p => p.id);

    if (mapped.length === 0) {
      return json({ success: false, error: `Koleksi Firestore '${collection}' kosong / tidak ada dokumen dengan field yang dikenali.`, steps }, 404, cors);
    }

    // ------------------------------------------------------------------
    // 2. Baca node tujuan di RTDB, lalu gabungkan (upsert by id)
    // ------------------------------------------------------------------
    const targetUrl = `${dbUrl}/${menuPath}.json${authParam}`;
    let existingList = [];
    try {
      const existingRes = await fetch(targetUrl);
      const existingRaw = await existingRes.json().catch(() => null);
      if (existingRaw && existingRaw.error) {
        steps.rtdbRead = `gagal: ${existingRaw.error}`;
      } else {
        existingList = rtdbList(existingRaw);
        steps.rtdbRead = `ok: ${existingList.length} item lama`;
      }
    } catch (err) {
      steps.rtdbRead = `gagal: ${err.message}`;
    }

    const existingById = new Map(existingList.map(item => [String(item.id), item]));
    const syncedIds = new Set(mapped.map(p => String(p.id)));

    const merged = mapped.map(fresh => {
      const prev = existingById.get(String(fresh.id));
      if (!prev) return fresh;
      // Pertahankan field yang dikelola admin (harga grosir, badge, visibilitas, dsb.)
      const keep = {};
      PRESERVE_FIELDS.forEach(f => {
        const v = prev[f];
        if (v !== undefined && v !== null) keep[f] = v;
      });
      return { ...fresh, ...keep, updatedAt: Date.now() };
    });

    const untouched = existingList.filter(item => !syncedIds.has(String(item.id)));
    const nextList = mode === 'replace' ? merged : [...untouched, ...merged];
    const added = merged.filter(p => !existingById.has(String(p.id))).length;
    const updated = merged.length - added;

    // ------------------------------------------------------------------
    // 3. Turunkan daftar kategori (id + label) untuk filter POS
    // ------------------------------------------------------------------
    const catMap = new Map();
    merged.forEach(p => {
      if (p.category && !catMap.has(p.category)) catMap.set(p.category, p.categoryLabel || p.category);
    });

    const preview = merged.slice(0, 3).map(p => ({
      id: p.id, name: p.name, price: p.price, originalPrice: p.originalPrice,
      category: p.category, unit: p.unit, stock: p.stock
    }));

    if (dryRun) {
      return json({
        success: true,
        dryRun: true,
        mode,
        steps,
        summary: {
          firestoreDocs: fs.docs.length,
          mapped: mapped.length,
          added,
          updated,
          untouched: untouched.length,
          totalAfterSync: nextList.length,
          categories: catMap.size,
          truncated: fs.truncated,
          ms: Date.now() - startedAt
        },
        categories: Array.from(catMap.entries()).map(([id, name]) => ({ id, name })),
        preview
      }, 200, cors);
    }

    // ------------------------------------------------------------------
    // 4. Tulis ke RTDB (array, sama seperti Admin CMS menyimpan menu)
    // ------------------------------------------------------------------
    const writeRes = await fetch(targetUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nextList)
    });
    const writeBody = await writeRes.json().catch(() => null);
    if (!writeRes.ok || (writeBody && writeBody.error)) {
      const msg = (writeBody && writeBody.error) || `HTTP ${writeRes.status}`;
      return json({
        success: false,
        error: `Gagal menyimpan ke RTDB /${menuPath}: ${msg}` +
          (/permission denied/i.test(String(msg))
            ? ' — set env FIREBASE_DATABASE_SECRET (Firebase Console → Realtime Database → Secrets) di Cloudflare Pages, atau arahkan FIREBASE_DATABASE_URL ke RTDB yang aturannya terbuka.'
            : ''),
        steps,
        summary: { mapped: mapped.length, added, updated }
      }, 502, cors);
    }
    steps.rtdbWrite = `ok: ${nextList.length} item → /${menuPath}`;

    // ------------------------------------------------------------------
    // 5. Tulis kategori hasil turunan (merge, id 'semua' tetap di depan)
    // ------------------------------------------------------------------
    if (syncCategories) {
      try {
        const catUrl = `${dbUrl}/${categoryPath}.json${authParam}`;
        const catRes = await fetch(catUrl);
        const catRaw = await catRes.json().catch(() => null);
        const existingCats = rtdbList(catRaw);
        const byId = new Map(existingCats.map(c => [String(c.id), c]));
        byId.set('semua', byId.get('semua') || { id: 'semua', name: 'Semua' });
        catMap.forEach((name, id) => {
          const prev = byId.get(id);
          byId.set(id, prev ? { ...prev, name: prev.name || name } : { id, name });
        });
        const nextCats = Array.from(byId.values());
        const catWrite = await fetch(catUrl, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nextCats)
        });
        const catBody = await catWrite.json().catch(() => null);
        if (!catWrite.ok || (catBody && catBody.error)) {
          steps.rtdbCategories = `gagal: ${(catBody && catBody.error) || catWrite.status}`;
        } else {
          steps.rtdbCategories = `ok: ${nextCats.length} kategori → /${categoryPath}`;
        }
      } catch (err) {
        steps.rtdbCategories = `gagal: ${err.message}`;
      }
    }

    return json({
      success: true,
      mode,
      steps,
      summary: {
        firestoreDocs: fs.docs.length,
        mapped: mapped.length,
        added,
        updated,
        untouched: untouched.length,
        totalAfterSync: nextList.length,
        categories: catMap.size,
        truncated: fs.truncated,
        ms: Date.now() - startedAt
      },
      preview
    }, 200, cors);

  } catch (err) {
    return json({ success: false, error: err && err.message ? err.message : 'Terjadi kesalahan saat sinkronisasi katalog' }, 500, cors);
  }
}
