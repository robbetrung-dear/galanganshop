import {
  saveOrder, saveInventoryItem, fetchInventory,
  saveSettlement, saveReconcile,
  saveNotification, saveMenuItem, saveCategory,
  getDB, doc, getDoc, setDoc, writeBatch, collection
} from './firestoreService';
import { Order, InventoryItem, AccountingSettlement, AccountingReconcile, NotificationItem, Product, Category } from '../types';

export const syncOrderToFirestore = async (order: Order): Promise<void> => {
  const snap = await getDoc(doc(getDB(), 'orders', order.orderId));
  if (snap.exists() && (snap.data() as any)?.updatedAt > order.createdAt) return;
  await saveOrder(order);
};

export const syncInventoryDeduct = async (items: { sku: string; qty: number }[]): Promise<void> => {
  const batch = writeBatch(getDB());
  for (const it of items) {
    const ref = doc(getDB(), 'inventory', it.sku);
    const snap = await getDoc(ref);
    if (!snap.exists()) continue;
    const current = snap.data() as InventoryItem;
    const updated = { ...current, stock: Math.max(0, current.stock - it.qty), updatedAt: new Date().toISOString() };
    batch.set(ref, updated);
  }
  await batch.commit();
};

export const syncSettlement = async (settlement: AccountingSettlement): Promise<void> => {
  await saveSettlement(settlement);
  const snap = await getDoc(doc(getDB(), 'accounting/reconcile', settlement.id || settlement.referenceId || settlement.date));
  if (!snap.exists()) await saveReconcile({ id: settlement.referenceId || settlement.id, date: settlement.date, totalSales: settlement.amount, totalCash: settlement.amount, difference: 0, notes: settlement.description } as AccountingReconcile);
  else {
    const r = snap.data() as AccountingReconcile;
    await saveReconcile({ ...r, totalSales: (r.totalSales || 0) + settlement.amount, totalCash: (r.totalCash || 0) + settlement.amount, difference: r.difference } as AccountingReconcile);
  }
};

export const syncInventoryReceive = async (item: InventoryItem, amount: number): Promise<void> => {
  const ref = doc(getDB(), 'inventory', item.id || item.sku);
  const snap = await getDoc(ref);
  const current = snap.exists() ? (snap.data() as InventoryItem) : item;
  const updatedStock = (current.stock || 0) + amount;
  await setDoc(ref, { ...current, stock: updatedStock, updatedAt: new Date().toISOString() });
  await setDoc(doc(getDB(), 'inventory_logs', item.id || item.sku + '-' + Date.now()), { action: 'receive', itemId: item.id || item.sku, amount, timestamp: new Date().toISOString() });
};

export const syncNotification = async (notif: NotificationItem): Promise<void> => {
  await saveNotification(notif);
};

export const syncMenuUpdate = async (product: Product): Promise<void> => {
  await saveMenuItem(product);
};

export const syncCategoryUpdate = async (cat: Category): Promise<void> => {
  await saveCategory(cat);
};
