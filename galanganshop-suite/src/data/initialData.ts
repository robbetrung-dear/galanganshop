import { Category, CateringPackage, CourierRate, InventoryItem, KasirAccount, Product, SiteConfig } from '../types';

export const initialCategories: Category[] = [
  { id: 'all', name: 'Semua Produk', icon: 'fa-border-all', iconType: 'fa' },
  { id: 'retail_goods', name: 'Sembako & Ritel', icon: 'fa-basket-shopping', iconType: 'fa' },
  { id: 'beverages_coffee', name: 'Kopi & Minuman', icon: 'fa-mug-hot', iconType: 'fa' },
  { id: 'snacks_cookies', name: 'Snack & Cemilan', icon: 'fa-cookie-bite', iconType: 'fa' },
  { id: 'rice_bowl', name: 'Bento & Rice Bowl', icon: 'fa-bowl-rice', iconType: 'fa' },
  { id: 'chicken', name: 'Ayam & Bento', icon: 'fa-drumstick-bite', iconType: 'fa' },
  { id: 'mie', name: 'Aneka Mie & Pasta', icon: 'fa-bowl-food', iconType: 'fa' },
  { id: 'dimsum', name: 'Dimsum & Frozen', icon: 'fa-utensils', iconType: 'fa' },
  { id: 'viral', name: 'Viral & Dessert', icon: 'fa-fire', iconType: 'fa' },
  { id: 'merchandise', name: 'Peralatan & Horeca', icon: 'fa-kitchen-set', iconType: 'fa' }
];

