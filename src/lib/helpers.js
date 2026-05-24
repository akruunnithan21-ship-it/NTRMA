/**
 * Generate a unique ID
 */
export function newId() {
  return crypto.randomUUID ? crypto.randomUUID() : 
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
}

/**
 * Get today's date in ISO format (YYYY-MM-DD)
 */
export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Format a timestamp to a readable date
 */
export function formatDate(d) {
  if (!d) return '—'
  const date = new Date(d)
  if (isNaN(date)) return '—'
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

/**
 * Format a timestamp to date + time
 */
export function formatDateTime(d) {
  if (!d) return '—'
  const date = new Date(d)
  if (isNaN(date)) return '—'
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Generate next RMA number based on existing tickets
 */
export function generateRmaNumber(tickets = []) {
  const yr = new Date().getFullYear().toString().slice(-2)
  const prefix = `NT${yr}-`
  let max = 0
  tickets.forEach(t => {
    if (t.rma_number && t.rma_number.startsWith(prefix)) {
      const n = parseInt(t.rma_number.slice(prefix.length), 10)
      if (!isNaN(n) && n > max) max = n
    }
  })
  return prefix + String(max + 1).padStart(4, '0')
}

/**
 * Truncate text with ellipsis
 */
export function truncate(str, len = 40) {
  if (!str) return ''
  return str.length > len ? str.slice(0, len) + '...' : str
}
