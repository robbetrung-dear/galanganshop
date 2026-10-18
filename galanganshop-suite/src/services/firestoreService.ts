import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  DocumentData,
  QuerySnapshot,
  Firestore
} from 'firebase/firestore';
import {
  Order, Product, Category, InventoryItem, KasirAccount,
  SiteConfig, JournalEntry, Shift, NotificationItem, Supplier,
  AccountingSettlement, AccountingReconcile
} from '../types';

// Gunakan instance Firestore dari konfigurasi proyek (dapat diganti dengan import db)
let dbInstance: Firestore | null = null;
export const initFirestoreService = (db: Firestore) => {
  dbInstance = db;
};
export const getDB = (): Firestore => {
  if (!dbInstance) {
    // Fallback: inisialisasi default jika belum diset
    dbInstance = getFirestore();
  }
  return dbInstance;
};

// Koleksi
const COLLECTIONS = {
  orders: 'orders',
  onlineOrders: 'online-orders',
  pendingOrders: 'pending-orders',
  inventory: 'inventory',
  inventoryLogs: 'inventory_logs',
  inventoryReceives: 'inventory_receives',
  suppliers: 'suppliers',
  categories: 'categories',
  categoriesMeta: 'categoriesMeta',
  menu: 'menu',
  notifications: 'notifications',
  notificationsLog: 'notifications_log',
  accountingSettlements: 'accounting/settlements',
  accountingReconcile: 'accounting/reconcile',
  accountingReports: 'accounting/reports',
  accountingReceipts: 'accounting/receipts',
};

// Helpers
const colRef = (name: string) => collection(getDB(), name);

// === ORDERS ===
export const fetchOrders = async (): Promise<Order[]> => {
  const snap = await getDocs(colRef(COLLECTIONS.orders));
  return snap.docs.map(d => ({ ...d.data(), orderId: d.id } as Order));
};
export const saveOrder = async (order: Order): Promise<void> => {
  await setDoc(doc(getDB(), COLLECTIONS.orders, order.orderId), order);
};
export const listenOrders = (cb: (orders: Order[]) => void) =>
  onSnapshot(colRef(COLLECTIONS.orders), snap => cb(snap.docs.map(d => ({ ...d.data(), orderId: d.id } as Order))));

// === INVENTORY ===
export const fetchInventory = async (): Promise<InventoryItem[]> => {
  const snap = await getDocs(colRef(COLLECTIONS.inventory));
  return snap.docs.map(d => ({ ...d.data(), id: d.id } as InventoryItem));
};
export const saveInventoryItem = async (item: InventoryItem): Promise<void> => {
  await setDoc(doc(getDB(), COLLECTIONS.inventory, item.id || item.sku), item);
};
export const listenInventory = (cb: (items: InventoryItem[]) => void) =>
  onSnapshot(colRef(COLLECTIONS.inventory), snap => cb(snap.docs.map(d => ({ ...d.data(), id: d.id } as InventoryItem))));

// === SUPPLIERS ===
export const fetchSuppliers = async (): Promise<Supplier[]> => {
  const snap = await getDocs(colRef(COLLECTIONS.suppliers));
  return snap.docs.map(d => ({ ...d.data(), id: d.id } as Supplier));
};
export const saveSupplier = async (s: Supplier): Promise<void> => {
  await setDoc(doc(getDB(), COLLECTIONS.suppliers, s.id || s.name), s);
};

// === CATEGORIES ===
export const fetchCategories = async (): Promise<Category[]> => {
  const snap = await getDocs(colRef(COLLECTIONS.categories));
  return snap.docs.map(d => ({ ...d.data(), id: d.id } as Category));
};
export const saveCategory = async (cat: Category): Promise<void> => {
  await setDoc(doc(getDB(), COLLECTIONS.categories, cat.id || cat.name), cat);
};

// === MENU ===
export const fetchMenu = async (): Promise<Product[]> => {
  const snap = await getDocs(colRef(COLLECTIONS.menu));
  return snap.docs.map(d => ({ ...d.data(), id: d.id } as Product));
};
export const saveMenuItem = async (item: Product): Promise<void> => {
  await setDoc(doc(getDB(), COLLECTIONS.menu, item.id), item);
};
export const listenMenu = (cb: (items: Product[]) => void) =>
  onSnapshot(colRef(COLLECTIONS.menu), snap => cb(snap.docs.map(d => ({ ...d.data(), id: d.id } as Product))));

// === NOTIFICATIONS ===
export const fetchNotifications = async (): Promise<NotificationItem[]> => {
  const snap = await getDocs(colRef(COLLECTIONS.notifications));
  return snap.docs.map(d => ({ ...d.data(), id: d.id } as NotificationItem));
};
export const saveNotification = async (n: NotificationItem): Promise<void> => {
  await setDoc(doc(getDB(), COLLECTIONS.notifications, n.id || `notif-${Date.now()}`), n);
};
export const listenNotifications = (cb: (items: NotificationItem[]) => void) =>
  onSnapshot(colRef(COLLECTIONS.notifications), snap => cb(snap.docs.map(d => ({ ...d.data(), id: d.id } as NotificationItem))));

// === ACCOUNTING / SETTLEMENTS ===
export const fetchSettlements = async (): Promise<AccountingSettlement[]> => {
  const snap = await getDocs(colRef(COLLECTIONS.accountingSettlements));
  return snap.docs.map(d => ({ ...d.data(), id: d.id } as AccountingSettlement));
};
export const saveSettlement = async (s: AccountingSettlement): Promise<void> => {
  await setDoc(doc(getDB(), COLLECTIONS.accountingSettlements, s.id || `settlement-${Date.now()}`), s);
};

// === ACCOUNTING / RECONCILE ===
export const fetchReconcile = async (): Promise<AccountingReconcile[]> => {
  const snap = await getDocs(colRef(COLLECTIONS.accountingReconcile));
  return snap.docs.map(d => ({ ...d.data(), id: d.id } as AccountingReconcile));
};
export const saveReconcile = async (r: AccountingReconcile): Promise<void> => {
  await setDoc(doc(getDB(), COLLECTIONS.accountingReconcile, r.id || `reconcile-${Date.now()}`), r);
};

// === PRODUCTS (storeData/products atau koleksi menu) ===
export const fetchProducts = async (): Promise<Product[]> => fetchMenu();
export const saveProduct = saveMenuItem;

// === CATEGORIES META ===
export const fetchCategoriesMeta = async () => {
  const snap = await getDocs(colRef(COLLECTIONS.categoriesMeta));
  return snap.docs.map(d => d.data());
};

// === INVENTORY LOGS ===
export const fetchInventoryLogs = async () => {
  const snap = await getDocs(colRef(COLLECTIONS.inventoryLogs));
  return snap.docs.map(d => d.data());
};

// === NOTIFICATIONS LOG ===
export const fetchNotificationsLog = async () => {
  const snap = await getDocs(colRef(COLLECTIONS.notificationsLog));
  return snap.docs.map(d => d.data());
};