export const initialProducts: Product[] = [
  // --- Retail & Merchandise Products (SST Catalog) ---
  {
    id: 'prod-ret-001',
    sku: 'RTL-BOP-5KG',
    name: 'Beras Organik Pandan Wangi 5kg',
    category: 'retail_goods',
    categoryLabel: 'Sembako & Ritel',
    price: 78000,
    originalPrice: 85000,
    stock: 45,
    unit: 'sak',
    badge: 'ORGANIK',
    badgeColor: 'bg-emerald-600 text-white',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
    description: 'Beras premium wangi pandan alami tanpa pemutih & pengawet. Pulen dan higienis langsung dari petani.',
    isSpicy: false,
    showOnMain: true,
    supplier: 'PT Beras Makmur Sejahtera'
  },
  {
    id: 'prod-ret-002',
    sku: 'RTL-MGP-2L',
    name: 'Minyak Goreng Sawit Kelapa 2 Liter',
    category: 'retail_goods',
    categoryLabel: 'Sembako & Ritel',
    price: 34000,
    originalPrice: 38000,
    stock: 60,
    unit: 'pouch',
    badge: 'HEMAT',
    badgeColor: 'bg-red-600 text-white',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80',
    description: 'Minyak goreng jernih 2 kali penyaringan, tahan panas tinggi dan membuat gorengan renyah tahan lama.',
    isSpicy: false,
    showOnMain: true,
    supplier: 'CV Indo Nabati'
  },
  {
    id: 'prod-ret-003',
    sku: 'RTL-KOP-250G',
    name: 'Kopi Arabika Toraja Roast 250gr',
    category: 'beverages_coffee',
    categoryLabel: 'Kopi & Minuman',
    price: 65000,
    originalPrice: 75000,
    stock: 32,
    unit: 'pack',
    badge: 'BEST SELLER',
    badgeColor: 'bg-amber-600 text-white',
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&auto=format&fit=crop&q=80',
    description: 'Biji kopi sangrai pilihan Single Origin Toraja dengan aroma karamel dan citrus yang menyegarkan.',
    isSpicy: false,
    showOnMain: true,
    supplier: 'Roastery Galangan Nusantara'
  },
  {
    id: 'prod-ret-004',
    sku: 'RTL-KRP-SINGKONG',
    name: 'Keripik Singkong Balado Renyah 150g',
    category: 'snacks_cookies',
    categoryLabel: 'Snack & Cemilan',
    price: 18000,
    originalPrice: 22000,
    stock: 75,
    unit: 'pack',
    badge: 'VIRAL',
    badgeColor: 'bg-brand-600 text-white',
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600&auto=format&fit=crop&q=80',
    description: 'Keripik singkong renyah dengan baluran cabai merah asli dan bumbu daun jeruk khas Nusantara.',
    isSpicy: true,
    showOnMain: true,
    supplier: 'UMKM Snack Berkah'
  },
  {
    id: 'prod-ret-005',
    sku: 'RTL-TEA-GREENTEA',
    name: 'Artisan Green Tea Jasmine Leaf 100g',
    category: 'beverages_coffee',
    categoryLabel: 'Kopi & Minuman',
    price: 45000,
    originalPrice: 50000,
    stock: 28,
    unit: 'tin',
    badge: 'PREMIUM',
    badgeColor: 'bg-teal-600 text-white',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
    description: 'Teh hijau organik berpadu harum bunga melati segar, cocok untuk relaksasi tubuh dan pikiran.',
    isSpicy: false,
    showOnMain: true,
    supplier: 'Kebun Teh Nusantara'
  },
  // --- Culinary / F&B Ready to Eat Menu Items (Digital Culinary) ---
  {
    id: 'prod-cul-001',
    sku: 'FB-KATSU-SPICY',
    name: 'Rice Bowl Chicken Katsu Spicy Mayo',
    category: 'rice_bowl',
    categoryLabel: 'Bento & Rice Bowl',
    price: 28000,
    originalPrice: 32000,
    stock: 50,
    unit: 'porsi',
    badge: 'FAVORIT',
    badgeColor: 'bg-brand-600 text-white',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    description: 'Nasi pulen hangat, potongan ayam katsu crispy renyah keemasan, saus spicy mayo gurih pedas & salad segar.',
    isSpicy: true,
    showOnMain: true,
    ingredients: [
      { itemId: 'inv-001', amount: 150, unit: 'gram' }, // beras
      { itemId: 'inv-002', amount: 120, unit: 'gram' }, // fillet ayam
      { itemId: 'inv-003', amount: 30, unit: 'ml' }    // saus mayo
    ]
  },
  {
    id: 'prod-cul-002',
    sku: 'FB-WINGS-HONEY',
    name: 'Crispy Chicken Wings Korean Honey Garlic (5 Pcs)',
    category: 'chicken',
    categoryLabel: 'Ayam & Bento',
    price: 32000,
    originalPrice: 36000,
    stock: 40,
    unit: 'porsi',
    badge: 'BEST SELLER',
    badgeColor: 'bg-amber-600 text-white',
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&auto=format&fit=crop&q=80',
    description: 'Sayap ayam goreng ekstra renyah berbalut glaze madu, bawang putih aromatik & taburan wijen sangrai.',
    isSpicy: false,
    showOnMain: true,
    ingredients: [
      { itemId: 'inv-004', amount: 200, unit: 'gram' },
      { itemId: 'inv-005', amount: 40, unit: 'ml' }
    ]
  },
  {
    id: 'prod-cul-003',
    sku: 'FB-MIE-NYEMEK',
    name: 'Mie Pedas Nyemek Spesial Telur Ceplok',
    category: 'mie',
    categoryLabel: 'Aneka Mie & Pasta',
    price: 22000,
    originalPrice: 25000,
    stock: 35,
    unit: 'porsi',
    badge: 'PEDAS NYEMEK',
    badgeColor: 'bg-red-600 text-white',
    image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=600&auto=format&fit=crop&q=80',
    description: 'Mie kenyal dimasak nyemek dengan racikan cabai rawit pedas medok, sosis, bakso sapi & telur ceplok setengah matang.',
    isSpicy: true,
    showOnMain: true,
    ingredients: [
      { itemId: 'inv-006', amount: 100, unit: 'gram' },
      { itemId: 'inv-007', amount: 1, unit: 'butir' }
    ]
  },
  {
    id: 'prod-cul-004',
    sku: 'FB-DIMSUM-MENTAI',
    name: 'Dimsum Ayam Udang Mentai Panggang (4 Pcs)',
    category: 'dimsum',
    categoryLabel: 'Dimsum & Frozen',
    price: 26000,
    originalPrice: 30000,
    stock: 45,
    unit: 'porsi',
    badge: 'VIRAL',
    badgeColor: 'bg-rose-600 text-white',
    image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&auto=format&fit=crop&q=80',
    description: 'Dimsum montok padat daging ayam udang dengan topping creamy sauce mentai dibakar torch wangi berasap.',
    isSpicy: false,
    showOnMain: true,
    ingredients: [
      { itemId: 'inv-008', amount: 4, unit: 'pcs' },
      { itemId: 'inv-003', amount: 25, unit: 'ml' }
    ]
  },
  {
    id: 'prod-cul-005',
    sku: 'FB-SEBLAK-KOMPLIT',
    name: 'Seblak Prasmanan Kuah Rempah Daun Jeruk',
    category: 'viral',
    categoryLabel: 'Viral & Dessert',
    price: 24000,
    originalPrice: 28000,
    stock: 30,
    unit: 'porsi',
    badge: 'REKOMENDASI',
    badgeColor: 'bg-red-700 text-white',
    image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600&auto=format&fit=crop&q=80',
    description: 'Seblak kuah kencur pedas gurih dengan aneka kerupuk kenyal, sosis, cikuwa, telur orak-arik & cuanki lidah renyah.',
    isSpicy: true,
    showOnMain: true
  },
  {
    id: 'prod-cul-006',
    sku: 'FB-BENTO-BEEF',
    name: 'Premium Beef Teriyaki Bento Box',
    category: 'rice_bowl',
    categoryLabel: 'Bento & Rice Bowl',
    price: 38000,
    originalPrice: 45000,
    stock: 25,
    unit: 'box',
    badge: 'CHEF CHOICE',
    badgeColor: 'bg-stone-900 text-white',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80',
    description: 'Daging sapi iris empuk dimasak saus teriyaki gurih manis legit, disajikan dengan nasi jepang, kani roll & salad.',
    isSpicy: false,
    showOnMain: true
  }
];

