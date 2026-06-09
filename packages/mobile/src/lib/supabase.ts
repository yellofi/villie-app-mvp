import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,        // 세션을 AsyncStorage에 영속화 (앱 재시작 시 유지)
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,    // React Native에서는 false
  },
})
