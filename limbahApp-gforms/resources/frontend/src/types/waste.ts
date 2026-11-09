export type WasteStatus = 'pending' | 'processed' | 'disposed' | 'received' | 'completed' | 'draft' | 'verified' | 'rejected'
export type WasteSession = 'MORNING' | 'AFTERNOON' | 'morning' | 'afternoon'
export type WasteMovementType = 'IN' | 'OUT'
export type WasteCategoryType = 'b3in' | 'b3out' | 'domMorning' | 'domAfternoon'

/**
 * Data model for B3 Waste Transaction DTO
 */
export interface B3TransactionData {
  id: number | string
  rawId?: number
  date: string
  transaction_type?: WasteMovementType
  category?: 'b3in' | 'b3out'
  waste_category_id?: number
  waste_code?: string | null
  wasteCode?: string
  waste_name?: string | null
  type?: string
  source?: string | null
  destination?: string | null
  transporter?: string | null
  transport?: string | null
  manifest_number?: string | null
  manifest?: string | null
  weight_kg?: number | string
  amountKg?: number
  weightKg?: number
  remaining_weight_kg?: number | string | null
  status?: string | null
  storage_deadline_at?: string | null
  storageDeadlineDays?: number
  storageCapacityKg?: number
  currentStorageKg?: number
  scale_photo_path?: string | null
  scale_photo_url?: string | null
  scalePhotoUrl?: string | null
  notes?: string | null
  created_by?: number | null
  updated_by?: number | null
  creator?: { id: number; name: string; email: string } | null
  updater?: { id: number; name: string; email: string } | null
  created_at?: string
  updated_at?: string
}

/**
 * Data model for Domestic Waste Transaction DTO
 */
export interface DomesticTransactionData {
  id: number | string
  rawId?: number
  date: string
  movement_type?: WasteMovementType | null
  session?: WasteSession | null
  processing_method?: string | null

  organic_weight_kg?: number | string
  inorganic_weight_kg?: number | string
  total_weight_kg?: number | string
  organicKg?: number
  inorganicKg?: number
  totalKg?: number

  domestic_residue_kg?: number | string
  leaf_waste_kg?: number | string
  paper_waste_kg?: number | string
  wood_scrap_kg?: number | string
  metal_kg?: number | string
  cardboard_kg?: number | string
  plant_waste_kg?: number | string
  plastic_bottle_kg?: number | string
  plastic_packaging_kg?: number | string
  food_container_kg?: number | string
  wood_cutting_kg?: number | string
  brick_kg?: number | string
  concrete_block_kg?: number | string
  cement_packaging_kg?: number | string
  ceiling_waste_kg?: number | string

  status?: string | null
  pic_name?: string | null
  picName?: string
  pic_phone?: string | null
  notes?: string | null
  created_by?: number | null
  updated_by?: number | null
  creator?: { id: number; name: string; email: string } | null
  updater?: { id: number; name: string; email: string } | null
  created_at?: string
  updated_at?: string
}

/**
 * Data model for App Notifications
 */
export interface AppNotification {
  id: number | string
  type: string
  title: string
  message: string
  reference_type?: string | null
  reference_id?: number | null
  is_read?: boolean
  read?: boolean
  read_at?: string | null
  timestamp?: string
  created_at?: string
}

/**
 * Storage Alert Item with deadline calculation
 */
export interface StorageAlertItem extends B3TransactionData {
  alertId?: number
  urgency: 'exceeded' | 'warning' | 'ok'
  daysRemaining?: number
  deadlineFormatted?: string
}

/**
 * Standard Paginated Response DTO
 */
export interface PaginatedResponse<T> {
  data: T[]
  meta?: {
    current_page: number
    last_page: number
    per_page: number
    total: number
    from?: number | null
    to?: number | null
  }
  links?: {
    first?: string
    last?: string
    prev?: string | null
    next?: string | null
  }
  current_page?: number
  last_page?: number
  per_page?: number
  total?: number
}
