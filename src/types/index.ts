export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: 'customer' | 'admin';
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  description?: string | null;
  isActive: boolean;
  productsCount?: number;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  category?: Category;
  subcategory?: string | null;
  brand: string;
  sku: string;
  price: number;
  discountPrice?: number | null;
  stock: number;
  sizes: string; // "S,M,L,XL"
  colors: string; // JSON string e.g. '["Black", "Ivory"]'
  material?: string | null;
  careInstructions?: string | null;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isActive: boolean;
  createdAt: string;
  images: ProductImage[];
}

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  size: string;
  color: string;
  quantity: number;
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  product: Product;
}

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  houseNo: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string | null;
  addressType: string;
  isDefault: boolean;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId?: string | null;
  productName: string;
  productImage: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalAmount: number;
  subtotal: number;
  shippingCharge: number;
  taxAmount: number;
  discountAmount: number;
  paymentStatus: 'pending' | 'submitted' | 'confirmed' | 'failed';
  orderStatus: 'placed' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
  upiRef?: string | null;
  addressJson: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface StoreSettings {
  id: string;
  storeName: string;
  storeLogo?: string | null;
  contactEmail: string;
  contactPhone: string;
  address: string;
  upiId: string;
  currency: string;
  shippingCharge: number;
  freeShippingThreshold: number;
  taxPercentage: number;
}
