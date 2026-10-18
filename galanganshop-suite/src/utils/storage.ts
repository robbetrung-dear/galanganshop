import { syncInventoryDeduct, syncOrderToFirestore } from '../services/dataSync';
import { getDB, doc, getDoc, collection, getDocs } from './firestoreService';
import { defaultSiteConfig, initialCategories, initialInventory, initialKasirAccounts, initialProducts } from '../data/initialData';
import {
  Category, InventoryItem, JournalEntry, KasirAccount, Order, Product, Shift, SiteConfig
} from '../types';
import {
  fetchOrders, saveOrder,
  fetchInventory, saveInventoryItem,
  fetchCategories, saveCategory,
  fetchMenu, saveMenuItem,
  fetchSuppliers, saveSupplier,
  fetchNotifications, saveNotification,
  fetchSettlements, saveSettlement,
  fetchReconcile, saveReconcile
} from './firestoreService';

export const getSiteConfig = async (): Promise<SiteConfig> => {
  try {
    const snap = await getDoc(doc(getDB(), 'storeData', 'siteSettings'));
    return snap.exists() ? (snap.data() as SiteConfig) : defaultSiteConfig;
  } catch {
    return defaultSiteConfig;
  }
};
export const saveSiteConfig = async (config: SiteConfig): Promise<void> => {};

export const getProducts = async (): Promise<Product[]> => {
  try { return await fetchMenu(); } catch { return initialProducts; }
};
export const saveProducts = async (products: Product[]): Promise<void> => {
  for (const p of products) await saveMenuItem(p);
};

export const getCategories = async (): Promise<Category[]> => {
  try { return await fetchCategories(); } catch { return initialCategories; }
};
export const saveCategories = async (categories: Category[]): Promise<void> => {
  for (const c of categories) await saveCategory(c);
};

export const getOrders = async (): Promise<Order[]> => {
  try { return await fetchOrders(); } catch { return []; }
};
export const saveOrders = async (orders: Order[]): Promise<void> => {
  for (const o of orders) await saveOrder(o);
};
export const appendOrder = async (order: Order): Promise<void> => await saveOrder(order);
export const getRecentOrders = async (): Promise<Order[]> => {
  const all = await getOrders(); return all.slice(0, 5);
};
export const appendRecentOrder = async (order: Order): Promise<void> => await appendOrder(order);

export const getKasirAccounts = async (): Promise<KasirAccount[]> => {
  try {
    const snap = await getDocs(collection(getDB(), 'kasirAccount'));
    return snap.docs.map(d => ({ ...d.data(), id: d.id } as KasirAccount));
  } catch {
    return initialKasirAccounts;
  }
};
export const saveKasirAccounts = async (accounts: KasirAccount[]): Promise<void> => {};

export const getAdminPassword = (): string => 'Dear2226';
export const setAdminPassword = (pw: string): void => {};

export const getInventory = async (): Promise<InventoryItem[]> => {
  try { return await fetchInventory(); } catch { return initialInventory; }
};
export const saveInventory = async (items: InventoryItem[]): Promise<void> => {
  for (const i of items) await saveInventoryItem(i);
};

export const getActiveShift = (): Shift | null => null;
export const setActiveShift = (shift: Shift | null): void => {};
export const getShifts = (): Shift[] => [];
export const saveShifts = (shifts: Shift[]): void => {};

export const getJournalEntries = (): JournalEntry[] => [
  { id: 'jrn-init-1', date: new Date(Date.now() - 86400000 * 2).toISOString(), refNo: 'REF-MODAL-AWAL', description: 'Modal Awal Kas & Persediaan Toko', debitAccount: '1001 - Kas Tunai', creditAccount: '3001 - Modal Pemilik', amount: 15000000 },
  { id: 'jrn-init-2', date: new Date(Date.now() - 86400000).toISOString(), refNo: 'REF-STOCK-PURCHASE', description: 'Pembelian Stok Barang Dagang & Bahan Baku', debitAccount: '1201 - Persediaan Barang Dagang', creditAccount: '1001 - Kas Tunai', amount: 6500000 }
];
export const saveJournalEntries = (entries: JournalEntry[]): void => {};
export const appendJournalEntry = (entry: Omit<JournalEntry, 'id'>): void => {};
export const deductStockForOrder = async (order: Order): Promise<void> => {
  const items = order.items.map(i => ({ sku: i.id, qty: i.quantity }));
  await syncInventoryDeduct(items);
};
