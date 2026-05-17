import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env')
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export const STORAGE_BUCKET = 'presentes-imagens'

export async function uploadImage(file, slug, index) {
  if (!supabase) throw new Error('Supabase not configured')

  const ext = file.name.split('.').pop()
  const path = `presentes/${slug}/foto${index + 1}.${ext}`

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, { upsert: true })

  if (error) throw error

  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(path)

  return urlData.publicUrl
}

export async function savePresente(data) {
  if (!supabase) throw new Error('Supabase not configured')

  const { data: result, error } = await supabase
    .from('presentes')
    .insert([data])
    .select()
    .single()

  if (error) throw error
  return result
}

export async function getPresenteBySlug(slug) {
  if (!supabase) throw new Error('Supabase not configured')

  const { data, error } = await supabase
    .from('presentes')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) throw error
  return data
}

export function extractYouTubeId(url) {
  if (!url) return null

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}