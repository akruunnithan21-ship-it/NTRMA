import { supabase } from './supabase'

// ============================
// TICKETS
// ============================
export async function getTickets() {
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getTicket(id) {
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function saveTicket(ticket) {
  const now = new Date().toISOString()
  const payload = { ...ticket, updated_at: now }
  if (!payload.created_at) payload.created_at = now

  const { data, error } = await supabase
    .from('tickets')
    .upsert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteTicket(id) {
  const { error } = await supabase
    .from('tickets')
    .delete()
    .eq('id', id)
  if (error) throw error
  return true
}

// ============================
// TICKET PHOTOS
// ============================
export async function getTicketPhotos(ticketId) {
  const { data, error } = await supabase
    .from('ticket_photos')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('taken_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function saveTicketPhoto(photo) {
  const { data, error } = await supabase
    .from('ticket_photos')
    .insert(photo)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteTicketPhoto(id) {
  const { error } = await supabase
    .from('ticket_photos')
    .delete()
    .eq('id', id)
  if (error) throw error
  return true
}

export async function uploadPhoto(file, ticketId) {
  const ext = file.name.split('.').pop()
  const fileName = `${ticketId}/${Date.now()}.${ext}`
  
  const { data, error } = await supabase.storage
    .from('ticket-photos')
    .upload(fileName, file, { cacheControl: '3600' })
  
  if (error) throw error
  
  const { data: urlData } = supabase.storage
    .from('ticket-photos')
    .getPublicUrl(data.path)
  
  return urlData.publicUrl
}

// ============================
// RACK ITEMS
// ============================
export async function getRackItems() {
  const { data, error } = await supabase
    .from('rack_items')
    .select('*')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function saveRackItem(item) {
  const now = new Date().toISOString()
  const payload = { ...item, updated_at: now }
  if (!payload.created_at) payload.created_at = now

  const { data, error } = await supabase
    .from('rack_items')
    .upsert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteRackItem(id) {
  const { error } = await supabase
    .from('rack_items')
    .delete()
    .eq('id', id)
  if (error) throw error
  return true
}

// ============================
// SETTINGS
// ============================
export async function getSettings() {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
  if (error) throw error
  
  const map = {}
  ;(data || []).forEach(row => { map[row.key] = row.value })
  return map
}

export async function getSetting(key) {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', key)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data?.value || null
}

export async function setSetting(key, value) {
  const { data, error } = await supabase
    .from('settings')
    .upsert({ key, value }, { onConflict: 'key' })
    .select()
    .single()
  if (error) throw error
  return data
}
