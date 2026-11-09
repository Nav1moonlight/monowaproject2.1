type ApiErrorBody = {
  message?: string;
  errors?: Record<string, string[]>;
};

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('auth_token');
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const errorBody = body as ApiErrorBody | null;

    const firstError = errorBody?.errors
      ? Object.values(errorBody.errors).flat().find(Boolean)
      : undefined;

    throw new Error(
      firstError ??
      errorBody?.message ??
      `Request gagal dengan status ${response.status}.`,
    );
  }

  return body as T;
}

export async function getApi<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return parseResponse<T>(response);
}

export async function postApi<TResponse, TPayload>(
  url: string,
  payload: TPayload,
): Promise<TResponse> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return parseResponse<TResponse>(response);
}

export async function putApi<TResponse, TPayload>(
  url: string,
  payload: TPayload,
): Promise<TResponse> {
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return parseResponse<TResponse>(response);
}

export async function deleteApi<TResponse = void>(url: string): Promise<TResponse> {
  const response = await fetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return parseResponse<TResponse>(response);
}

export async function postFormDataApi<TResponse>(
  url: string,
  formData: FormData,
): Promise<TResponse> {
  const response = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });

  return parseResponse<TResponse>(response);
}

/* =========================================================
   AUTHENTICATION API
   ========================================================= */

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role?: string;
  email_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type AuthResponse = {
  status: string;
  message: string;
  user: AuthUser;
  access_token: string;
  token_type: string;
};

export async function apiLogin(payload: { email: string; password: string }): Promise<AuthResponse> {
  return postApi<AuthResponse, typeof payload>('/api/login', payload);
}

export async function apiRegister(payload: { name: string; email: string; password: string }): Promise<AuthResponse> {
  return postApi<AuthResponse, typeof payload>('/api/register', payload);
}

export async function apiLogout(): Promise<{ status: string; message: string }> {
  return postApi<{ status: string; message: string }, {}>('/api/logout', {});
}

export async function apiMe(): Promise<{ status: string; user: AuthUser }> {
  return getApi<{ status: string; user: AuthUser }>('/api/me');
}

/* =========================================================
   DASHBOARD
   ========================================================= */

export type DashboardSummaryData = {
  b3_in_weight_kg: number;
  b3_out_weight_kg: number;
  b3_count_in: number;
  b3_count_out: number;
  domestic_today_organic_kg: number;
  domestic_today_inorganic_kg: number;
};

type DashboardSummaryApiResponse =
  | DashboardSummaryData
  | {
    data: DashboardSummaryData;
  };

export async function getDashboardSummary(): Promise<DashboardSummaryData> {
  const response = await getApi<DashboardSummaryApiResponse>(
    '/api/dashboard/summary',
  );

  if (
    response !== null &&
    typeof response === 'object' &&
    'data' in response
  ) {
    return response.data;
  }

  return response;
}

export type DashboardTrendItem = {
  month: string;
  month_name: string;
  b3_in_weight_kg: number;
  b3_out_weight_kg: number;
  b3_weight_kg: number;
  domestic_organic_kg: number;
  domestic_inorganic_kg: number;
  domestic_weight_kg: number;
};

export type CategoryBreakdownItem = {
  category_id: number;
  category_name: string;
  category_code: string;
  transaction_count: number;
  total_weight_kg: number;
  in_weight_kg?: number;
  out_weight_kg?: number;
  in_count: number;
  out_count: number;
};

export async function getDashboardTrends(months = 12, year?: string | number): Promise<DashboardTrendItem[]> {
  const query = new URLSearchParams()
  if (months) query.set('months', String(months))
  if (year) query.set('year', String(year))
  const res = await getApi<{ trends: DashboardTrendItem[] }>(`/api/dashboard/monthly-trends?${query.toString()}`)
  return res?.trends ?? [];
}

export type DashboardYearlyTrendItem = {
  name: string;
  year: string;
  b3in: number;
  b3out: number;
  b3_in_weight_kg: number;
  b3_out_weight_kg: number;
  b3_weight_kg: number;
  morning: number;
  afternoon: number;
  organic: number;
  inorganic: number;
  domestic_organic_kg: number;
  domestic_inorganic_kg: number;
  domestic_weight_kg: number;
};

export async function getDashboardYearlyTrends(years = 5): Promise<DashboardYearlyTrendItem[]> {
  const res = await getApi<{ trends: DashboardYearlyTrendItem[] }>(`/api/dashboard/yearly-trends?years=${years}`);
  return res?.trends ?? [];
}

export async function getDashboardCategoryBreakdown(): Promise<CategoryBreakdownItem[]> {
  const res = await getApi<{ categories: CategoryBreakdownItem[] }>('/api/dashboard/category-breakdown');
  return res?.categories ?? [];
}

