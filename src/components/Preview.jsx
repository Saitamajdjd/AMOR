import { memo, useState, useEffect, useMemo, useRef } from 'react'
import { extractYouTubeId } from '../lib/supabase'

function calculateTimeTogether(dataInicio, horaInicio) {
  if (!dataInicio) return null

  const start = new Date(dataInicio)
  if (horaInicio) {
    const [hours, minutes] = horaInicio.split(':')
    start.setHours(parseInt(hours), parseInt(minutes))
  }

  const now = new Date()
  const diff = now - start

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const months = Math.floor(days / 30)
  const years = Math.floor(months / 12)

  if (years > 0) {
    const remainingMonths = months % 12
    return `${years} ano${years > 1 ? 's' : ''}${remainingMonths > 0 ? ` e ${remainingMonths} mes${remainingMonths > 1 ? 'es' : ''}` : ''}`
  } else if (months > 0) {
    return `${months} mes${months > 1 ? 'es' : ''}`
  } else {
    return `${days} dia${days > 1 ? 's' : ''}`
  }
}

const YouTubePreviewPlayer = memo(function YouTubePreviewPlayer({ videoId, title, artist }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const iframeSrc = useMemo(() => {
    if (!videoId || !isPlaying) return ''
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1`
  }, [videoId, isPlaying])

  useEffect(() => {
    setIsPlaying(false)
  }, [videoId])

  if (!videoId) return null

  return (
    <div className="bg-dark-card rounded-xl p-3">
      <div className="relative">
        {!isPlaying ? (
          <>
            <img
              src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
              alt="Music thumbnail"
              className="w-full rounded-lg"
            />
            <button
              type="button"
              onClick={() => setIsPlaying(true)}
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg"
            >
              <div className="w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </button>
          </>
        ) : (
          <div>
            <iframe
              key={videoId}
              className="w-full aspect-video rounded-lg"
              src={iframeSrc}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <button
              type="button"
              onClick={() => setIsPlaying(false)}
              className="mt-3 h-10 w-full rounded-full border border-white/15 bg-white/10 text-xs font-black text-white"
            >
              Pausar preview
            </button>
          </div>
        )}
      </div>
      {(title || artist) && (
        <p className="text-white text-sm mt-2 text-center">
          {title} {artist && `- ${artist}`}
        </p>
      )}
    </div>
  )
})

function useObjectUrls(files) {
  const urls = useMemo(() => (files || []).map((file) => URL.createObjectURL(file)), [files])

  useEffect(() => {
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [urls])

  return urls
}

export default function Preview({ data, mobile = false }) {
  const [audioPlaying, setAudioPlaying] = useState(false)
  const [currentPhoto, setCurrentPhoto] = useState(0)
  const audioRef = useRef(null)
  const photoUrls = useObjectUrls(data.fotos)
  const stars = useMemo(
    () => Array.from({ length: 20 }, (_, i) => ({
      left: `${(i * 37) % 100}%`,
      top: `${(i * 53) % 100}%`,
      opacity: 0.5 + (i % 5) * 0.1
    })),
    []
  )

  useEffect(() => {
    if (photoUrls.length > 0) {
      const interval = setInterval(() => {
        setCurrentPhoto((prev) => (prev + 1) % photoUrls.length)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [photoUrls.length])

  useEffect(() => {
    setCurrentPhoto((photo) => Math.min(photo, Math.max(0, photoUrls.length - 1)))
  }, [photoUrls.length])

  const timeTogether = calculateTimeTogether(data.dataInicio, data.horaInicio)
  const videoId = extractYouTubeId(data.musicaUrl)
  const audioEspecial = data.audioEspecial

  const toggleAudioPreview = () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      audio.play()
      setAudioPlaying(true)
    } else {
      audio.pause()
      setAudioPlaying(false)
    }
  }

  const Container = ({ children }) => (
    mobile ? (
      <div className="mx-auto w-full max-w-[360px]">{children}</div>
    ) : (
      <div className="w-[320px] mx-auto">{children}</div>
    )
  )

  return (
    <Container>
      <div className="bg-black rounded-[40px] overflow-hidden shadow-2xl border-4 border-gray-800">
        <div className="relative h-[560px] bg-gradient-to-b from-purple-900 via-dark-bg to-dark-bg overflow-y-auto sm:h-[600px]">
          <div className="p-4 space-y-4">
            <div className="text-center py-4">
              <h3 className="font-display text-2xl text-white glow-text">
                {data.tituloPresente || 'Seu presente'}
              </h3>
              {data.nomeDestinataria && (
                <p className="text-rose-400 font-accent text-xl mt-2">
                  Para {data.nomeDestinataria}
                </p>
              )}
            </div>

            {timeTogether && (
              <div className="text-center">
                <div className="inline-block bg-gradient-to-r from-rose-600/30 to-purple-600/30 rounded-full px-6 py-2 border border-rose-500/30">
                  <p className="text-white text-sm">
                    <span className="text-rose-400">❤️</span> {timeTogether} juntos
                  </p>
                </div>
              </div>
            )}

            {photoUrls.length > 0 && (
              <div className="relative h-48 rounded-2xl overflow-hidden">
                {photoUrls.map((foto, index) => (
                  <img
                    key={index}
                    src={foto}
                    alt={`Foto ${index + 1}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                      index === currentPhoto ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                ))}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {photoUrls.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentPhoto ? 'bg-rose-500' : 'bg-gray-500'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            <YouTubePreviewPlayer
              videoId={videoId}
              title={data.musicaTitulo}
              artist={data.musicaArtista}
            />

            {data.mensagem && (
              <div className="bg-dark-card/80 backdrop-blur rounded-xl p-4">
                <p className="text-gray-300 text-center text-sm leading-relaxed italic">
                  "{data.mensagem}"
                </p>
                <p className="text-rose-400 text-center text-xs mt-2">
                  — {data.nomeRemetente || 'Seu amor'}
                </p>
              </div>
            )}

            {audioEspecial?.previewUrl && (
              <div className="rounded-2xl border border-rose-400/25 bg-gradient-to-br from-zinc-950 to-rose-950/70 p-4 shadow-xl">
                <p className="text-center text-[10px] font-bold uppercase tracking-[0.22em] text-rose-200/70">
                  Audio especial
                </p>
                <h4 className="mt-2 text-center font-display text-2xl leading-none text-white">
                  {audioEspecial.titulo || 'Escuta isso com carinho'}
                </h4>
                {audioEspecial.mensagem && (
                  <p className="mt-2 text-center text-xs leading-relaxed text-white/65">
                    {audioEspecial.mensagem}
                  </p>
                )}
                <div className="mt-4 flex items-end justify-center gap-1.5">
                  {[22, 34, 48, 28, 40, 26, 44].map((height, index) => (
                    <span
                      key={index}
                      className={`w-2 rounded-full bg-rose-300/80 ${audioPlaying ? 'animate-pulse' : ''}`}
                      style={{ height }}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={toggleAudioPreview}
                  className="mt-4 h-12 w-full rounded-full bg-white text-sm font-black text-black active:scale-95"
                >
                  {audioPlaying ? 'Pausar' : 'Tocar audio'}
                </button>
                <audio
                  ref={audioRef}
                  src={audioEspecial.previewUrl}
                  onEnded={() => setAudioPlaying(false)}
                  onPlay={() => setAudioPlaying(true)}
                  onPause={() => setAudioPlaying(false)}
                />
              </div>
            )}

            {data.linhaTempo?.momentos?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-white font-display text-center text-sm">
                  {data.linhaTempo.titulo}
                </h4>
                {data.linhaTempo.momentos.slice(0, 3).map((m, i) => (
                  <div key={i} className="flex items-center gap-3 bg-dark-card/50 rounded-lg p-2">
                    <div className="w-10 h-10 bg-rose-500/20 rounded-full flex items-center justify-center">
                      <span className="text-rose-400 text-sm">❤️</span>
                    </div>
                    <div>
                      <p className="text-white text-xs">{m.descricao}</p>
                      <p className="text-gray-500 text-xs">{m.data}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {data.roleta?.opcoes?.length > 0 && (
              <div className="bg-dark-card/50 rounded-xl p-3 text-center">
                <p className="text-gray-400 text-xs">{data.roleta.pergunta}</p>
                <div className="mt-2 flex justify-center gap-1 flex-wrap">
                  {data.roleta.opcoes.slice(0, 4).map((op, i) => (
                    <span
                      key={i}
                      className={`px-2 py-1 rounded-full text-xs ${
                        data.roleta.tema === 'rosa'
                          ? 'bg-rose-500/30 text-rose-300'
                          : 'bg-blue-500/30 text-blue-300'
                      }`}
                    >
                      {op}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {data.jogoPalavra?.palavra && (
              <div className="bg-dark-card/50 rounded-xl p-3">
                <p className="text-gray-400 text-xs text-center mb-2">{data.jogoPalavra.pergunta}</p>
                <div className="flex justify-center gap-1">
                  {Array(data.jogoPalavra.palavra.length).fill(0).map((_, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 bg-dark-border rounded flex items-center justify-center text-white text-sm"
                    >
                      _
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.mapaEstrelas?.texto && (
              <div className="bg-gradient-to-b from-purple-900 to-dark-bg rounded-xl p-4 text-center relative overflow-hidden h-32">
                <div className="absolute inset-0">
                  {stars.map((star, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                      style={{
                        left: star.left,
                        top: star.top,
                        opacity: star.opacity
                      }}
                    />
                  ))}
                </div>
                <p className="text-gray-300 text-sm relative z-10">
                  {data.mapaEstrelas.texto}
                </p>
                {data.mapaEstrelas.dataCidade && (
                  <p className="text-rose-400 text-xs mt-1 relative z-10">
                    {data.mapaEstrelas.dataCidade}
                  </p>
                )}
              </div>
            )}

            <div className="text-center py-4">
              <p className="text-gray-500 text-xs">
                Feito com ❤️ por Amor Presente
              </p>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}
