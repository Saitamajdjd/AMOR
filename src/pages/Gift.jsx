import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPresenteBySlug } from '../lib/supabase'
import { calculateTimeTogether, youtubeCommand, getYoutubeEmbedUrl } from './gift/helpers'
import { buildSlides } from './gift/buildSlides'
import { CrocIntro } from './gift/GiftUI'
import StoryTapZones from './gift/StoryTapZones'

function normalizeTime(dataInicio, horaInicio) {
  const data = calculateTimeTogether(dataInicio, horaInicio)
  if (!data) return null
  return { ...data, seconds: data.totalSeconds % 60 }
}

export default function Gift() {
  const { slug } = useParams()
  const [presente, setPresente] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPhoto, setCurrentPhoto] = useState(0)
  const [showIntro, setShowIntro] = useState(true)
  const [showButton, setShowButton] = useState(false)
  const [timeData, setTimeData] = useState(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slideAnimClass, setSlideAnimClass] = useState('')
  const [isAnimating, setIsAnimating] = useState(false)
  const [musicPlaying, setMusicPlaying] = useState(false)
  const [musicBlocked, setMusicBlocked] = useState(false)
  const [musicProgress, setMusicProgress] = useState(0)
  const [pauseAudioSignal, setPauseAudioSignal] = useState(0)
  const musicIframeRef = useRef(null)
  const musicReadyRef = useRef(false)
  const musicWantedRef = useRef(false)
  const pointerStartRef = useRef(null)
  const pointerLockRef = useRef(false)

  useEffect(() => {
    async function fetchPresente() {
      try {
        const data = await getPresenteBySlug(slug)
        if (!data) setError('Presente nao encontrado')
        else {
          setPresente(data)
          setTimeData(normalizeTime(data.data_inicio, data.hora_inicio))
        }
      } catch {
        setError('Erro ao carregar presente')
      } finally {
        setLoading(false)
      }
    }
    fetchPresente()
  }, [slug])

  useEffect(() => {
    if (!loading && presente) {
      const timer = setTimeout(() => setShowButton(true), 1400)
      return () => clearTimeout(timer)
    }
  }, [loading, presente])

  useEffect(() => {
    if (presente?.fotos?.length > 1) {
      const interval = setInterval(
        () => setCurrentPhoto((prev) => (prev + 1) % presente.fotos.length),
        4200
      )
      return () => clearInterval(interval)
    }
  }, [presente?.fotos])

  useEffect(() => {
    if (!showIntro && presente) {
      const interval = setInterval(
        () => setTimeData(normalizeTime(presente.data_inicio, presente.hora_inicio)),
        1000
      )
      return () => clearInterval(interval)
    }
  }, [showIntro, presente])

  useEffect(() => {
    musicReadyRef.current = false
    musicWantedRef.current = false
    setMusicPlaying(false)
    setMusicBlocked(false)
    setMusicProgress(0)
  }, [presente?.musica_video_id])

  const playMusic = useCallback(() => {
    musicWantedRef.current = true
    if (!musicIframeRef.current || !musicReadyRef.current) {
      setMusicBlocked(true)
      return
    }
    youtubeCommand(musicIframeRef.current, 'playVideo')
    setMusicPlaying(true)
  }, [])

  const pauseMusic = useCallback(() => {
    musicWantedRef.current = false
    if (musicIframeRef.current && musicReadyRef.current) {
      youtubeCommand(musicIframeRef.current, 'pauseVideo')
    }
    setMusicPlaying(false)
  }, [])

  const startMusic = useCallback(() => {
    if (!presente?.musica_video_id) return
    setPauseAudioSignal((value) => value + 1)
    setMusicBlocked(false)
    playMusic()
  }, [presente?.musica_video_id, playMusic])

  const toggleMusic = useCallback(
    (e) => {
      e?.stopPropagation()
      e?.preventDefault()
      if (musicPlaying) pauseMusic()
      else startMusic()
    },
    [musicPlaying, pauseMusic, startMusic]
  )

  const handleAudioPlay = useCallback(() => {
    pauseMusic()
  }, [pauseMusic])

  const slides = useMemo(() => {
    if (!presente) return []
    const common = {
      timeData,
      currentPhoto,
      onGameComplete: () => {},
      musicPlaying,
      onToggleMusic: toggleMusic,
      onAudioPlay: handleAudioPlay,
      pauseAudioSignal,
      musicProgress
    }
    const draft = buildSlides(presente, { ...common, activeSlideId: '' })
    const activeSlideId = draft[currentSlide]?.id ?? ''
    return buildSlides(presente, { ...common, activeSlideId })
  }, [presente, timeData, currentPhoto, currentSlide, musicPlaying, toggleMusic, handleAudioPlay, pauseAudioSignal, musicProgress])

  const current = slides[currentSlide]

  useEffect(() => {
    if (current?.id && current.id !== 'audio-especial') {
      setPauseAudioSignal((value) => value + 1)
    }
  }, [current?.id])

  const goToSlide = useCallback(
    (targetIndex) => {
      if (isAnimating || targetIndex < 0 || targetIndex >= slides.length) return
      setSlideAnimClass(targetIndex > currentSlide ? 'stories-slide-enter-next' : 'stories-slide-enter-prev')
      setIsAnimating(true)
      setCurrentSlide(targetIndex)
      setTimeout(() => {
        setIsAnimating(false)
        setSlideAnimClass('')
      }, 330)
    },
    [isAnimating, currentSlide, slides.length]
  )

  const isStoryBlockedTarget = useCallback((target) => {
    return target?.closest?.('[data-story-interactive],[data-story-controls],input,textarea,button,a,details,summary,audio')
  }, [])

  const handleStoryPointerDown = useCallback(
    (e) => {
      if (isAnimating || isStoryBlockedTarget(e.target)) {
        pointerStartRef.current = null
        return
      }
      pointerStartRef.current = { x: e.clientX, y: e.clientY, pointerId: e.pointerId }
    },
    [isAnimating, isStoryBlockedTarget]
  )

  const handleStoryPointerUp = useCallback(
    (e) => {
      const start = pointerStartRef.current
      pointerStartRef.current = null
      if (!start || start.pointerId !== e.pointerId || pointerLockRef.current) return
      if (isStoryBlockedTarget(e.target)) return
      if (Math.abs(e.clientX - start.x) > 18 || Math.abs(e.clientY - start.y) > 18) return

      pointerLockRef.current = true
      setTimeout(() => {
        pointerLockRef.current = false
      }, 360)

      const bounds = e.currentTarget.getBoundingClientRect()
      const isLeftSide = e.clientX - bounds.left < bounds.width / 2
      goToSlide(currentSlide + (isLeftSide ? -1 : 1))
    },
    [currentSlide, goToSlide, isStoryBlockedTarget]
  )

  const handleIframeLoad = useCallback(() => {
    musicReadyRef.current = true
    youtubeCommand(musicIframeRef.current, 'addEventListener', ['onStateChange'])
    if (musicWantedRef.current) playMusic()
  }, [playMusic])

  const handleOpenGift = () => {
    if (presente?.musica_video_id) {
      musicWantedRef.current = true
      if (musicIframeRef.current && musicReadyRef.current) {
        youtubeCommand(musicIframeRef.current, 'playVideo')
        setMusicPlaying(true)
        setMusicBlocked(false)
      } else {
        setMusicPlaying(false)
        setMusicBlocked(true)
      }
    }
    setShowIntro(false)
  }

  useEffect(() => {
    const onMessage = (event) => {
      if (!event.origin?.includes('youtube.com')) return
      let payload = event.data
      if (typeof payload === 'string') {
        try {
          payload = JSON.parse(payload)
        } catch {
          return
        }
      }
      const state = payload?.info
      if (payload?.event === 'onStateChange') {
        if (state === 1) {
          setMusicPlaying(true)
          setMusicBlocked(false)
        }
        if (state === 2 || state === 0) setMusicPlaying(false)
      }
      if (payload?.event === 'infoDelivery' && typeof state?.currentTime === 'number' && typeof state?.duration === 'number' && state.duration > 0) {
        setMusicProgress(Math.min(100, Math.max(0, (state.currentTime / state.duration) * 100)))
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  useEffect(() => {
    if (showIntro) return
    const onKey = (e) => {
      if (e.target?.closest?.('[data-story-interactive],[data-story-controls],input,textarea,button,a,details,summary,audio')) return
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        goToSlide(currentSlide + 1)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goToSlide(currentSlide - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showIntro, currentSlide, goToSlide])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <div className="mx-auto mb-3 h-12 w-12 animate-spin rounded-full border-4 border-rose-500 border-t-transparent" />
          <p className="text-sm text-white/50">Carregando...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black p-4">
        <div className="max-w-xs text-center">
          <h1 className="mb-2 font-display text-3xl text-white">Ops!</h1>
          <p className="mb-5 text-white/55">{error}</p>
          <Link to="/" className="btn-primary px-6 py-2.5 text-sm">Voltar</Link>
        </div>
      </div>
    )
  }

  const greeting = presente.nome_destinataria
    ? `${presente.nome_destinataria}, tenho um presente pra voce`
    : 'Tenho um presente pra voce'

  const hasMusic = !!presente.musica_video_id
  const musicSrc = hasMusic ? getYoutubeEmbedUrl(presente.musica_video_id) : null

  return (
    <div className={`relative min-h-[100dvh] overflow-hidden bg-[#030305] ${showIntro ? '' : 'flex items-center justify-center md:p-6'}`}>
      {!showIntro && (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(244,63,94,.22),transparent_30%),radial-gradient(circle_at_20%_80%,rgba(168,85,247,.18),transparent_35%)]" />
      )}
      {hasMusic && musicSrc && (
        <iframe
          ref={musicIframeRef}
          title="musica"
          src={musicSrc}
          allow="autoplay; encrypted-media"
          className="fixed h-px w-px opacity-0 pointer-events-none"
          style={{ left: -9999, top: 0 }}
          onLoad={handleIframeLoad}
        />
      )}

      {showIntro ? (
        <CrocIntro greeting={greeting} showButton={showButton} onOpen={handleOpenGift} />
      ) : (
      <main
        className="relative h-[100dvh] w-full max-w-[430px] overflow-hidden bg-black shadow-[0_0_120px_rgba(244,63,94,.28)] md:h-[92dvh] md:max-h-[880px] md:rounded-[2.25rem] md:border md:border-white/10"
        style={{ touchAction: 'manipulation' }}
        onPointerDownCapture={handleStoryPointerDown}
        onPointerUpCapture={handleStoryPointerUp}
        onPointerCancelCapture={() => {
          pointerStartRef.current = null
        }}
      >
        <div className="absolute left-0 right-0 top-0 z-50 flex gap-1 px-3 pb-2 pt-3 pointer-events-none">
          {slides.map((slide, i) => (
            <div key={slide.id} className="h-1 flex-1 overflow-hidden rounded-full bg-white/20">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  i <= currentSlide ? 'w-full' : 'w-0'
                } ${i === currentSlide ? 'bg-white' : 'bg-white/60'}`}
              />
            </div>
          ))}
        </div>

        {hasMusic && (
          <div
            className="absolute right-4 top-9 z-50 flex items-center gap-2 pointer-events-auto"
            data-story-controls
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {musicBlocked && (
              <button
                type="button"
                onClick={toggleMusic}
                className="min-h-10 rounded-full bg-rose-500 px-3 text-xs font-black text-white shadow-lg"
              >
                Tocar música
              </button>
            )}
            <button
              type="button"
              onClick={toggleMusic}
              onTouchStart={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/45 text-sm font-black text-white shadow-xl backdrop-blur active:scale-95"
              aria-label={musicPlaying ? 'Pausar musica' : 'Tocar musica'}
            >
              {musicPlaying ? 'II' : 'PLAY'}
            </button>
          </div>
        )}

        <StoryTapZones
          disabled={isAnimating}
          onPrev={() => goToSlide(currentSlide - 1)}
          onNext={() => goToSlide(currentSlide + 1)}
        />

        <div className="absolute inset-0 z-20 pointer-events-none">
          <div key={`${current?.id}-${currentSlide}`} className={`h-full ${slideAnimClass}`}>
            {current?.render()}
          </div>
        </div>

        {currentSlide > 0 && (
          <div className="pointer-events-none absolute left-3 top-1/2 z-[6] -translate-y-1/2 opacity-35">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-lg text-white">&lt;</div>
          </div>
        )}
        {currentSlide < slides.length - 1 && (
          <div className="pointer-events-none absolute right-3 top-1/2 z-[6] -translate-y-1/2 opacity-35">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-lg text-white">&gt;</div>
          </div>
        )}
      </main>
      )}
    </div>
  )
}
