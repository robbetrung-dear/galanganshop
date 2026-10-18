import React, { useState } from 'react';
import { Category, CateringPackage, KasirAccount, Order, Product, SiteConfig } from '../../types';
import { generateOrderReceiptPDF } from '../../utils/pdfGenerator';
import { getAdminPassword, setAdminPassword } from '../../utils/storage';

interface MasterAdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  config: SiteConfig;
  onSaveConfig: (newConfig: SiteConfig) => void;
  products: Product[];
  onSaveProducts: (products: Product[]) => void;
  categories: Category[];
  onSaveCategories: (categories: Category[]) => void;
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: string) => void;
  kasirAccounts: KasirAccount[];
  onSaveKasirAccounts: (accounts: KasirAccount[]) => void;
  onLogoutAdmin: () => void;
  onShowToast: (msg: string) => void;
}

export const MasterAdminPanel: React.FC<MasterAdminPanelProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  products,
  onSaveProducts,
  categories,
  onSaveCategories,
  orders,
  onUpdateOrderStatus,
  kasirAccounts,
  onSaveKasirAccounts,
  onLogoutAdmin,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'orders'
    | 'branding'
    | 'menu'
    | 'categories'
    | 'hero'
    | 'texts'
    | 'delivery_sosmed'
    | 'payment_settings'
    | 'database_firebase'
    | 'security'
    | 'owner_wa'
    | 'cloudflare_guide'
  >('orders');

  const [currentConfig, setCurrentConfig] = useState<SiteConfig>(config);
  const [menuSearch, setMenuSearch] = useState('');
  const [menuFilter, setMenuFilter] = useState<'all' | 'kasir' | 'visible' | 'hidden'>('all');
  const [csvMonthFilter, setCsvMonthFilter] = useState('all');

  // Product modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    category: 'retail_goods',
    price: 15000,
    originalPrice: null,
    stock: 25,
    unit: 'pcs',
    badge: '',
    image: '',
    description: '',
    isSpicy: false,
    showOnMain: true
  });

  // Category modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState<Partial<Category>>({
    name: '',
    id: '',
    icon: 'fa-tag',
    iconType: 'fa',
    imageUrl: ''
  });

  // Password & Supervisor PIN state
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const [supervisorPinNew, setSupervisorPinNew] = useState('');
  const [supervisorPinConfirm, setSupervisorPinConfirm] = useState('');
  const [supervisorPinMsg, setSupervisorPinMsg] = useState('');

  // Cashier Account Modal state
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [newAccountForm, setNewAccountForm] = useState({
    name: '',
    username: '',
    pin: '',
    role: 'Staff Kasir' as const,
    status: 'Aktif' as const
  });

  if (!isOpen) return null;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val || 0);
  };

  const handleSaveAll = () => {
    onSaveConfig(currentConfig);
    onShowToast('Pengaturan website & konfigurasi toko berhasil disimpan!');
  };

  // Word-by-word branding functions
  const addBrandWord = () => {
    const defaultColors = ['#ea580c', '#f59e0b', '#e11d48', '#10b981', '#6366f1'];
    const nextColor = defaultColors[currentConfig.brandWords.length % defaultColors.length];
    const updated = [...currentConfig.brandWords, { text: 'BARU', color: nextColor }];
    setCurrentConfig({
      ...currentConfig,
      brandWords: updated,
      brandName: updated.map(w => w.text).join(' ')
    });
  };

  const removeBrandWord = (idx: number) => {
    if (currentConfig.brandWords.length <= 1) return;
    const updated = currentConfig.brandWords.filter((_, i) => i !== idx);
    setCurrentConfig({
      ...currentConfig,
      brandWords: updated,
      brandName: updated.map(w => w.text).join(' ')
    });
  };

  const updateBrandWord = (idx: number, text: string, color: string) => {
    const updated = [...currentConfig.brandWords];
    updated[idx] = { text, color };
    setCurrentConfig({
      ...currentConfig,
      brandWords: updated,
      brandName: updated.map(w => w.text).join(' ')
    });
  };

  // Product functions
  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setProductForm({
      name: '',
      category: categories.find(c => c.id !== 'all')?.id || 'retail_goods',
      price: 25000,
      originalPrice: null,
      stock: 30,
      unit: 'pcs',
      badge: '',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      description: '',
      isSpicy: false,
      showOnMain: true
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setProductForm({ ...prod });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price) {
      alert('Nama produk dan harga jual wajib diisi!');
      return;
    }

    const catObj = categories.find(c => c.id === productForm.category);
    const payload: Product = {
      id: editingProductId || 'prod-' + Date.now(),
      name: productForm.name || '',
      category: productForm.category || 'retail_goods',
      categoryLabel: catObj ? catObj.name : 'Ritel',
      price: Number(productForm.price) || 0,
      originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : null,
      stock: Number(productForm.stock) || 0,
      unit: productForm.unit || 'pcs',
      badge: productForm.badge || '',
      badgeColor: 'bg-orange-600 text-white',
      image: productForm.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      description: productForm.description || '',
      isSpicy: Boolean(productForm.isSpicy),
      showOnMain: productForm.showOnMain !== false,
      updatedAt: Date.now()
    };

    let updatedProducts = [...products];
    if (editingProductId) {
      const idx = updatedProducts.findIndex(p => p.id === editingProductId);
      if (idx >= 0) updatedProducts[idx] = payload;
    } else {
      updatedProducts.unshift(payload);
    }

    onSaveProducts(updatedProducts);
    setIsProductModalOpen(false);
    onShowToast(editingProductId ? 'Produk berhasil diperbarui!' : 'Produk baru berhasil ditambahkan!');
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus produk ini dari katalog?')) {
      const updated = products.filter(p => p.id !== id);
      onSaveProducts(updated);
      onShowToast('Produk berhasil dihapus.');
    }
  };

  const handleToggleProductSpicy = (prod: Product) => {
    const updated = products.map(p => (p.id === prod.id ? { ...p, isSpicy: !p.isSpicy } : p));
    onSaveProducts(updated);
  };

  const handleToggleProductShowOnMain = (prod: Product) => {
    const updated = products.map(p => (p.id === prod.id ? { ...p, showOnMain: p.showOnMain === false ? true : false } : p));
    onSaveProducts(updated);
    onShowToast(`Status tampil "${prod.name}" diperbarui.`);
  };

  const handleBulkKasirVisibility = (show: boolean) => {
    const updated = products.map(p => (p.fromKasir || p.id.startsWith('FB-') ? { ...p, showOnMain: show } : p));
    onSaveProducts(updated);
    onShowToast(show ? 'Semua item menu kasir ditampilkan di storefront!' : 'Semua menu kasir disembunyikan dari storefront.');
  };

  // Category functions
  const handleOpenAddCategory = () => {
    setEditingCategoryId(null);
    setCategoryForm({ name: '', id: '', icon: 'fa-tag', iconType: 'fa', imageUrl: '' });
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategoryId(cat.id);
    setCategoryForm({ ...cat });
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name) {
      alert('Nama kategori wajib diisi!');
      return;
    }

    const genId = categoryForm.id || categoryForm.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const newCat: Category = {
      id: editingCategoryId || genId,
      name: categoryForm.name,
      icon: categoryForm.icon || 'fa-tag',
      iconType: categoryForm.iconType || 'fa',
      imageUrl: categoryForm.imageUrl || ''
    };

    let updated = [...categories];
    if (editingCategoryId) {
      const idx = updated.findIndex(c => c.id === editingCategoryId);
      if (idx >= 0) updated[idx] = newCat;
    } else {
      updated.push(newCat);
    }

    onSaveCategories(updated);
    setIsCategoryModalOpen(false);
    onShowToast('Kategori berhasil disimpan!');
  };

  const handleDeleteCategory = (catId: string) => {
    if (catId === 'all') {
      alert('Kategori "Semua Produk" adalah kategori sistem dan tidak bisa dihapus.');
      return;
    }
    if (confirm(`Yakin ingin menghapus kategori ini?`)) {
      const updated = categories.filter(c => c.id !== catId);
      onSaveCategories(updated);
      onShowToast('Kategori telah dihapus.');
    }
  };

  const handleMoveCategory = (index: number, direction: number) => {
    const targetIdx = index + direction;
    if (targetIdx < 1 || targetIdx >= categories.length) return; // keep 'all' at index 0
    const updated = [...categories];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    onSaveCategories(updated);
  };

  // Password & Supervisor PIN handler
  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    const savedPw = getAdminPassword();
    if (currentPasswordInput !== savedPw) {
      setPasswordError('Password saat ini salah!');
      return;
    }
    if (newPasswordInput.length < 8) {
      setPasswordError('Password baru minimal 8 karakter!');
      return;
    }
    if (!/[A-Z]/.test(newPasswordInput) || !/[0-9]/.test(newPasswordInput) || !/[a-zA-Z]/.test(newPasswordInput)) {
      setPasswordError('Password baru wajib mengandung huruf, angka, dan minimal satu huruf kapital (A-Z)!');
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordError('Konfirmasi password tidak cocok!');
      return;
    }

    setAdminPassword(newPasswordInput);
    setCurrentPasswordInput('');
    setNewPasswordInput('');
    setConfirmPasswordInput('');
    setPasswordSuccess('Password Master Admin berhasil diperbarui!');
    onShowToast('Password Master Admin berhasil diperbarui!');
  };

  const handleSaveSupervisorPin = () => {
    setSupervisorPinMsg('');
    if (!/^\d{6}$/.test(supervisorPinNew)) {
      setSupervisorPinMsg('PIN harus 6 digit angka numerik.');
      return;
    }
    if (supervisorPinNew !== supervisorPinConfirm) {
      setSupervisorPinMsg('PIN baru dan konfirmasi tidak cocok.');
      return;
    }

    const updated = { ...currentConfig, supervisorPin: supervisorPinNew };
    setCurrentConfig(updated);
    onSaveConfig(updated);
    setSupervisorPinNew('');
    setSupervisorPinConfirm('');
    setSupervisorPinMsg('✅ Supervisor PIN berhasil diperbarui!');
    onShowToast('Supervisor PIN berhasil disimpan.');
  };

  // Cashier Accounts CRUD
  const handleAddKasirAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountForm.name || !newAccountForm.username || !newAccountForm.pin) {
      alert('Semua bidang akun kasir wajib diisi!');
      return;
    }
    if (!/^\d{6}$/.test(newAccountForm.pin)) {
      alert('PIN kasir wajib 6 digit angka.');
      return;
    }

    const newAcc: KasirAccount = {
      id: 'acc-' + Date.now(),
      name: newAccountForm.name,
      username: newAccountForm.username.toLowerCase().trim(),
      pin: newAccountForm.pin.trim(),
      role: newAccountForm.role,
      status: newAccountForm.status
    };

    const updated = [...kasirAccounts, newAcc];
    onSaveKasirAccounts(updated);
    setIsAddAccountModalOpen(false);
    setNewAccountForm({ name: '', username: '', pin: '', role: 'Staff Kasir', status: 'Aktif' });
    onShowToast(`Akun kasir "${newAcc.name}" berhasil ditambahkan.`);
  };

  const handleDeleteKasirAccount = (id: string) => {
    if (kasirAccounts.length <= 1) {
      alert('Minimal harus ada satu akun kasir terdaftar.');
      return;
    }
    if (confirm('Apakah Anda yakin ingin menghapus akun kasir ini?')) {
      const updated = kasirAccounts.filter(a => a.id !== id);
      onSaveKasirAccounts(updated);
      onShowToast('Akun kasir dihapus.');
    }
  };

  // Export orders to CSV
  const handleExportOrdersCsv = () => {
    let list = [...orders];
    if (csvMonthFilter !== 'all') {
      list = list.filter(o => o.createdAt && o.createdAt.startsWith(csvMonthFilter));
    }
    if (list.length === 0) {
      alert('Tidak ada data pesanan pada periode yang dipilih.');
      return;
    }

    const headers = [
      'No', 'ID Pesanan', 'Tanggal', 'Nama Pelanggan', 'No WhatsApp',
      'Alamat', 'Daftar Produk', 'Layanan Kurir', 'Subtotal', 'Ongkir', 'Total Tagihan', 'Metode Bayar', 'Status'
    ];

    const escapeCsv = (str: any) => `"${String(str || '').replace(/"/g, '""')}"`;

    const rows = list.map((o, idx) => {
      const itemsText = o.items.map(i => `${i.name} (${i.quantity}x)`).join('; ');
      return [
        idx + 1,
        escapeCsv(o.orderId),
        escapeCsv(new Date(o.createdAt).toLocaleString('id-ID')),
        escapeCsv(o.customer?.name || o.customerName || '-'),
        escapeCsv(o.customer?.phone || o.customerPhone || '-'),
        escapeCsv(o.customer?.address || o.customerAddress || (o.isPickup ? 'Ambil di Toko' : '-')),
        escapeCsv(itemsText),
        escapeCsv(o.isPickup ? 'Ambil Sendiri' : (o.courier?.name || 'Kurir')),
        o.subtotal || 0,
        o.courierFee || 0,
        o.totalAmount || 0,
        escapeCsv(o.paymentMethod || 'QRIS'),
        escapeCsv(o.status || 'Pending')
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Ringkasan_Pesanan_${csvMonthFilter}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast(`Berhasil mengunduh ringkasan ${list.length} pesanan (.CSV)`);
  };

  // Filter products for admin
  const filteredAdminProducts = products.filter(p => {
    if (menuFilter === 'kasir' && !p.fromKasir && !p.id.startsWith('FB-')) return false;
    if (menuFilter === 'visible' && p.showOnMain === false) return false;
    if (menuFilter === 'hidden' && p.showOnMain !== false) return false;
    if (menuSearch) {
      const q = menuSearch.toLowerCase();
      return p.name.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q)) || p.category.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-none sm:rounded-3xl max-w-5xl w-full h-full sm:h-[94vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center text-lg shadow-sm">
              <i className="fa-solid fa-lock"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-stone-900 text-base sm:text-lg">Panel Master Admin</h3>
                <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 text-[10px] font-black uppercase">
                  Single Master Controller
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Pusat kontrol terpadu Storefront Catalog, POS Kasir, Inventori, dan Pembukuan Keuangan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onLogoutAdmin}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 transition cursor-pointer"
            >
              <i className="fa-solid fa-right-from-bracket mr-1"></i> Logout
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full text-stone-400 hover:text-stone-700 flex items-center justify-center cursor-pointer"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>
        </div>

        {/* Tab Navigation (12 Tabs) */}
        <div className="flex items-center border-b border-stone-200 bg-white px-3 flex-shrink-0 overflow-x-auto no-scrollbar scroll-smooth py-1 gap-1">
          {[
            { id: 'orders', name: '1. Validasi Pesanan', icon: 'fa-list-check' },
            { id: 'branding', name: '2. Logo & Judul', icon: 'fa-paintbrush' },
            { id: 'menu', name: '3. Menu & Multi-Produk', icon: 'fa-store' },
            { id: 'categories', name: '4. Kelola Kategori', icon: 'fa-layer-group' },
            { id: 'hero', name: '5. Hero & Tema', icon: 'fa-image' },
            { id: 'texts', name: '6. Teks & Footer', icon: 'fa-font' },
            { id: 'delivery_sosmed', name: '7. Mitra Delivery', icon: 'fa-share-nodes' },
            { id: 'payment_settings', name: '8. Pembayaran & QRIS', icon: 'fa-qrcode' },
            { id: 'database_firebase', name: '9. Database & Sync', icon: 'fa-database' },
            { id: 'security', name: '10. Keamanan & Kasir', icon: 'fa-shield-halved' },
            { id: 'owner_wa', name: '11. Nomor WA Owner', icon: 'fa-brands fa-whatsapp' },
            { id: 'cloudflare_guide', name: '12. Panduan Deploy', icon: 'fa-brands fa-cloudflare' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-3 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab.id ? 'bg-orange-600 text-white shadow-xs' : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <i className={`${tab.icon.includes(' ') ? tab.icon : `fa-solid ${tab.icon}`} text-[11px]`}></i>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-6">
          {/* TAB 1: VALIDASI PESANAN */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="bg-orange-50 p-4 rounded-2xl border border-orange-200">
                <h4 className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
                  <i className="fa-solid fa-list-check text-orange-600"></i>
                  <span>Validasi & Pengiriman Pesanan Online Real-Time</span>
                </h4>
                <p className="text-xs text-stone-600 mt-1">
                  Pantau pesanan yang masuk dari storefront katalog. Perbarui status menjadi "Dikirim" atau "Selesai", cetak struk, dan ekspor CSV.
                </p>
              </div>

              {/* Monthly CSV Export */}
              <div className="bg-white p-4 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div>
                  <h5 className="font-black text-xs uppercase tracking-wider text-stone-900 flex items-center gap-2">
                    <i className="fa-solid fa-file-csv text-emerald-600 text-base"></i>
                    <span>Download Rekap Pesanan (.CSV)</span>
                  </h5>
                  <p className="text-[11px] text-stone-500 mt-0.5">Ekspor data riwayat transaksi untuk Excel atau Google Sheets.</p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={csvMonthFilter}
                    onChange={e => setCsvMonthFilter(e.target.value)}
                    className="px-3 py-1.5 border border-stone-300 rounded-xl text-xs bg-stone-50 font-bold"
                  >
                    <option value="all">Semua Riwayat</option>
                    <option value="2026-10">Oktober 2026</option>
                    <option value="2026-09">September 2026</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleExportOrdersCsv}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <i className="fa-solid fa-download"></i>
                    <span>Unduh CSV</span>
                  </button>
                </div>
              </div>

              {/* Orders List */}
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="text-center py-10 bg-stone-50 rounded-2xl border border-dashed border-stone-200 text-stone-400 text-xs">
                    <i className="fa-solid fa-box-open text-3xl mb-2 text-stone-300"></i>
                    <p>Belum ada pesanan masuk.</p>
                  </div>
                ) : (
                  orders.map(order => {
                    const custName = order.customer?.name || order.customerName || 'Pelanggan';
                    const custPhone = order.customer?.phone || order.customerPhone || '';
                    const custAddress = order.customer?.address || order.customerAddress || (order.isPickup ? 'Ambil di Toko (Pickup)' : '-');

                    return (
                      <div key={order.orderId} className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs relative">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h5 className="text-sm font-black text-stone-900 font-mono">{order.orderId}</h5>
                            <p className="text-[10px] text-stone-500 font-medium">
                              {new Date(order.createdAt).toLocaleString('id-ID')}
                            </p>
                          </div>
                          <span
                            className={`px-2.5 py-1 text-[10px] font-bold rounded-md ${
                              order.status === 'Selesai'
                                ? 'bg-emerald-100 text-emerald-800'
                                : order.status === 'Dikirim'
                                ? 'bg-indigo-100 text-indigo-800'
                                : order.status === 'Dibayar'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 text-xs">
                          <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                            <p className="font-extrabold text-stone-400 text-[10px] uppercase">Data Pelanggan</p>
                            <p className="text-stone-900 font-black text-sm mt-0.5">{custName}</p>
                            {custPhone && (
                              <a
                                href={`https://wa.me/${custPhone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-emerald-700 font-bold mt-1 text-xs hover:underline"
                              >
                                <i className="fa-brands fa-whatsapp text-emerald-600"></i>
                                <span>{custPhone}</span>
                              </a>
                            )}
                            <p className="text-stone-600 mt-1 text-[11px] leading-snug">{custAddress}</p>
                          </div>

                          <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200 flex flex-col justify-between">
                            <div>
                              <p className="font-extrabold text-emerald-800 text-[10px] uppercase">Rincian Tagihan</p>
                              <p className="text-emerald-700 font-black text-base mt-0.5">{formatRupiah(order.totalAmount)}</p>
                              <div className="mt-1 text-[11px] text-stone-600 space-y-0.5">
                                {order.items.map((it, idx) => (
                                  <div key={idx} className="flex justify-between">
                                    <span>{it.name} x{it.quantity}</span>
                                    <span>{formatRupiah(it.price * it.quantity)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="mt-2 text-[10px] text-stone-500">
                              Layanan: <strong>{order.isPickup ? 'Ambil di Outlet' : (order.courier?.name || 'Kurir')}</strong>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100">
                          <div className="flex items-center gap-2">
                            {order.status !== 'Dikirim' && order.status !== 'Selesai' && (
                              <button
                                type="button"
                                onClick={() => onUpdateOrderStatus(order.orderId, 'Dikirim')}
                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                              >
                                Set Dikirim
                              </button>
                            )}
                            {order.status !== 'Selesai' && (
                              <button
                                type="button"
                                onClick={() => onUpdateOrderStatus(order.orderId, 'Selesai')}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                              >
                                Set Selesai
                              </button>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => generateOrderReceiptPDF(order, currentConfig)}
                            className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-stone-300 cursor-pointer"
                          >
                            <i className="fa-solid fa-file-pdf text-red-500"></i>
                            <span>Cetak Struk PDF</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: BRANDING & JUDUL PER KATA */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
                <h4 className="font-extrabold text-stone-900 text-sm">Pengaturan Logo & Warna Judul Per Kata</h4>
                <p className="text-xs text-stone-500">
                  Ubah logo toko (icon / image URL), nama brand, dan beri warna spesifik untuk masing-masing kata.
                </p>
              </div>

              {/* Live Preview */}
              <div className="p-4 rounded-2xl border border-stone-200 bg-stone-100 space-y-2">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Live Preview Header Brand:</span>
                <div className="p-3 bg-white rounded-xl shadow-xs border border-stone-200 flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md overflow-hidden flex-shrink-0"
                    style={{ backgroundColor: currentConfig.logoBgColor || '#ea580c' }}
                  >
                    {currentConfig.logoType === 'image' && currentConfig.logoImage ? (
                      <img src={currentConfig.logoImage} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <i className={`${currentConfig.logoIcon || 'fa-solid fa-store'} text-lg`}></i>
                    )}
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 font-black text-lg tracking-tight flex-wrap">
                      {currentConfig.brandWords.map((w, idx) => (
                        <span key={idx} style={{ color: w.color }}>{w.text}</span>
                      ))}
                    </div>
                    <span className="ml-2 text-xs px-2 py-0.5 bg-stone-100 text-stone-600 rounded-md font-medium border border-stone-200">
                      {currentConfig.tagline}
                    </span>
                  </div>
                </div>
              </div>

              {/* Logo Settings */}
              <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-4">
                <h5 className="text-xs font-black uppercase text-stone-800 tracking-wider">1. Pengaturan Logo Toko</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Tipe Logo</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setCurrentConfig({ ...currentConfig, logoType: 'icon' })}
                        className={`px-4 py-2 rounded-xl text-xs flex-1 cursor-pointer font-bold ${
                          currentConfig.logoType === 'icon' ? 'bg-orange-600 text-white' : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        Icon FontAwesome
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentConfig({ ...currentConfig, logoType: 'image' })}
                        className={`px-4 py-2 rounded-xl text-xs flex-1 cursor-pointer font-bold ${
                          currentConfig.logoType === 'image' ? 'bg-orange-600 text-white' : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        Foto / URL Gambar
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Warna Background Logo</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={currentConfig.logoBgColor}
                        onChange={e => setCurrentConfig({ ...currentConfig, logoBgColor: e.target.value })}
                        className="w-10 h-10 rounded-xl cursor-pointer border border-stone-300 p-0.5"
                      />
                      <input
                        type="text"
                        value={currentConfig.logoBgColor}
                        onChange={e => setCurrentConfig({ ...currentConfig, logoBgColor: e.target.value })}
                        className="flex-1 p-2 rounded-xl border border-stone-300 text-xs font-mono"
                      />
                    </div>
                  </div>

                  {currentConfig.logoType === 'icon' ? (
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Class Icon FontAwesome</label>
                      <input
                        type="text"
                        value={currentConfig.logoIcon}
                        onChange={e => setCurrentConfig({ ...currentConfig, logoIcon: e.target.value })}
                        placeholder="fa-solid fa-store"
                        className="w-full p-2.5 rounded-xl border border-stone-300 text-xs font-mono"
                      />
                    </div>
                  ) : (
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-stone-700 uppercase mb-1">URL Gambar Logo</label>
                      <input
                        type="url"
                        value={currentConfig.logoImage}
                        onChange={e => setCurrentConfig({ ...currentConfig, logoImage: e.target.value })}
                        placeholder="https://..."
                        className="w-full p-2.5 rounded-xl border border-stone-300 text-xs"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Word-by-word branding */}
              <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-black uppercase text-stone-800 tracking-wider">2. Kata & Warna Judul Toko</h5>
                  <button
                    type="button"
                    onClick={addBrandWord}
                    className="px-3 py-1 bg-stone-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    + Tambah Kata
                  </button>
                </div>

                <div className="space-y-3">
                  {currentConfig.brandWords.map((w, idx) => (
                    <div key={idx} className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="w-6 h-6 rounded bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={w.text}
                          onChange={e => updateBrandWord(idx, e.target.value, w.color)}
                          className="flex-1 p-2 rounded-lg border border-stone-300 text-xs font-bold bg-white"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={w.color}
                          onChange={e => updateBrandWord(idx, w.text, e.target.value)}
                          className="w-9 h-9 rounded-lg cursor-pointer border border-stone-300"
                        />
                        {currentConfig.brandWords.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeBrandWord(idx)}
                            className="p-2 text-stone-400 hover:text-red-600 cursor-pointer"
                          >
                            <i className="fa-solid fa-trash-can text-sm"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Tagline Restoran</label>
                    <input
                      type="text"
                      value={currentConfig.tagline}
                      onChange={e => setCurrentConfig({ ...currentConfig, tagline: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-stone-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Warna Header Navbar</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={currentConfig.headerBgColor}
                        onChange={e => setCurrentConfig({ ...currentConfig, headerBgColor: e.target.value })}
                        className="w-10 h-10 rounded-xl cursor-pointer border border-stone-300"
                      />
                      <input
                        type="text"
                        value={currentConfig.headerBgColor}
                        onChange={e => setCurrentConfig({ ...currentConfig, headerBgColor: e.target.value })}
                        className="flex-1 p-2 rounded-xl border border-stone-300 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MENU & MULTI-PRODUK */}
          {activeTab === 'menu' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                <div>
                  <h4 className="font-extrabold text-stone-900 text-sm">Katalog Multi-Produk (Ritel & F&B)</h4>
                  <p className="text-xs text-stone-500">Kelola sembako, snack, minuman, serta menu kuliner siap santap.</p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddProduct}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <i className="fa-solid fa-plus"></i>
                  <span>+ Tambah Produk Baru</span>
                </button>
              </div>

              {/* Search & Filter toolbar */}
              <div className="bg-white p-3.5 rounded-2xl border border-stone-200 space-y-3">
                <input
                  type="text"
                  value={menuSearch}
                  onChange={e => setMenuSearch(e.target.value)}
                  placeholder="Cari nama produk, SKU, atau kategori..."
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-xs"
                />

                <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    {(['all', 'kasir', 'visible', 'hidden'] as const).map(flt => (
                      <button
                        key={flt}
                        type="button"
                        onClick={() => setMenuFilter(flt)}
                        className={`px-3 py-1 rounded-lg font-bold uppercase text-[10px] cursor-pointer transition ${
                          menuFilter === flt ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        {flt}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleBulkKasirVisibility(true)}
                      className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-lg text-[10px] font-bold cursor-pointer"
                    >
                      Tampilkan Semua Kasir
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBulkKasirVisibility(false)}
                      className="px-2.5 py-1 bg-stone-100 text-stone-600 border border-stone-300 rounded-lg text-[10px] font-bold cursor-pointer"
                    >
                      Sembunyikan Semua
                    </button>
                  </div>
                </div>
              </div>

              {/* Products List */}
              <div className="space-y-3">
                {filteredAdminProducts.map(prod => (
                  <div key={prod.id} className="p-3 bg-stone-50 hover:bg-stone-100 rounded-2xl border border-stone-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={prod.image} alt={prod.name} className="w-14 h-14 rounded-xl object-cover border flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h6 className="font-extrabold text-sm text-stone-900 truncate">{prod.name}</h6>
                          <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded font-bold">
                            {prod.categoryLabel || prod.category}
                          </span>
                          {prod.sku && <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-mono font-bold">{prod.sku}</span>}
                          {prod.isSpicy && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">Spicy</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs">
                          <span className="font-black text-orange-700">{formatRupiah(prod.price)}</span>
                          <span className="text-stone-500">• Stok: {prod.stock ?? 20} {prod.unit || ''}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleProductShowOnMain(prod)}
                        className={`p-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                          prod.showOnMain !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-stone-100 text-stone-400'
                        }`}
                        title="Tampil di Web"
                      >
                        <i className={prod.showOnMain !== false ? 'fa-solid fa-store' : 'fa-solid fa-eye-slash'}></i>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleProductSpicy(prod)}
                        className={`p-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                          prod.isSpicy ? 'bg-red-50 text-red-700 border-red-300' : 'bg-white text-stone-400'
                        }`}
                        title="Toggle Spicy"
                      >
                        <i className="fa-solid fa-pepper-hot"></i>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEditProduct(prod)}
                        className="p-2 rounded-xl bg-white border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-50 cursor-pointer"
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-200 text-xs font-bold hover:bg-red-100 cursor-pointer"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: KELOLA KATEGORI */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-stone-50 p-4 rounded-2xl border border-stone-200">
                <div>
                  <h4 className="font-extrabold text-stone-900 text-sm">Kelola Kategori Menu & Simbol Icon</h4>
                  <p className="text-xs text-stone-500">Tambah kategori baru, urutkan posisi, dan ganti icon FontAwesome atau gambar khusus.</p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddCategory}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                >
                  + Tambah Kategori
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {categories.map((cat, idx) => (
                  <div key={cat.id} className="p-3 rounded-xl border border-stone-200 bg-white flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center flex-shrink-0">
                        {cat.icon && (cat.icon.startsWith('http') || cat.icon.startsWith('data:image')) ? (
                          <img src={cat.icon} alt="" className="w-6 h-6 object-contain" />
                        ) : (
                          <i className={`${cat.icon && cat.icon.includes(' ') ? cat.icon : `fa-solid ${cat.icon || 'fa-tag'}`} text-sm`}></i>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-stone-900 truncate">{cat.name}</p>
                        <p className="text-[10px] text-stone-400 font-mono truncate">{cat.id}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {idx > 1 && (
                        <button
                          type="button"
                          onClick={() => handleMoveCategory(idx, -1)}
                          className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-[10px] cursor-pointer"
                        >
                          <i className="fa-solid fa-arrow-up"></i>
                        </button>
                      )}
                      {idx > 0 && idx < categories.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleMoveCategory(idx, 1)}
                          className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-[10px] cursor-pointer"
                        >
                          <i className="fa-solid fa-arrow-down"></i>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleOpenEditCategory(cat)}
                        className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 cursor-pointer"
                      >
                        <i className="fa-solid fa-pen-to-square text-xs"></i>
                      </button>
                      {cat.id !== 'all' && (
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 cursor-pointer"
                        >
                          <i className="fa-solid fa-trash-can text-xs"></i>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: HERO, BANNER & TEMA */}
          {activeTab === 'hero' && (
            <div className="space-y-6">
              <div className="p-4 bg-white rounded-2xl border border-stone-200 flex items-center justify-between">
                <div>
                  <h5 className="font-extrabold text-sm text-stone-900">Selalu Sembunyikan Banner Hero Permanen</h5>
                  <p className="text-xs text-stone-500">Banner hero disembunyikan untuk semua pengunjung.</p>
                </div>
                <input
                  type="checkbox"
                  checked={currentConfig.hideHeroBannerPermanently}
                  onChange={e => setCurrentConfig({ ...currentConfig, hideHeroBannerPermanently: e.target.checked })}
                  className="w-5 h-5 rounded text-orange-600 cursor-pointer"
                />
              </div>

              <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-4">
                <h5 className="text-xs font-black uppercase text-stone-800 tracking-wider">Gambar Hero & Transparansi</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">URL Gambar Latar Hero</label>
                    <input
                      type="url"
                      value={currentConfig.heroImage}
                      onChange={e => setCurrentConfig({ ...currentConfig, heroImage: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-stone-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Warna Overlay Background</label>
                    <input
                      type="color"
                      value={currentConfig.heroOverlayColor}
                      onChange={e => setCurrentConfig({ ...currentConfig, heroOverlayColor: e.target.value })}
                      className="w-10 h-10 rounded-xl cursor-pointer border"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                      Transparansi Gambar ({Math.round(currentConfig.heroImageOpacity * 100)}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={currentConfig.heroImageOpacity}
                      onChange={e => setCurrentConfig({ ...currentConfig, heroImageOpacity: parseFloat(e.target.value) })}
                      className="w-full accent-orange-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Headline Baris 1</label>
                    <input
                      type="text"
                      value={currentConfig.heroTitle1}
                      onChange={e => setCurrentConfig({ ...currentConfig, heroTitle1: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-stone-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Headline Baris 2 (Sorotan)</label>
                    <input
                      type="text"
                      value={currentConfig.heroTitle2}
                      onChange={e => setCurrentConfig({ ...currentConfig, heroTitle2: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-stone-300 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: PEMBAYARAN & QRIS */}
          {activeTab === 'payment_settings' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/30 space-y-4">
                <h5 className="font-extrabold text-sm text-emerald-900 uppercase">Konfigurasi QRIS & Rekening Resmi</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Nama Merchant QRIS</label>
                    <input
                      type="text"
                      value={currentConfig.paymentConfig.qrisMerchantName}
                      onChange={e => setCurrentConfig({
                        ...currentConfig,
                        paymentConfig: { ...currentConfig.paymentConfig, qrisMerchantName: e.target.value }
                      })}
                      className="w-full p-2.5 rounded-xl border border-stone-300 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">NMID QRIS</label>
                    <input
                      type="text"
                      value={currentConfig.paymentConfig.qrisNmid}
                      onChange={e => setCurrentConfig({
                        ...currentConfig,
                        paymentConfig: { ...currentConfig.paymentConfig, qrisNmid: e.target.value }
                      })}
                      className="w-full p-2.5 rounded-xl border border-stone-300 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Nama Bank & No Rekening</label>
                    <input
                      type="text"
                      value={currentConfig.paymentConfig.bankAccountNumber}
                      onChange={e => setCurrentConfig({
                        ...currentConfig,
                        paymentConfig: { ...currentConfig.paymentConfig, bankAccountNumber: e.target.value }
                      })}
                      className="w-full p-2.5 rounded-xl border border-stone-300 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Nomor E-Wallet Resmi</label>
                    <input
                      type="text"
                      value={currentConfig.paymentConfig.ewalletPhone}
                      onChange={e => setCurrentConfig({
                        ...currentConfig,
                        paymentConfig: { ...currentConfig.paymentConfig, ewalletPhone: e.target.value }
                      })}
                      className="w-full p-2.5 rounded-xl border border-stone-300 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: KEAMANAN & KASIR */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Change Admin Password */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-4">
                <h5 className="font-extrabold text-sm text-stone-900">Ubah Password Master Admin</h5>
                <form onSubmit={handleUpdatePassword} className="space-y-3 max-w-md text-xs">
                  <div>
                    <label className="block font-bold mb-1">Password Saat Ini</label>
                    <input
                      type="password"
                      value={currentPasswordInput}
                      onChange={e => setCurrentPasswordInput(e.target.value)}
                      className="w-full p-2.5 rounded-xl border"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Password Baru (min 8 karakter, huruf + angka + kapital)</label>
                    <input
                      type="password"
                      value={newPasswordInput}
                      onChange={e => setNewPasswordInput(e.target.value)}
                      className="w-full p-2.5 rounded-xl border"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Konfirmasi Password Baru</label>
                    <input
                      type="password"
                      value={confirmPasswordInput}
                      onChange={e => setConfirmPasswordInput(e.target.value)}
                      className="w-full p-2.5 rounded-xl border"
                    />
                  </div>
                  {passwordError && <p className="text-red-600 font-bold">{passwordError}</p>}
                  {passwordSuccess && <p className="text-emerald-600 font-bold">{passwordSuccess}</p>}
                  <button type="submit" className="px-5 py-2.5 bg-stone-900 text-white rounded-xl font-bold cursor-pointer">
                    Simpan Password Baru
                  </button>
                </form>
              </div>

              {/* Supervisor PIN Card */}
              <div className="bg-red-50 p-5 rounded-2xl border border-red-200 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center text-lg">
                    <i className="fa-solid fa-shield-halved"></i>
                  </div>
                  <div>
                    <h5 className="font-extrabold text-sm text-stone-900">Supervisor PIN (Aksi Destruktif POS)</h5>
                    <p className="text-xs text-stone-500">
                      PIN 6-digit untuk otorisasi void transaksi dan penyesuaian kasir. (Default: 211211)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">PIN Baru (6 Digit)</label>
                    <input
                      type="password"
                      maxLength={6}
                      value={supervisorPinNew}
                      onChange={e => setSupervisorPinNew(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••••"
                      className="w-full h-11 px-3 rounded-xl border text-center font-mono font-bold tracking-widest text-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Konfirmasi PIN</label>
                    <input
                      type="password"
                      maxLength={6}
                      value={supervisorPinConfirm}
                      onChange={e => setSupervisorPinConfirm(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••••"
                      className="w-full h-11 px-3 rounded-xl border text-center font-mono font-bold tracking-widest text-lg bg-white"
                    />
                  </div>
                </div>

                {supervisorPinMsg && <p className="text-xs font-bold text-stone-800">{supervisorPinMsg}</p>}

                <button
                  type="button"
                  onClick={handleSaveSupervisorPin}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow cursor-pointer"
                >
                  Simpan Supervisor PIN
                </button>
              </div>

              {/* Cashier Accounts Management */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-extrabold text-sm text-stone-900">Daftar Akun Operator Kasir Pintar</h5>
                    <p className="text-xs text-stone-500">Kelola kredensial username dan PIN 6-digit login kasir.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddAccountModalOpen(true)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                  >
                    + Tambah Akun Kasir
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-stone-200">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-stone-100 font-bold uppercase text-stone-700">
                      <tr>
                        <th className="p-3">Nama Lengkap</th>
                        <th className="p-3">Username</th>
                        <th className="p-3">Role</th>
                        <th className="p-3 text-center">PIN</th>
                        <th className="p-3 text-center">Status</th>
                        <th className="p-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {kasirAccounts.map(acc => (
                        <tr key={acc.id} className="hover:bg-stone-50">
                          <td className="p-3 font-bold text-stone-900">{acc.name}</td>
                          <td className="p-3 font-mono font-bold text-orange-600">{acc.username}</td>
                          <td className="p-3">{acc.role}</td>
                          <td className="p-3 text-center font-mono">•••••• ({acc.pin})</td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {acc.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteKasirAccount(acc.id)}
                              className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                            >
                              <i className="fa-solid fa-trash-can"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: NOMOR WA OWNER */}
          {activeTab === 'owner_wa' && (
            <div className="space-y-6">
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
                <h4 className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
                  <i className="fa-brands fa-whatsapp text-emerald-600 text-base"></i>
                  <span>Daftar Nomor WhatsApp Owner (Notifikasi EOD Konsinyasi & Shift)</span>
                </h4>
                <p className="text-xs text-stone-600 mt-1">
                  Maksimal 5 nomor WhatsApp owner yang menerima tembusan otomatis laporan tutup buku harian.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-3">
                {currentConfig.ownerWaNumbers.map((num, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <input
                      type="tel"
                      value={num}
                      onChange={e => {
                        const updated = [...currentConfig.ownerWaNumbers];
                        updated[idx] = e.target.value.replace(/[^0-9]/g, '');
                        setCurrentConfig({ ...currentConfig, ownerWaNumbers: updated });
                      }}
                      placeholder={`6281xxxxxxxxxx ${idx === 0 ? '(Nomor Utama Owner)' : '(Cadangan)'}`}
                      className="flex-1 p-2.5 rounded-xl border border-stone-300 font-mono text-xs font-bold"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 12: PANDUAN CLOUDFLARE DEPLOYMENT */}
          {activeTab === 'cloudflare_guide' && (
            <div className="space-y-4">
              <div className="p-4 bg-orange-50 rounded-2xl border border-orange-200">
                <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                  <i className="fa-brands fa-cloudflare text-orange-600"></i>
                  <span>Panduan Deployment ke Cloudflare Pages</span>
                </h4>
                <p className="text-xs text-stone-600 mt-0.5">
                  Proyek ini siap di-deploy secara instan ke Cloudflare Pages dengan build command standard.
                </p>
              </div>

              <div className="bg-stone-900 text-stone-100 p-4 rounded-2xl text-xs font-mono space-y-2 overflow-x-auto">
                <p className="text-stone-400"># 1. Jalankan build lokal</p>
                <p className="text-emerald-400">npm run build</p>
                <p className="text-stone-400 mt-3"># 2. Push ke Git repository</p>
                <p>git add . && git commit -m "feat: unified shop suite"</p>
                <p>git push origin main</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="text-xs text-stone-500 hidden sm:block">
            <span>Perubahan tersinkron otomatis ke Landing Page, POS Kasir, dan Akuntansi.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-100 transition flex-1 sm:flex-initial cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-2 flex-1 sm:flex-initial cursor-pointer active:scale-95"
            >
              <i className="fa-solid fa-floppy-disk"></i>
              <span>Simpan Semua Perubahan</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL TAMBAH/EDIT PRODUK */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h4 className="font-extrabold text-stone-900 text-base">
              {editingProductId ? 'Edit Data Produk' : 'Tambah Produk Baru'}
            </h4>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Nama Produk *</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Kategori *</label>
                  <select
                    value={productForm.category}
                    onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border font-bold"
                  >
                    {categories.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Harga Jual (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={e => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border font-bold text-orange-700 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Stok Tersedia</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={e => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Satuan (pcs, kg, box, dll)</label>
                  <input
                    type="text"
                    value={productForm.unit}
                    onChange={e => setProductForm({ ...productForm, unit: e.target.value })}
                    className="w-full p-2.5 rounded-xl border"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">URL Gambar Produk</label>
                <input
                  type="url"
                  value={productForm.image}
                  onChange={e => setProductForm({ ...productForm, image: e.target.value })}
                  className="w-full p-2.5 rounded-xl border"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border"
                ></textarea>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="w-1/2 py-2.5 border rounded-xl font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-orange-600 text-white rounded-xl font-bold cursor-pointer"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH KATEGORI */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4">
            <h4 className="font-extrabold text-stone-900 text-base">
              {editingCategoryId ? 'Edit Kategori' : 'Tambah Kategori Baru'}
            </h4>
            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Nama Kategori *</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border font-bold"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Class Icon FontAwesome</label>
                <input
                  type="text"
                  value={categoryForm.icon}
                  onChange={e => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                  placeholder="fa-solid fa-tag"
                  className="w-full p-2.5 rounded-xl border font-mono"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="w-1/2 py-2.5 border rounded-xl font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-orange-600 text-white rounded-xl font-bold cursor-pointer"
                >
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH AKUN KASIR */}
      {isAddAccountModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4">
            <h4 className="font-extrabold text-stone-900 text-base">Tambah Akun Kasir Operator</h4>
            <form onSubmit={handleAddKasirAccount} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Nama Operator *</label>
                <input
                  type="text"
                  required
                  value={newAccountForm.name}
                  onChange={e => setNewAccountForm({ ...newAccountForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border font-bold"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Username Login *</label>
                <input
                  type="text"
                  required
                  value={newAccountForm.username}
                  onChange={e => setNewAccountForm({ ...newAccountForm, username: e.target.value })}
                  className="w-full p-2.5 rounded-xl border font-mono"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">PIN 6-Digit Angka *</label>
                <input
                  type="password"
                  maxLength={6}
                  required
                  value={newAccountForm.pin}
                  onChange={e => setNewAccountForm({ ...newAccountForm, pin: e.target.value.replace(/\D/g, '') })}
                  className="w-full p-2.5 rounded-xl border text-center font-mono font-bold tracking-widest text-base"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddAccountModalOpen(false)}
                  className="w-1/2 py-2.5 border rounded-xl font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-emerald-600 text-white rounded-xl font-bold cursor-pointer"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
