export const AUDIO_DEFAULT_TITLE = 'Escuta isso com carinho'
export const AUDIO_DEFAULT_MESSAGE = 'Eu gravei esse audio pensando em voce.'
export const AUDIO_MAX_BYTES = 10 * 1024 * 1024

export const AUDIO_ALLOWED_MIME_TYPES = [
  'audio/mpeg',
  'audio/wav',
  'audio/webm',
  'audio/mp4',
  'audio/x-m4a',
  'audio/ogg'
]

const MIME_EXTENSION = {
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'audio/webm': 'webm',
  'audio/mp4': 'mp4',
  'audio/x-m4a': 'm4a',
  'audio/ogg': 'ogg'
}

const EXTENSION_MIME = {
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  webm: 'audio/webm',
  m4a: 'audio/x-m4a',
  mp4: 'audio/mp4',
  ogg: 'audio/ogg'
}

const RECORDING_MIME_TYPES = ['audio/webm', 'audio/mp4', 'audio/x-m4a', 'audio/ogg']

export function normalizeAudioMimeType(type) {
  return type?.split(';')[0]?.trim().toLowerCase() || ''
}

export function getAudioExtension(file) {
  const fromName = file?.name?.split('.').pop()?.toLowerCase()
  if (fromName && EXTENSION_MIME[fromName]) return fromName
  if (fromName && file?.name?.includes('.')) return fromName
  return MIME_EXTENSION[normalizeAudioMimeType(file?.type)] || ''
}

export function validateAudioFile(file) {
  if (!file) {
    return { valid: false, error: 'Selecione ou grave um audio antes de continuar.' }
  }

  const extension = getAudioExtension(file)
  const allowedByType = AUDIO_ALLOWED_MIME_TYPES.includes(normalizeAudioMimeType(file.type))
  const allowedByExtension = Boolean(EXTENSION_MIME[extension])

  if (!allowedByType && !allowedByExtension) {
    return { valid: false, error: 'Use um arquivo MP3, WAV, WEBM, M4A, MP4 ou OGG.' }
  }

  if (file.size > AUDIO_MAX_BYTES) {
    return { valid: false, error: 'O audio precisa ter ate 10MB.' }
  }

  return { valid: true, error: null }
}

export function buildAudioStoragePath(file, slug, timestamp = Date.now(), random = Math.random) {
  const token = random().toString(36).slice(2, 10)
  return `audios/${slug}/audio-${timestamp}-${token}.${getAudioExtension(file) || 'webm'}`
}

export function getAudioContentType(file) {
  return normalizeAudioMimeType(file?.type) || EXTENSION_MIME[getAudioExtension(file)] || 'audio/webm'
}

export function getSupportedRecordingMimeType(isTypeSupported) {
  if (typeof isTypeSupported !== 'function') return ''
  return RECORDING_MIME_TYPES.find((type) => isTypeSupported(type)) || ''
}
