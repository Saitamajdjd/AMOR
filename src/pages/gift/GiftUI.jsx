import { useState, useMemo, useRef, useEffect } from 'react'
import WordGame from './WordGame'

export { WordGame }

const stopBubble = (e) => {
  e.stopPropagation()
}

const tones = {
  cover: 'from-black via-rose-950 to-purple-950',
  spotify: 'from-black via-[#102217] to-black',
  memory: 'from-purple-950 via-black to-rose-950',
  rose: 'from-rose-950 via-red-950 to-black',
  purple: 'from-purple-950 via-fuchsia-950 to-black',
  darkrose: 'from-black via-rose-950 to-zinc-950',
  thanks: 'from-violet-950 via-rose-950 to-black',
  stars: 'from-black via-indigo-950 to-black',
  night: 'from-slate-950 via-indigo-950 to-black',
  game: 'from-emerald-950 via-black to-rose-950',
  roulette: 'from-rose-950 via-purple-950 to-black',
  audio: 'from-black via-rose-950 to-purple-950',
  letter: 'from-zinc-950 via-amber-950 to-rose-950',
  final: 'from-black via-rose-950 to-purple-950'
}

function AmbientLayer() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-16 top-16 h-44 w-44 rounded-full bg-rose-500/25 blur-3xl" />
      <div className="absolute -right-20 bottom-28 h-56 w-56 rounded-full bg-purple-500/25 blur-3xl" />
      <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/10 blur-3xl" />
      {Array.from({ length: 22 }).map((_, i) => (
        <span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-white/60 animate-pulse"
          style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%`, animationDelay: `${(i % 7) * 0.3}s`, opacity: i % 3 === 0 ? 0.55 : 0.25 }}
        />
      ))}
    </div>
  )
}

export function StarMap({ data }) {
  const stars = useMemo(
    () => Array.from({ length: 70 }, (_, i) => ({ x: (i * 31) % 100, y: (i * 47) % 100, size: (i % 4) + 1, delay: (i % 6) * 0.25 })),
    []
  )

  return (
    <div className="relative min-h-[58vh] overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-indigo-950 via-purple-950 to-black p-5 shadow-2xl">
      {stars.map((star, i) => (
        <span
          key={i}
          className="absolute block rounded-full bg-white animate-pulse"
          style={{ left: `${star.x}%`, top: `${star.y}%`, width: star.size, height: star.size, opacity: 0.35 + (i % 4) * 0.12, animationDelay: `${star.delay}s` }}
        />
      ))}
      <svg className="absolute inset-0 h-full w-full opacity-40" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline points="18,24 34,38 48,30 63,52 78,44" fill="none" stroke="rgba(255,255,255,.45)" strokeWidth=".35" />
        <polyline points="20,70 38,62 54,76 72,66" fill="none" stroke="rgba(244,114,182,.45)" strokeWidth=".35" />
      </svg>
      <div className="absolute inset-x-5 bottom-6 rounded-[1.5rem] border border-white/10 bg-black/40 p-5 text-center backdrop-blur">
        <p className="font-display text-3xl leading-tight text-white">{data.texto}</p>
        {data.dataCidade && <p className="mt-3 text-sm font-black uppercase tracking-[0.18em] text-rose-300">{data.dataCidade}</p>}
      </div>
    </div>
  )
}

export function Timeline({ data }) {
  return (
    <div className="space-y-4 pb-4">
      {data.momentos.map((momento, index) => (
        <article key={index} className={`relative rounded-[1.75rem] border border-white/10 bg-white/[0.07] p-4 shadow-2xl backdrop-blur ${index % 2 ? 'rotate-1' : '-rotate-1'}`}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="rounded-full bg-rose-500 px-3 py-1 text-xs font-black text-white">{momento.data || `Momento ${index + 1}`}</span>
            <span className="text-xs font-black text-white/35">#{String(index + 1).padStart(2, '0')}</span>
          </div>
          <p className="text-xl font-black leading-tight text-white">{momento.descricao}</p>
          {momento.legenda && <p className="mt-2 text-sm font-medium italic text-white/55">{momento.legenda}</p>}
        </article>
      ))}
    </div>
  )
}

export function Roulette({ data }) {
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState(null)
  const [rotation, setRotation] = useState(0)
  const colors = data.tema === 'rosa'
    ? ['#fb7185', '#f472b6', '#e11d48', '#a855f7', '#be123c', '#7c3aed']
    : ['#60a5fa', '#22c55e', '#2563eb', '#14b8a6', '#1d4ed8', '#0f766e']

  const options = data.opcoes.filter(Boolean)

  const spin = (e) => {
    stopBubble(e)
    if (spinning || options.length < 2) return
    setSpinning(true)
    setResult(null)
    const segmentAngle = 360 / options.length
    const targetIndex = Math.floor(Math.random() * options.length)
    const targetRotation = rotation + (5 + Math.random() * 3) * 360 + targetIndex * segmentAngle
    setRotation(targetRotation)
    setTimeout(() => {
      setSpinning(false)
      setResult(options[targetIndex])
    }, 3900)
  }

  return (
    <div
      className="pointer-events-auto rounded-[2rem] border border-white/10 bg-black/35 p-5 shadow-2xl backdrop-blur"
    >
      <p className="mb-5 text-center text-lg font-bold leading-snug text-white">{data.pergunta || 'O que o destino escolhe agora?'}</p>
      <div className="relative mx-auto mb-6 h-60 w-60">
        <div className="absolute -inset-4 rounded-full bg-rose-500/20 blur-2xl" />
        <div
          className="absolute inset-0 rounded-full border-[10px] border-white/10 shadow-[0_25px_80px_rgba(0,0,0,.5)] transition-transform duration-[3900ms] ease-out"
          style={{
            transform: `rotate(${rotation}deg)`,
            background: `conic-gradient(${options.map((_, i) => `${colors[i % colors.length]} ${(i * 360) / options.length}deg ${((i + 1) * 360) / options.length}deg`).join(', ')})`
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-black text-2xl font-black text-white shadow-xl">LOVE</div>
        </div>
        <div className="absolute -top-2 left-1/2 z-20 h-0 w-0 -translate-x-1/2 border-l-[14px] border-r-[14px] border-t-[28px] border-l-transparent border-r-transparent border-t-white" />
      </div>
      <button
        type="button"
        onClick={spin}
        onTouchStart={stopBubble}
        onPointerDown={stopBubble}
        disabled={spinning}
        data-story-controls
        className="h-14 w-full rounded-full bg-gradient-to-r from-rose-500 to-fuchsia-500 text-base font-black text-white shadow-[0_16px_50px_rgba(244,63,94,.35)] disabled:opacity-60 active:scale-95"
      >
        {spinning ? 'Girando...' : 'Girar roleta'}
      </button>
      {result && (
        <div className="mt-5 rounded-3xl bg-white p-4 text-center text-black animate-slide-up">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-600">Resultado</p>
          <p className="mt-1 text-xl font-black">{result}</p>
        </div>
      )}
    </div>
  )
}

export function AudioPlayer({ url, titulo, mensagem, onPlay, pauseSignal, isActive }) {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    audioRef.current?.pause()
  }, [pauseSignal])

  useEffect(() => {
    if (!isActive) audioRef.current?.pause()
  }, [isActive])

  const playAudio = async () => {
    const audio = audioRef.current
    if (!audio) return
    onPlay?.()
    try {
      await audio.play()
      setPlaying(true)
    } catch {
      setPlaying(false)
    }
  }

  const toggle = (e) => {
    stopBubble(e)
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      playAudio()
    } else {
      audio.pause()
      setPlaying(false)
    }
  }

  const replay = (e) => {
    stopBubble(e)
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = 0
    playAudio()
  }

  return (
    <div
      className="pointer-events-auto flex h-full flex-col justify-center gap-5"
    >
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-28 w-28 items-center justify-center rounded-full bg-emerald-400/15">
          <svg viewBox="0 0 240 220" className="h-24 w-24 drop-shadow-2xl" aria-hidden="true">
            <ellipse cx="120" cy="104" rx="76" ry="58" fill="#22c55e" />
            <ellipse cx="120" cy="130" rx="50" ry="29" fill="#86efac" />
            <ellipse cx="83" cy="70" rx="23" ry="27" fill="#16a34a" />
            <ellipse cx="157" cy="70" rx="23" ry="27" fill="#16a34a" />
            <ellipse cx="83" cy="70" rx="11" ry="15" fill="#111827" />
            <ellipse cx="157" cy="70" rx="11" ry="15" fill="#111827" />
            <circle cx="79" cy="65" r="4" fill="white" />
            <circle cx="153" cy="65" r="4" fill="white" />
            <path d="M84 116 Q120 140 156 116" fill="none" stroke="#14532d" strokeWidth="5" strokeLinecap="round" />
          </svg>
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-rose-200/70">Tenho algo pra voce ouvir</p>
        <h2 className="mt-2 font-display text-4xl leading-none text-white">Audio especial</h2>
      </div>
      <div className="rounded-[2rem] border border-white/10 bg-black/50 p-6 shadow-[0_30px_90px_rgba(0,0,0,.55)] backdrop-blur">
        <div className="mx-auto mb-5 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-purple-600 shadow-[0_20px_70px_rgba(244,63,94,.35)]">
          <span className="text-5xl text-white">♪</span>
        </div>
        <p className="text-center text-2xl font-black leading-tight text-white">{titulo || 'Escuta isso com carinho'}</p>
        {mensagem && <p className="mt-3 text-center text-sm font-medium leading-relaxed text-white/60">{mensagem}</p>}
        <div className="mt-6 flex h-14 items-end justify-center gap-1.5">
          {[28, 42, 52, 34, 48, 24, 44, 36, 50].map((height, index) => (
            <span
              key={index}
              className={`w-2 rounded-full bg-gradient-to-t from-rose-400 to-emerald-300 ${playing ? 'animate-pulse' : ''}`}
              style={{ height, animationDelay: `${index * 0.08}s` }}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={toggle}
          onTouchStart={stopBubble}
          onPointerDown={stopBubble}
          data-story-controls
          className="mt-6 h-16 w-full rounded-full bg-white text-lg font-black text-black shadow-2xl active:scale-95"
        >
          {playing ? 'Pausar audio' : 'Tocar audio'}
        </button>
        <button
          type="button"
          onClick={replay}
          onTouchStart={stopBubble}
          onPointerDown={stopBubble}
          data-story-controls
          className="mt-3 h-12 w-full rounded-full border border-white/15 bg-white/10 text-sm font-black text-white backdrop-blur active:scale-95"
        >
          Ouvir novamente
        </button>
        <audio ref={audioRef} src={url} onEnded={() => setPlaying(false)} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
      </div>
    </div>
  )
}

export function CrocIntro({ greeting, showButton, onOpen }) {
  return (
    <div className="min-h-[100dvh] overflow-hidden bg-[radial-gradient(circle_at_30%_20%,rgba(244,63,94,.36),transparent_30%),radial-gradient(circle_at_80%_90%,rgba(168,85,247,.32),transparent_34%),#050505] px-5 text-white">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col items-center justify-center gap-6">
        <div className="relative animate-float">
          <div className="absolute -inset-10 rounded-full bg-emerald-400/15 blur-3xl" />
          <svg viewBox="0 0 240 250" className="relative h-52 w-52 drop-shadow-2xl" aria-hidden="true">
            <defs>
              <linearGradient id="crocGradIntro" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4ade80" />
                <stop offset="100%" stopColor="#16a34a" />
              </linearGradient>
            </defs>
            <ellipse cx="120" cy="120" rx="76" ry="62" fill="url(#crocGradIntro)" />
            <ellipse cx="120" cy="151" rx="52" ry="34" fill="#86efac" />
            <ellipse cx="78" cy="82" rx="27" ry="30" fill="#22c55e" />
            <ellipse cx="162" cy="82" rx="27" ry="30" fill="#22c55e" />
            <ellipse cx="78" cy="83" rx="14" ry="18" fill="#111827" />
            <ellipse cx="162" cy="83" rx="14" ry="18" fill="#111827" />
            <circle cx="73" cy="78" r="4" fill="white" />
            <circle cx="157" cy="78" r="4" fill="white" />
            <ellipse cx="120" cy="105" rx="14" ry="9" fill="#166534" />
            <path d="M82 122 Q120 148 158 122" fill="none" stroke="#14532d" strokeWidth="5" strokeLinecap="round" />
            <rect x="62" y="166" width="116" height="58" rx="10" fill="#fff7ed" stroke="#fb7185" strokeWidth="4" />
            <path d="M62 166 L120 198 L178 166" fill="none" stroke="#fb7185" strokeWidth="4" />
            <text x="120" y="217" textAnchor="middle" fill="#e11d48" fontSize="25" fontWeight="900">LOVE</text>
          </svg>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 text-center shadow-2xl backdrop-blur animate-slide-up">
          <p className="font-display text-4xl leading-none text-white">{greeting}</p>
          <p className="mt-3 text-sm font-semibold text-white/55">Uma experiencia feita para abrir devagar.</p>
        </div>
        <div className="h-16">
          {showButton && (
            <button type="button" onClick={onOpen} className="h-14 rounded-full bg-gradient-to-r from-rose-500 to-fuchsia-500 px-9 text-base font-black text-white shadow-[0_20px_70px_rgba(244,63,94,.35)] transition-transform active:scale-95 animate-slide-up">
              Abrir presente
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function SlideShell({ children, scroll = false, tone = 'cover' }) {
  return (
    <section
      className={`relative h-full w-full overflow-hidden bg-gradient-to-br ${tones[tone] || tones.cover}`}
      data-story-scroll={scroll ? '' : undefined}
    >
      <AmbientLayer />
      <div
        className={`relative z-10 h-full w-full px-5 pb-5 pt-10 ${scroll ? 'overflow-y-auto overscroll-contain pointer-events-auto' : 'pointer-events-none'}`}
      >
        <div className={`mx-auto h-full w-full max-w-sm ${scroll ? 'min-h-full pb-8' : ''}`}>{children}</div>
      </div>
    </section>
  )
}