export const initialCateringPackages: CateringPackage[] = [
  {
    id: 'silver',
    name: 'Paket Silver Box',
    pricePerPax: 25000,
    minPax: 15,
    isPopular: false,
    description: 'Solusi hemat, praktis & lezat untuk makan siang rapat kantor.',
    items: [
      'Nasi Putih Wangi Daun Jeruk',
      'Chicken Katsu Crispy / Ayam Geprek',
      'Capcay Sayur Segar / Lalapan',
      'Sambal Nusantara & Kerupuk',
      'Air Mineral Gelas'
    ]
  },
  {
    id: 'gold',
    name: 'Paket Gold Box',
    pricePerPax: 35000,
    minPax: 15,
    isPopular: true,
    description: 'Paling diminati untuk arisan, meeting direksi, seminar dan syukuran.',
    items: [
      'Nasi Liwet Solo Gurih / Nasi Kuning',
      'Chicken Egg Roll Premium (isi 4)',
      'Sosis Solo Gurih Renyah',
      'Tumis Buncis Daging Cincang / Capcay',
      'Sambal Bajak Spesial & Kerupuk Udang',
      'Pisang Segar & Air Mineral Botol'
    ]
  },
  {
    id: 'platinum',
    name: 'Paket Platinum Box',
    pricePerPax: 50000,
    minPax: 15,
    isPopular: false,
    description: 'Box eksklusif bento premium dengan lauk komplit & dessert box istimewa.',
    items: [
      'Nasi Pulen Spesial / Nasi Gurih Pandan',
      'Beef Teriyaki / Chicken Wings Manis Gurih (isi 5)',
      'Udang Keju Lumer Crispy',
      'Chicken Egg Roll & Sosis Solo',
      'Dessert Box Choco Melt / Buah Potong Segar',
      'Jus Buah Dingin / Teh Kotak'
    ]
  }
];

