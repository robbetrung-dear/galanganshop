export interface BrandWord {
  text: string;
  color: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  iconType?: 'fa' | 'image';
  imageUrl?: string;
}

export interface ProductRecipeIngredient {
  itemId: string;
  amount: number;
  unit: string;
}

export interface Product {
  id: string;
  sku?: string;
  name: string;
  category: string;
  categoryLabel?: string;
  price: number;
  originalPrice?: number | null;
  stock?: number;
  unit?: string;
  badge?: string;
  badgeColor?: string;
  image: string;
  description: string;
  isSpicy?: boolean;
  showOnMain?: boolean;
  fromKasir?: boolean;
  linkedInventory?: string;
  supplier?: string;
  ingredients?: ProductRecipeIngredient[];
  createdAt?: number | string;
  updatedAt?: number | string;
}

export interface CartItem extends Product {
  quantity: number;
  notes?: string;
  isCatering?: boolean;
}

export interface CateringPackage {
  id: string;
  name: string;
  pricePerPax: number;
  minPax: number;
  isPopular: boolean;
  description: string;
  items: string[];
}

export interface CourierRate {
  courier_code: string;
  courier_name: string;
  courier_service_name: string;
  price: number;
  estimated_etd: string;
  badge_color: string;
  icon: string;
  recommended: boolean;
}

export interface OrderCustomer {
  name: string;
  phone: string;
  address?: string;
  notes?: string;
}

export interface Order {
  orderId: string;
  customer: OrderCustomer;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  items: {
    id?: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  courier?: {
    code?: string;
    name?: string;
    service?: string;
    price?: number;
  } | null;
  selectedCourier?: CourierRate | null;
  subtotal: number;
  courierFee: number;
  totalAmount: number;
  paymentMethod: 'qris' | 'bank_transfer' | 'ewallet_transfer' | 'tunai' | 'edc' | string;
  status: 'Pending' | 'Dibayar' | 'Diproses' | 'Dikirim' | 'Selesai' | 'Dibatalkan' | string;
  createdAt: string;
  updatedAt?: string;
  isPickup?: boolean;
  notes?: string;
}

export interface SiteConfig {
  brandName: string;
  brandWords: BrandWord[];
  tagline: string;
  hideHeroBannerPermanently: boolean;
  showTrackerButton: boolean;
  logoType: 'icon' | 'image';
  logoIcon: string;
  logoImage: string;
  logoBgColor: string;
  headerBgColor: string;
  pageBgColor: string;
  pageBgImage: string;
  pageTextColor: string;
  themeAccent: string;
  promoRibbon: string;
  promoRibbonBadge: string;
  promoRibbonLinkText: string;
  promoRibbonBg: string;
  promoRibbonTextColor: string;
  navMenuText: string;
  navCateringText: string;
  navOngkirText: string;
  navB2bText: string;
  heroBadge: string;
  heroTitle1: string;
  heroTitle2: string;
  heroTitle2Color: string;
  heroDescription: string;
  heroBtn1: string;
  heroBtn1Bg: string;
  heroBtn1TextColor: string;
  heroBtn2: string;
  heroBtn2Bg: string;
  heroBtn2TextColor: string;
  heroProofBadge: string;
  heroImage: string;
  heroOverlayColor: string;
  heroImageOpacity: number;
  menuSectionTitle: string;
  menuSectionSubtitle: string;
  menuItemsPerPage: number;
  showMenuStockOnMain: boolean;
  cateringBadge: string;
  cateringTitle: string;
  cateringSubtitle: string;
  b2bBadge: string;
  b2bTitle: string;
  b2bSubtitle: string;
  address: string;
  operationalHours: string;
  phone: string;
  footerDesc: string;
  footerBgColor: string;
  footerTextColor: string;
  footerCopyright: string;
  deliveryLinks: {
    shopeefood: string;
    grabfood: string;
    gofood: string;
  };
  socialLinks: {
    instagram: string;
    facebook: string;
    tiktok: string;
  };
  kasirTitle: string;
  kasirSubtitle: string;
  supervisorPin: string;
  ownerWaNumbers: string[];
  autoJournalShiftDiff?: boolean;
  scannerEnabled?: boolean;
  riwayatExpiryDays?: number;
  cateringPackages?: CateringPackage[];
  paymentConfig: {
    enableEwalletTransfer: boolean;
    enableQris: boolean;
    qrisType: 'both' | 'static' | 'dynamic';
    qrisImage: string;
    qrisMerchantName: string;
    qrisNmid: string;
    qrisInstructions: string;
    enableBankTransfer: boolean;
    bankName: string;
    bankAccountNumber: string;
    bankAccountHolder: string;
    bankInstructions: string;
    ewalletPhone: string;
    ewalletInstructions: string;
  };
}

export interface KasirAccount {
  id: string;
  name: string;
  username: string;
  pin: string;
  role: 'Staff Kasir' | 'Supervisor';
  status: 'Aktif' | 'Non-Aktif';
}

export interface KasirSession {
  username: string;
  kasirName: string;
  role: string;
  shiftId?: string;
  loginAt: string;
}

export interface Shift {
  shiftId: string;
  kasirName: string;
  openedAt: string;
  closedAt?: string;
  startingCash: number;
  expectedCash?: number;
  actualCash?: number;
  cashDifference?: number;
  status: 'OPEN' | 'CLOSED';
  notes?: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  stock: number;
  unit: string;
  costPrice: number;
  minStock: number;
  supplier: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  refNo: string;
  description: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
}

export interface AccountBalance {
  code: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  balance: number;
}

export interface Supplier {
  id: string;
  name: string;
  contact?: string;
  address?: string;
  category?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'success';
  createdAt: string;
  read?: boolean;
}

export interface AccountingSettlement {
  id: string;
  date: string;
  amount: number;
  description: string;
  method: string;
  referenceId?: string;
}

export interface AccountingReconcile {
  id: string;
  date: string;
  totalSales: number;
  totalCash: number;
  difference: number;
  notes?: string;
}
