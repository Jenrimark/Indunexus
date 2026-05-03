// InduNexus Type Definitions

export interface Part {
  id: string;
  partNumber: string;
  oemCode?: string;
  name: string;
  nameEn?: string;
  categoryId: string;
  brand?: string;
  description?: string;
  images: {
    thumbnail: string;
    fullSize: string[];
    blurhash?: string;
  };
  specifications: Specifications;
  price: number;
  currency: string;
  stock: number;
  model3DUrl?: string;
  technicalDrawingUrl?: string;
  compatibleVehicles: string[];
  alternatives: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface Specifications {
  material?: string;
  dimensions?: {
    innerDiameter?: number;
    outerDiameter?: number;
    width?: number;
    diameter?: number;
    length?: number;
    height?: number;
    unit: string;
  };
  weight?: {
    value: number;
    unit: string;
  };
  tolerance?: string;
  sealType?: string;
  [key: string]: any;
}

export interface CategoryNode {
  id: string;
  name: string;
  nameEn?: string;
  icon?: string;
  level: number;
  parentId?: string;
  children?: CategoryNode[];
  partsCount: number;
  isExpanded?: boolean;
  path?: string;
}

export interface SearchQuery {
  keyword?: string;
  type?: 'model' | 'drawing' | 'barcode' | 'auto';
  categoryId?: string;
  filters?: Record<string, any>;
  /** 与后端/网格排序选项对齐（price/name/stock/created_at 等） */
  sortBy?: 'relevance' | 'price' | 'stock' | 'sales' | 'created_at' | 'name' | string;
  sortOrder?: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

export interface SearchResponse {
  success: boolean;
  data: {
    parts: Part[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  };
}

export interface SearchSuggestion {
  type: 'history' | 'hot' | 'category' | 'part';
  text: string;
  partNumber?: string;
  count?: number;
  partId?: string;
}

export interface RecognitionResult {
  partId: string;
  partName: string;
  partNumber: string;
  thumbnail: string;
  confidence: number;
  matchedFeatures: string[];
}

export interface FilterOption {
  key: string;
  label: string;
  type: 'range' | 'select' | 'checkbox';
  unit?: string;
  min?: number;
  max?: number;
  options?: string[];
}

export interface GraphNode {
  id: string;
  type: 'part' | 'vehicle' | 'system' | 'supplier' | 'alternative';
  label: string;
  data: any;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: 'compatible' | 'replaces' | 'belongs_to' | 'supplies';
  label?: string;
  data?: any;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface Favorite {
  id: string;
  partId: string;
  partName: string;
  partNumber: string;
  thumbnail: string;
  addedAt: Date;
}

export interface Preset {
  id: string;
  name: string;
  categoryId: string;
  filters: Record<string, any>;
  createdAt: Date;
}

export interface CartItem {
  id: string;
  skuId: string;
  part: Part;
  quantity: number;
  subtotal: number;
  /** 结算勾选，默认 true */
  selected?: boolean;
}

export type ViewMode = 'waterfall' | 'list' | 'detail' | 'graph';