export const initialCourierRates: CourierRate[] = [
  { courier_code: 'pickup', courier_name: 'Ambil Sendiri', courier_service_name: 'Diambil Langsung di Toko', price: 0, estimated_etd: 'Kapan Saja', badge_color: 'border-blue-500 text-blue-700 bg-blue-50', icon: 'fa-person-walking-luggage', recommended: true },
  { courier_code: 'gosend', courier_name: 'GoSend', courier_service_name: 'Instant Motor/Mobil', price: 15000, estimated_etd: '1 - 2 Jam (Saran Makanan Panas)', badge_color: 'border-emerald-500 text-emerald-700 bg-emerald-50', icon: 'fa-motorcycle', recommended: false },
  { courier_code: 'grab', courier_name: 'GrabExpress', courier_service_name: 'Same Day Makanan & Paket', price: 14000, estimated_etd: '2 - 4 Jam', badge_color: 'border-green-500 text-green-700 bg-green-50', icon: 'fa-route', recommended: false },
  { courier_code: 'jnt', courier_name: 'J&T Express', courier_service_name: 'EZ Reguler (Pack Box)', price: 12000, estimated_etd: 'Besok Sampai (1 Hari)', badge_color: 'border-red-500 text-red-700 bg-red-50', icon: 'fa-bolt', recommended: false },
  { courier_code: 'sicepat', courier_name: 'SiCepat', courier_service_name: 'BEST (Besok Sampai)', price: 13000, estimated_etd: 'Besok Sampai (1 Hari)', badge_color: 'border-orange-500 text-orange-700 bg-orange-50', icon: 'fa-gauge-high', recommended: false },
  { courier_code: 'jne', courier_name: 'JNE', courier_service_name: 'YES (Yakin Esok Sampai)', price: 15000, estimated_etd: '1 Hari Kerja', badge_color: 'border-blue-500 text-blue-700 bg-blue-50', icon: 'fa-truck-fast', recommended: false },
  { courier_code: 'anteraja', courier_name: 'AnterAja', courier_service_name: 'Same Day Delivery', price: 16000, estimated_etd: 'Hari yang sama (6-8 Jam)', badge_color: 'border-purple-500 text-purple-700 bg-purple-50', icon: 'fa-paper-plane', recommended: false },
  { courier_code: 'ninja', courier_name: 'Ninja Xpress', courier_service_name: 'Ninja Standard', price: 11000, estimated_etd: '1 - 2 Hari', badge_color: 'border-rose-500 text-rose-700 bg-rose-50', icon: 'fa-mask', recommended: false },
  { courier_code: 'pos', courier_name: 'POS Indonesia', courier_service_name: 'Pos Next Day', price: 13500, estimated_etd: '1 Hari', badge_color: 'border-amber-500 text-amber-700 bg-amber-50', icon: 'fa-envelope-open-text', recommended: false }
];

export const initialKasirAccounts: KasirAccount[] = [
  { id: 'acc-1', name: 'Kasir Utama (Shift Pagi)', username: 'kasir1', pin: '123456', role: 'Staff Kasir', status: 'Aktif' },
  { id: 'acc-2', name: 'Kasir Sore & Malam', username: 'kasir2', pin: '654321', role: 'Staff Kasir', status: 'Aktif' },
  { id: 'acc-3', name: 'Manager Operational Toko', username: 'manager', pin: '888999', role: 'Supervisor', status: 'Aktif' },
  { id: 'acc-4', name: 'Kasir Umum Demo', username: 'kasir', pin: '123456', role: 'Staff Kasir', status: 'Aktif' }
];

