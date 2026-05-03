// 零部件相关 API
import client from './client';
import type { Part, SearchQuery, SearchResponse } from '../types';

// 将后端的 SPU/SKU 结构转换为前端的 Part 结构
function transformSPUToPart(spu: any): Part[] {
  // 如果 SPU 没有 SKU，返回空数组
  if (!spu.skus || spu.skus.length === 0) {
    return [];
  }
  
  // 为每个 SKU 创建一个 Part 对象
  return spu.skus.map((sku: any) => ({
    id: sku.id,
    partNumber: spu.part_number,
    oemCode: spu.oem_code,
    name: spu.name,
    nameEn: spu.name_en,
    categoryId: spu.category_id,
    brand: spu.brand,
    description: spu.description,
    images: {
      thumbnail: sku.images?.[0] || '',
      fullSize: sku.images || [],
      blurhash: 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH',
    },
    specifications: sku.specifications || {},
    price: parseFloat(sku.price) || 0,
    currency: sku.currency || 'CNY',
    stock: sku.stock || 0,
    model3DUrl: sku.model_3d_url,
    technicalDrawingUrl: sku.technical_drawing_url,
    compatibleVehicles: [],
    alternatives: [],
    createdAt: spu.created_at,
    updatedAt: spu.updated_at,
  }));
}

export const partsApi = {
  // 搜索零部件
  async search(query: SearchQuery): Promise<SearchResponse> {
    const response = await client.post('/parts/search', {
      keyword: query.keyword,
      type: query.type,
      category_id: query.categoryId,
      filters: query.filters,
      sort_by: query.sortBy,
      sort_order: query.sortOrder,
      page: query.page,
      page_size: query.pageSize,
    });

    // axios 拦截器已返回 response.data 且转为 camelCase；此处断言 body 形状
    type SearchBody = {
      items?: unknown[];
      total?: number;
      page?: number;
      pageSize?: number;
      page_size?: number;
      hasMore?: boolean;
      has_more?: boolean;
    };
    const body = response as unknown as SearchBody;

    const parts: Part[] = [];
    if (body.items && Array.isArray(body.items)) {
      body.items.forEach((spu: any) => {
        parts.push(...transformSPUToPart(spu));
      });
    }

    const pageSize = body.pageSize ?? body.page_size ?? 20;

    return {
      success: true,
      data: {
        parts,
        total: body.total ?? 0,
        page: body.page ?? 1,
        pageSize,
        hasMore: body.hasMore ?? body.has_more ?? false,
      },
    };
  },

  // 获取零部件详情
  async getById(id: string): Promise<{ success: boolean; data: Part }> {
    return client.get(`/parts/${id}`);
  },

  // 获取推荐零部件
  async getRecommended(id: string): Promise<{ success: boolean; data: Part[] }> {
    return client.get(`/parts/${id}/recommended`);
  },

  // 创建零部件 (管理员)
  async create(data: Partial<Part>): Promise<{ success: boolean; data: Part }> {
    return client.post('/parts', data);
  },

  // 更新零部件 (管理员)
  async update(id: string, data: Partial<Part>): Promise<{ success: boolean; data: Part }> {
    return client.put(`/parts/${id}`, data);
  },

  // 删除零部件 (管理员)
  async delete(id: string): Promise<{ success: boolean }> {
    return client.delete(`/parts/${id}`);
  },
};
