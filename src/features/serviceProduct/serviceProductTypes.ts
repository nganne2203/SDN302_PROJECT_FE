import type { PaginationMeta, Product } from '@/types/api'

export interface ServiceProductState {
  services: ServiceProduct[];
  pagination: PaginationMeta | null;
  listLoading: boolean;
  actionLoading: boolean;
  filter: ServiceProductFilter;
  error: string | null;
  selectedService: ServiceProduct | null;
}

export interface ServiceProduct {
  _id: string;
  product: Product;
  name: string;
  description: string;
  type: string;
  price: number;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceProductFilter {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  type?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateServiceProductRequest {
  product: string;
  name: string;
  description: string;
  type: string;
  price: number;
}

export interface UpdateServiceProductRequest {
  name?: string;
  description?: string;
  type?: string;
  price?: number;
}