export type StorageAlertItemApi = {
  id: number;
  alert_type: string;
  is_active: boolean;
  deadline_at: string | null;
  is_expired: boolean;
  days_until_deadline: number;
  is_triggered: boolean;
  triggered_at: string | null;
  b3_transaction?: {
    id: number;
    waste_code: string;
    waste_name: string;
    transaction_type: string;
    weight_kg: number;
    status: string;
  } | null;
};

export async function getDashboardAlerts(): Promise<StorageAlertItemApi[]> {
  const res = await getApi<{ data: StorageAlertItemApi[] } | StorageAlertItemApi[]>('/api/dashboard/alerts');
  if (Array.isArray(res)) return res;
  return res?.data ?? [];
}

export async function acknowledgeAlertApi(id: number | string, acknowledgedBy?: string): Promise<any> {
  return postApi(`/api/dashboard/alerts/${id}/acknowledge`, { acknowledged_by: acknowledgedBy });
}

/* =========================================================
   WASTE CATEGORIES & SOURCES (MASTER DATA)
   ========================================================= */

export type CategoryItem = {
  id: number;
  code: string;
  name: string;
  description?: string;
  waste_type?: string;
};

export async function getWasteCategories(): Promise<CategoryItem[]> {
  const res = await getApi<{ data: CategoryItem[] } | CategoryItem[]>('/api/waste-categories?per_page=100');
  if (Array.isArray(res)) return res;
  return res?.data ?? [];
}

export type WasteSourceItem = {
  id: number;
  name: string;
  code?: string | null;
  entity?: string;
  description?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export async function getWasteSources(params?: {
  all?: boolean;
  active?: boolean;
  entity?: string;
  search?: string;
}): Promise<WasteSourceItem[]> {
  const q = new URLSearchParams();
  if (params?.all) q.set('all', '1');
  if (params?.active !== undefined) q.set('active', params.active ? '1' : '0');
  if (params?.entity) q.set('entity', params.entity);
  if (params?.search) q.set('search', params.search);
  q.set('per_page', '100');

  const res = await getApi<{ data: WasteSourceItem[] } | WasteSourceItem[]>(`/api/waste-sources?${q.toString()}`);
  if (Array.isArray(res)) return res;
  return res?.data ?? [];
}

export async function createWasteSource(payload: {
  name: string;
  code?: string;
  entity?: string;
  description?: string;
  is_active?: boolean;
}): Promise<WasteSourceItem> {
  const res = await postApi<{ data: WasteSourceItem } | WasteSourceItem, any>('/api/waste-sources', payload);
  return (res as any)?.data ?? res;
}

export async function updateWasteSource(
  id: number,
  payload: Partial<WasteSourceItem>,
): Promise<WasteSourceItem> {
  const res = await putApi<{ data: WasteSourceItem } | WasteSourceItem, any>(`/api/waste-sources/${id}`, payload);
  return (res as any)?.data ?? res;
}

export async function deleteWasteSource(id: number): Promise<void> {
  return deleteApi(`/api/waste-sources/${id}`);
}

/* =========================================================
   B3 TRANSACTIONS
   ========================================================= */

import type {
  B3TransactionData,
  DomesticTransactionData,
  AppNotification,
  PaginatedResponse,
} from './types/waste'

export type B3Transaction = B3TransactionData
export type DomesticTransaction = DomesticTransactionData
export type ApiNotification = AppNotification
export type { PaginatedResponse }

export async function getB3Transactions(
  params?: {
    page?: number;
    per_page?: number;
    type?: 'IN' | 'OUT';
    status?: string;
    search?: string;
    from?: string;
    to?: string;
  },
): Promise<PaginatedResponse<B3Transaction>> {
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.per_page) searchParams.set('per_page', String(params.per_page));
  if (params?.type) searchParams.set('type', params.type);
  if (params?.status) searchParams.set('status', params.status);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.from) searchParams.set('date_from', params.from);
  if (params?.to) searchParams.set('date_to', params.to);

  const query = searchParams.toString();

  return getApi<PaginatedResponse<B3Transaction>>(
    `/api/b3-transactions${query ? `?${query}` : ''}`,
  );
}

/* =========================================================
   DOMESTIC TRANSACTIONS
   ========================================================= */



export async function getDomesticTransactions(
  params?: {
    page?: number;
    per_page?: number;
    movement_type?: 'IN' | 'OUT';
    session?: 'MORNING' | 'AFTERNOON';
    status?: string;
    search?: string;
    from?: string;
    to?: string;
  },
): Promise<PaginatedResponse<DomesticTransaction>> {
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.per_page) searchParams.set('per_page', String(params.per_page));
  if (params?.movement_type) searchParams.set('movement_type', params.movement_type);
  if (params?.session) searchParams.set('session', params.session);
  if (params?.status) searchParams.set('status', params.status);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.from) searchParams.set('date_from', params.from);
  if (params?.to) searchParams.set('date_to', params.to);

  const query = searchParams.toString();

  return getApi<PaginatedResponse<DomesticTransaction>>(
    `/api/domestic-transactions${query ? `?${query}` : ''}`,
  );
}

