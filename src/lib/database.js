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
// STATUS HISTORY
// ============================
export async function getStatusHistory(ticketId) {
  const { data, error } = await supabase
    .from('status_history')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('changed_at', { ascending: true })
  if (error) throw error
  return data || []
}

export async function addStatusChange(ticketId, fromStatus, toStatus) {
  const { data, error } = await supabase
    .from('status_history')
    .insert({
      id: crypto.randomUUID(),
      ticket_id: ticketId,
      from_status: fromStatus,
      to_status: toStatus,
      changed_at: new Date().toISOString(),
    })
    .select()
    .single()
  if (error) throw error
  return data
}

// ============================
// CUSTOMER NAMES (for autocomplete)
// ============================
export async function getUniqueCustomerNames() {
  const { data, error } = await supabase
    .from('tickets')
    .select('customer_name')
    .not('customer_name', 'is', null)
    .order('customer_name')
  if (error) throw error
  const names = [...new Set((data || []).map(t => t.customer_name).filter(Boolean))]
  return names
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



// ============================
// SERVICE TICKETS
// ============================
export async function getServiceTickets() {
  const { data, error } = await supabase
    .from('service_tickets')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getServiceTicket(id) {
  const { data, error } = await supabase
    .from('service_tickets')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function saveServiceTicket(ticket) {
  const now = new Date().toISOString()
  const payload = { ...ticket, updated_at: now }
  if (!payload.created_at) payload.created_at = now

  const { data, error } = await supabase
    .from('service_tickets')
    .upsert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteServiceTicket(id) {
  const { error } = await supabase
    .from('service_tickets')
    .delete()
    .eq('id', id)
  if (error) throw error
  return true
}



// ============================
// ONSITE TICKETS
// ============================
export async function getOnsiteTickets() {
  const { data, error } = await supabase
    .from('onsite_tickets')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getOnsiteTicket(id) {
  const { data, error } = await supabase
    .from('onsite_tickets')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function saveOnsiteTicket(ticket) {
  const now = new Date().toISOString()
  const payload = { ...ticket, updated_at: now }
  if (!payload.created_at) payload.created_at = now

  const { data, error } = await supabase
    .from('onsite_tickets')
    .upsert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteOnsiteTicket(id) {
  const { error } = await supabase
    .from('onsite_tickets')
    .delete()
    .eq('id', id)
  if (error) throw error
  return true
}

// ============================
// REMOTE SESSION TICKETS
// ============================
export async function getRemoteTickets() {
  const { data, error } = await supabase
    .from('remote_tickets')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getRemoteTicket(id) {
  const { data, error } = await supabase
    .from('remote_tickets')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function saveRemoteTicket(ticket) {
  const now = new Date().toISOString()
  const payload = { ...ticket, updated_at: now }
  if (!payload.created_at) payload.created_at = now

  const { data, error } = await supabase
    .from('remote_tickets')
    .upsert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteRemoteTicket(id) {
  const { error } = await supabase
    .from('remote_tickets')
    .delete()
    .eq('id', id)
  if (error) throw error
  return true
}
