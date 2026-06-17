import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// 키 없으면 null 반환 → 데모 모드로 자동 폴백
export const supabase = (url && key) ? createClient(url, key) : null

export const isSupabaseReady = () => !!supabase