export const initialInventory: InventoryItem[] = [
  { id: 'inv-001', sku: 'RAW-BERAS-KG', name: 'Beras Pandan Wangi Curah', stock: 120, unit: 'kg', costPrice: 13000, minStock: 25, supplier: 'CV Beras Nusantara' },
  { id: 'inv-002', sku: 'RAW-AYAM-FILLET', name: 'Daging Ayam Fillet Dada', stock: 45, unit: 'kg', costPrice: 42000, minStock: 10, supplier: 'RPA Poultry Farm' },
  { id: 'inv-003', sku: 'RAW-SAUS-MAYO', name: 'Saus Spicy Mayo Japanese', stock: 15, unit: 'liter', costPrice: 35000, minStock: 3, supplier: 'PT Bumbu Sauces' },
  { id: 'inv-004', sku: 'RAW-SAYAP-AYAM', name: 'Sayap Ayam Potong Segar', stock: 35, unit: 'kg', costPrice: 38000, minStock: 8, supplier: 'RPA Poultry Farm' },
  { id: 'inv-005', sku: 'RAW-MADU-GARLIC', name: 'Saus Korean Honey Garlic', stock: 12, unit: 'liter', costPrice: 48000, minStock: 2, supplier: 'PT Bumbu Sauces' },
  { id: 'inv-006', sku: 'RAW-MIE-TELUR', name: 'Mie Telur Basah Super', stock: 25, unit: 'kg', costPrice: 16000, minStock: 5, supplier: 'Pabrik Mie Segar' },
  { id: 'inv-007', sku: 'RAW-TELUR-AYAM', name: 'Telur Ayam Negeri', stock: 240, unit: 'butir', costPrice: 2000, minStock: 40, supplier: 'Peternakan Berkah' },
  { id: 'inv-008', sku: 'RAW-DIMSUM-FROZEN', name: 'Dimsum Ayam Udang Siap Kukus', stock: 180, unit: 'pcs', costPrice: 3500, minStock: 30, supplier: 'Kitchen Dimsum' }
];

