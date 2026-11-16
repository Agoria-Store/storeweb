export type ProductType = 'course' | 'chapter' | 'video' | 'ebook' | 'template' | 'bundle';
export type Delivery = 'download' | 'telegram_channel';
export type OrderStatus = 'pending' | 'paid' | 'delivered' | 'failed';

export interface Product {
  id: string;
  type: ProductType;
  title: string;
  slug: string;
  description: string;
  parentId?: string;
  includes?: string[];
  owner: 'me' | 'partner';
  priceUsdt: number;
  checkoutUrl: string;
  previewUrl?: string;
  thumbnailUrl?: string;
  delivery: Delivery;
  telegramChannelId?: string;
  active: boolean;
  sortOrder: number;
}

export interface Order {
  id: string;
  productId: string;
  status: OrderStatus;
}

export interface ProductFilter {
  type?: ProductType;
  parentId?: string;
}

export interface StoreClient {
  listProducts(filter?: ProductFilter): Promise<Product[]>;
  getProduct(idOrSlug: string): Promise<Product | null>;
  getOrder(orderId: string): Promise<Order | null>;
}

export interface CatalogData {
  products: Product[];
  orders?: Order[];
}