export type CreateB3TransactionPayload = {
  transaction_type: 'IN' | 'OUT';
  waste_category_id: number;
  waste_code: string;
  waste_name: string;
  date: string;
  source?: string | null;
  destination?: string | null;
  transporter?: string | null;
  manifest_number?: string | null;
  weight_kg: number;
  remaining_weight_kg?: number | null;
  status: string;
  storage_deadline_at?: string | null;
  notes?: string | null;
};

export async function createB3TransactionApi(
  payload: CreateB3TransactionPayload,
  scalePhoto?: File | null,
): Promise<{ data: B3Transaction }> {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      formData.append(key, String(value));
    }
  });
  if (scalePhoto) {
    formData.append('scale_photo', scalePhoto);
  }
  return postFormDataApi<{ data: B3Transaction }>('/api/b3-transactions', formData);
}

export async function updateB3Transaction(
  id: number | string,
  data: Record<string, any>,
): Promise<{ data: B3Transaction }> {
  return putApi<{ data: B3Transaction }, Record<string, any>>(
    `/api/b3-transactions/${id}`,
    data,
  );
}

export async function deleteB3Transaction(id: number | string): Promise<void> {
  return deleteApi(`/api/b3-transactions/${id}`);
}

export type CreateDomesticTransactionPayload = {
  date: string;
  movement_type: 'IN' | 'OUT';
  session?: 'MORNING' | 'AFTERNOON' | null;
  processing_method?: string | null;
  status?: string;
  pic_name: string;
  pic_phone?: string | null;
  notes?: string | null;
  domestic_residue_kg?: number;
  leaf_waste_kg?: number;
  paper_waste_kg?: number;
  wood_scrap_kg?: number;
  metal_kg?: number;
  cardboard_kg?: number;
  plant_waste_kg?: number;
  plastic_bottle_kg?: number;
  plastic_packaging_kg?: number;
  food_container_kg?: number;
  wood_cutting_kg?: number;
  brick_kg?: number;
  concrete_block_kg?: number;
  cement_packaging_kg?: number;
  ceiling_waste_kg?: number;
};

export async function createDomesticTransaction(
  payload: CreateDomesticTransactionPayload,
): Promise<{ data: DomesticTransaction }> {
  return postApi<{ data: DomesticTransaction }, CreateDomesticTransactionPayload>(
    '/api/domestic-transactions',
    payload,
  );
}

export async function updateDomesticTransaction(
  id: number | string,
  data: Record<string, any>,
): Promise<{ data: DomesticTransaction }> {
  return putApi<{ data: DomesticTransaction }, Record<string, any>>(
    `/api/domestic-transactions/${id}`,
    data,
  );
}

export async function deleteDomesticTransaction(id: number | string): Promise<void> {
  return deleteApi(`/api/domestic-transactions/${id}`);
}

/* =========================================================
   NOTIFICATIONS
   ========================================================= */



export async function getNotifications(params?: {
  include_read?: boolean;
  type?: string;
  per_page?: number;
}): Promise<ApiNotification[]> {
  const searchParams = new URLSearchParams();
  if (params?.include_read !== undefined) searchParams.set('include_read', String(params.include_read));
  if (params?.type) searchParams.set('type', params.type);
  if (params?.per_page) searchParams.set('per_page', String(params.per_page));

  const query = searchParams.toString();
  const res = await getApi<{ data: ApiNotification[] } | ApiNotification[]>(
    `/api/notifications${query ? `?${query}` : ''}`,
  );

  if (Array.isArray(res)) return res;
  return res?.data ?? [];
}

export async function markNotificationAsRead(id: number | string): Promise<ApiNotification> {
  const res = await postApi<{ data: ApiNotification } | ApiNotification, {}>(
    `/api/notifications/${id}/read`,
    {},
  );
  if (res && 'data' in res) return res.data;
  return res as ApiNotification;
}

/* =========================================================
   SYSTEM SETTINGS
   ========================================================= */

export async function getSystemSettings(): Promise<Record<string, string>> {
  const res = await getApi<{ data: Record<string, string> }>('/api/settings');
  return res?.data ?? {};
}

export async function updateSystemSettings(
  settings: Record<string, any>,
): Promise<Record<string, string>> {
  const res = await postApi<{ data: Record<string, string> }, Record<string, any>>(
    '/api/settings',
    settings,
  );
  return res?.data ?? {};
}

/* =========================================================
   GOOGLE SHEETS SYNC
   ========================================================= */

export interface GoogleSheetsSyncResult {
  status: string;
  summary: {
    b3_synced: number;
    domestic_synced: number;
    errors: string[];
  };
}

export async function triggerGoogleSheetsSync(): Promise<GoogleSheetsSyncResult> {
  return getApi<GoogleSheetsSyncResult>('/api/sync/pull');
}