export const defaultSiteConfig: SiteConfig = {
  brandName: 'GALANGAN SHOP SUITE',
  brandWords: [
    { text: 'GALANGAN', color: '#ea580c' },
    { text: 'SHOP', color: '#f59e0b' },
    { text: 'SUITE', color: '#e11d48' }
  ],
  tagline: 'Retail & Culinary POS',
  hideHeroBannerPermanently: false,
  showTrackerButton: true,
  logoType: 'icon',
  logoIcon: 'fa-solid fa-store',
  logoImage: '',
  logoBgColor: '#ea580c',
  headerBgColor: '#ffffff',
  pageBgColor: '#fafaf9',
  pageBgImage: '',
  pageTextColor: '#1c1917',
  themeAccent: '#ea580c',
  promoRibbon: 'PROMO SPESIAL RITEL & KULINER: GRATIS ONGKIR DENGAN MIN. BELANJA RP50.000 & CASHBACK QRIS INSTAN!',
  promoRibbonBadge: 'PROMO',
  promoRibbonLinkText: 'Cek Semua Promo!',
  promoRibbonBg: '#000000',
  promoRibbonTextColor: '#ffffff',
  navMenuText: 'Katalog Produk',
  navCateringText: 'Paket Catering',
  navOngkirText: 'Cek Ongkir 7 Kurir',
  navB2bText: 'Pesanan Grosir & B2B',
  heroBadge: 'All-in-One Retail Modern & Food Suite',
  heroTitle1: 'Solusi Ritel Cerdas,',
  heroTitle2: 'Terintegrasi Kasir & Pembukuan.',
  heroTitle2Color: '#fb923c',
  heroDescription: 'Belanja produk kebutuhan harian, sembako berkualitas, kopi artisan, serta menu kuliner siap santap viral. Dilengkapi sistem kasir POS instan, rekonsiliasi akuntansi otomatis, dan lacak pesanan realtime.',
  heroBtn1: 'Beli Sekarang',
  heroBtn1Bg: '#ea580c',
  heroBtn1TextColor: '#ffffff',
  heroBtn2: 'Order Catering / Grosir',
  heroBtn2Bg: '#292524',
  heroBtn2TextColor: '#ffffff',
  heroProofBadge: '2.500+ Pelanggan Puas ★ 4.9',
  heroImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600&auto=format&fit=crop&q=80',
  heroOverlayColor: '#0c0a09',
  heroImageOpacity: 0.65,
  menuSectionTitle: 'Katalog Produk Ritel & Menu Kuliner',
  menuSectionSubtitle: 'Etalase terpadu multi produk kebutuhan harian, sembako, cemilan, dan makanan siap santap berkualitas.',
  menuItemsPerPage: 12,
  showMenuStockOnMain: true,
  cateringBadge: 'Pilihan Box Catering & Paket Acara',
  cateringTitle: 'Paket Catering Harian, Syukuran & Acara Kantor',
  cateringSubtitle: 'Pilihan box makanan higienis dan paket konsumsi pertemuan kantor, arisan, dan syukuran mulai Rp25.000/pax.',
  b2bBadge: 'Layanan Pasokan Perusahaan & Grosir',
  b2bTitle: 'Pesanan Grosir Sembako & Catering B2B (>50 Box)',
  b2bSubtitle: 'Kebutuhan pengadaan sembako rutin kantor, catering karyawan, event seminar, atau wedding gathering? Kami sediakan faktur pajak / invoice resmi, menu kustom, dan tim CS prioritas.',
  address: 'Jl. Galangan Niaga Raya No. 88, Kebayoran Baru, Jakarta Selatan 12190',
  operationalHours: 'Senin - Minggu: 08.00 - 22.00 WIB (Buka Setiap Hari)',
  phone: '0812-3456-7890',
  footerDesc: 'GalanganShop Suite: Platform Omnichannel Ritel Modern & Digital Culinary terintegrasi Point of Sale (POS), Manajemen Resep Stok, dan Pembukuan Akuntansi.',
  footerBgColor: '#1c1917',
  footerTextColor: '#a8a29e',
  footerCopyright: 'GalanganShop Suite. All Rights Reserved.',
  deliveryLinks: {
    shopeefood: 'https://shopee.co.id',
    grabfood: 'https://food.grab.com',
    gofood: 'https://gofood.co.id'
  },
  socialLinks: {
    instagram: 'https://instagram.com/galanganshop',
    facebook: 'https://facebook.com/galanganshop',
    tiktok: 'https://tiktok.com/@galanganshop'
  },
  kasirTitle: 'Kasir Pintar POS',
  kasirSubtitle: 'GalanganShop Modern Suite',
  supervisorPin: '211211',
  ownerWaNumbers: ['6281234567890', '', '', '', ''],
  autoJournalShiftDiff: true,
  scannerEnabled: true,
  riwayatExpiryDays: 7,
  cateringPackages: initialCateringPackages,
  paymentConfig: {
    enableEwalletTransfer: true,
    enableQris: true,
    qrisType: 'both',
    qrisImage: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020101021126570014ID.LINKAJA.WWW01189360091100223126830208123456780303UMI51440014ID.CO.QRIS.WWW0215ID10200234567890303UMI5204581253033605802ID5919GALANGAN+SHOP+SUITE6007JAKARTA61051219062070703A016304ABCD',
    qrisMerchantName: 'GALANGAN SHOP SUITE - QRIS RESMI',
    qrisNmid: 'ID1020023456789',
    qrisInstructions: 'Buka BCA Mobile, GoPay, OVO, DANA, ShopeePay, atau Livin Mandiri, lalu scan QRIS dan selesaikan pembayaran.',
    enableBankTransfer: true,
    bankName: 'BCA (Bank Central Asia)',
    bankAccountNumber: '8735-0982-11',
    bankAccountHolder: 'GALANGAN SHOP RETAIL',
    bankInstructions: 'Transfer nominal pas sesuai total pesanan. Simpan bukti transfer dan konfirmasi ke WhatsApp admin.',
    ewalletPhone: '0812-3456-7890',
    ewalletInstructions: 'Transfer menggunakan DANA, ShopeePay, GoPay, OVO, atau LinkAja ke nomor tertera. Kirimkan bukti transfer ke WhatsApp admin.'
  }
};
