export function calculateTimeTogether(dataInicio, horaInicio) {
  if (!dataInicio) return null
  const start = new Date(dataInicio)
  if (horaInicio) {
    const [hours, minutes] = horaInicio.split(':')
    start.setHours(parseInt(hours), parseInt(minutes))
  }
  const now = new Date()
  const diff = now - start
  const totalSeconds = Math.floor(diff / 1000)
  const days = Math.floor(totalSeconds / (60 * 60 * 24))
  const hoursLeft = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60))
  const minutesLeft = Math.floor((totalSeconds % (60 * 60)) / 60)
  const years = Math.floor(days / 365)
  const months = Math.floor((days % 365) / 30)
  return { days, years, months, hours: hoursLeft, minutes: minutesLeft, totalSeconds }
}

export function hasContent(value) {
  if (value == null) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object') {
    if (value.itens?.length) return true
    if (value.url) return true
    if (value.texto?.trim()) return true
    return Object.values(value).some(hasContent)
  }
  return true
}

export function getListItems(data) {
  if (!data) return null
  if (Array.isArray(data)) return data.filter((i) => typeof i === 'string' && i.trim())
  if (data.itens?.length) return data.itens.filter((i) => typeof i === 'string' && i.trim())
  if (typeof data === 'string' && data.trim()) return [data]
  if (data.texto?.trim()) return [data.texto]
  return null
}

export function getText(data) {
  if (!data) return null
  if (typeof data === 'string') return data.trim() || null
  if (data.texto?.trim()) return data.texto.trim()
  return null
}

export function getAudioUrl(data) {
  if (!data) return null
  if (typeof data === 'string') return data
  return data.url || null
}

export function getYoutubeEmbedUrl(videoId) {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const params = new URLSearchParams({
    enablejsapi: '1',
    rel: '0',
    playsinline: '1',
    modestbranding: '1',
    origin
  })
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`
}

export function youtubeCommand(iframe, func, args = '') {
  iframe?.contentWindow?.postMessage(
    JSON.stringify({ event: 'command', func, args }),
    '*'
  )
}
