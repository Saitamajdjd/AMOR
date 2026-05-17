import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPresenteBySlug } from '../lib/supabase'

function calculateTimeTogether(dataInicio, horaInicio) {
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

function StarMap({ data }) {
  const stars = Array.from({ length: 50 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1
  }))

  return (
    <div className="relative bg-gradient-to-b from-indigo-950 via-purple-900 to-black rounded-2xl p-4 h-40 overflow-hidden">
      <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 200 100">
        <path d="M20 30 L30 40 L40 30 L30 20 Z" fill="white" />
        <path d="M80 20 L85 30 L95 30 L85 35 L90 45 L80 40 L70 45 L75 35 L65 30 L75 30 Z" fill="white" />
        <path d="M150 50 L155 55 L165 55 L155 60 Z" fill="white" />
      </svg>
      {stars.map((star, i) => (
        <div
          key={i}
          className="absolute bg-white rounded-full animate-pulse"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: 0.4 + Math.random() * 0.6,
            animationDelay: `${Math.random() * 2}s`
          }}
        />
      ))}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center z-10 px-3">
          <p className="text-white/90 font-body text-sm italic leading-snug">{data.texto}</p>
          {data.dataCidade && (
            <p className="text-rose-400 font-accent text-base mt-1">{data.dataCidade}</p>
          )}
        </div>
      </div>
    </div>
  )
}

function WordGame({ data, onComplete }) {
  const [attempts, setAttempts] = useState([])
  const [currentGuess, setCurrentGuess] = useState('')
  const [won, setWon] = useState(false)
  const [showKeyboard, setShowKeyboard] = useState(true)

  const word = data.palavra.toUpperCase()
  const maxAttempts = 6

  const handleKeyPress = (key) => {
    if (key === 'ENTER') {
      if (currentGuess.length === word.length) {
        const newAttempts = [...attempts, currentGuess.toUpperCase()]
        setAttempts(newAttempts)
        setCurrentGuess('')
        if (currentGuess.toUpperCase() === word) {
          setWon(true)
          setShowKeyboard(false)
          onComplete?.()
        }
      }
    } else if (key === '⌫') {
      setCurrentGuess(currentGuess.slice(0, -1))
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < word.length) {
      setCurrentGuess(currentGuess + key)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!won && showKeyboard) {
        if (e.key === 'Enter') handleKeyPress('ENTER')
        else if (e.key === 'Backspace') handleKeyPress('⌫')
        else if (/^[a-zA-Z]$/.test(e.key)) handleKeyPress(e.key.toUpperCase())
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentGuess, won, showKeyboard])

  const getLetterStatus = (letter, index) => {
    if (word[index] === letter) return 'correct'
    if (word.includes(letter)) return 'present'
    return 'absent'
  }

  if (won) {
    return (
      <div className="bg-gradient-to-br from-rose-900/40 to-purple-900/40 rounded-2xl p-4 text-center border border-rose-500/30">
        <div className="text-4xl mb-2">💕</div>
        <h3 className="font-display text-xl text-white mb-1">Parabéns!</h3>
        <p className="text-rose-400 font-accent text-lg">{data.mensagemFinal}</p>
      </div>
    )
  }

  const row1 = 'QWERTYUIOP'.split('')
  const row2 = 'ASDFGHJKL'.split('')
  const row3 = ['ENTER', ...'ZXCVBNM'.split(''), '⌫']

  return (
    <div className="bg-dark-card/60 rounded-2xl p-3">
      <p className="text-gray-300 text-center text-sm mb-3 font-medium">{data.pergunta}</p>

      <div className="flex justify-center gap-1 mb-3">
        {Array(word.length).fill(0).map((_, i) => (
          <div
            key={i}
            className={`w-8 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${
              currentGuess[i]
                ? 'bg-gradient-to-br from-rose-500 to-pink-500 text-white'
                : 'bg-dark-border/60 text-gray-500'
            }`}
          >
            {currentGuess[i] || ''}
          </div>
        ))}
      </div>

      <div className="space-y-1 mb-3">
        {[...Array(maxAttempts - attempts.length)].map((_, i) => (
          <div key={i} className="flex justify-center gap-1">
            {Array(word.length).fill(0).map((_, j) => (
              <div key={j} className="w-8 h-10 bg-dark-border/40 rounded-lg" />
            ))}
          </div>
        ))}
      </div>

      {attempts.map((attempt, i) => (
        <div key={i} className="flex justify-center gap-1 mb-1">
          {attempt.split('').map((letter, j) => {
            const status = getLetterStatus(letter, j)
            return (
              <div
                key={j}
                className={`w-8 h-10 rounded-lg flex items-center justify-center text-base font-bold ${
                  status === 'correct' ? 'bg-green-500 text-white'
                  : status === 'present' ? 'bg-yellow-500 text-white'
                  : 'bg-gray-600 text-white'
                }`}
              >
                {letter}
              </div>
            )
          })}
        </div>
      ))}

      {showKeyboard && (
        <div className="mt-2">
          <div className="flex justify-center gap-1 mb-1">
            {row1.map(key => (
              <button key={key} onClick={() => handleKeyPress(key)} className="w-7 h-9 bg-dark-border/70 hover:bg-rose-500/50 rounded-lg text-white text-xs font-medium">
                {key}
              </button>
            ))}
          </div>
          <div className="flex justify-center gap-1 mb-1">
            {row2.map(key => (
              <button key={key} onClick={() => handleKeyPress(key)} className="w-7 h-9 bg-dark-border/70 hover:bg-rose-500/50 rounded-lg text-white text-xs font-medium">
                {key}
              </button>
            ))}
          </div>
          <div className="flex justify-center gap-1">
            {row3.map(key => (
              <button key={key} onClick={() => handleKeyPress(key)} className={`${key === 'ENTER' ? 'w-14' : 'w-7'} h-9 bg-dark-border/70 hover:bg-rose-500/50 rounded-lg text-white text-xs font-medium`}>
                {key}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Roulette({ data }) {
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState(null)
  const [rotation, setRotation] = useState(0)

  const colors = data.tema === 'rosa'
    ? ['#F472B6', '#FB7185', '#F43F5E', '#E11D48', '#BE123C', '#9F1239']
    : ['#60A5FA', '#3B82F6', '#2563EB', '#1D4ED8', '#1E40AF', '#1E3A8A']

  const spin = () => {
    if (spinning || data.opcoes.length < 2) return
    setSpinning(true)
    setResult(null)
    const spins = 5 + Math.random() * 3
    const segmentAngle = 360 / data.opcoes.length
    const targetIndex = Math.floor(Math.random() * data.opcoes.length)
    const targetRotation = rotation + (spins * 360) + (targetIndex * segmentAngle) + (Math.random() * segmentAngle)
    setRotation(targetRotation)
    setTimeout(() => {
      setSpinning(false)
      setResult(data.opcoes[targetIndex])
    }, 4000)
  }

  return (
    <div className="bg-dark-card/60 rounded-2xl p-4">
      <p className="text-gray-300 text-center text-sm mb-3 font-medium">{data.pergunta}</p>

      <div className="relative w-32 h-32 mx-auto mb-3">
        <div
          className="absolute inset-0 rounded-full transition-transform duration-[4000ms] ease-out"
          style={{
            transform: `rotate(${rotation}deg)`,
            background: `conic-gradient(${data.opcoes.map((_, i) =>
              `${colors[i % colors.length]} ${(i * 360) / data.opcoes.length}deg ${((i + 1) * 360) / data.opcoes.length}deg`
            ).join(', ')})`
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 bg-white rounded-full z-10" />
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-0 h-0 border-l-5 border-r-5 border-b-[10px] border-l-transparent border-r-transparent border-b-white z-20" />
      </div>

      <button onClick={spin} disabled={spinning} className="w-full py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl font-semibold text-white text-sm shadow-lg transition-all active:scale-95 disabled:opacity-50">
        {spinning ? 'Girando...' : 'Girar'}
      </button>

      {result && (
        <div className="mt-3 text-center">
          <p className="text-white text-sm font-medium"><span className="text-rose-400">Resultado:</span> {result}</p>
        </div>
      )}
    </div>
  )
}

function Timeline({ data }) {
  return (
    <div className="relative pl-8">
      <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-rose-500 via-pink-500 to-purple-500" />
      {data.momentos.map((momento, index) => (
        <div key={index} className="relative pb-4">
          <div className="absolute left-[-20px] w-3 h-3 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full border-2 border-black z-10" />
          <div className="bg-dark-card/40 rounded-lg p-2.5 border border-rose-500/10">
            <p className="text-rose-400 text-xs font-medium">{momento.data}</p>
            <p className="text-white text-sm font-medium mt-0.5">{momento.descricao}</p>
            {momento.legenda && <p className="text-gray-500 text-xs mt-0.5 italic">{momento.legenda}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}

function TransitionText({ children }) {
  return (
    <div className="text-center py-3 px-4">
      <p className="text-gray-400 text-sm italic">{children}</p>
    </div>
  )
}

export default function Gift() {
  const { slug } = useParams()
  const [presente, setPresente] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPhoto, setCurrentPhoto] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [showIntro, setShowIntro] = useState(true)
  const [showButton, setShowButton] = useState(false)
  const [timeData, setTimeData] = useState(null)

  useEffect(() => {
    async function fetchPresente() {
      try {
        const data = await getPresenteBySlug(slug)
        if (!data) setError('Presente não encontrado')
        else {
          setPresente(data)
          setTimeData(calculateTimeTogether(data.data_inicio, data.hora_inicio))
        }
      } catch (err) {
        setError('Erro ao carregar presente')
      } finally {
        setLoading(false)
      }
    }
    fetchPresente()
  }, [slug])

  useEffect(() => {
    if (!loading && presente) {
      const timer = setTimeout(() => setShowButton(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [loading, presente])

  useEffect(() => {
    if (presente?.fotos?.length > 0) {
      const interval = setInterval(() => setCurrentPhoto((prev) => (prev + 1) % presente.fotos.length), 4000)
      return () => clearInterval(interval)
    }
  }, [presente?.fotos])

  useEffect(() => {
    if (!showIntro && timeData) {
      const interval = setInterval(() => setTimeData(calculateTimeTogether(presente.data_inicio, presente.hora_inicio)), 60000)
      return () => clearInterval(interval)
    }
  }, [showIntro, presente?.data_inicio, presente?.hora_inicio])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Carregando...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center max-w-xs">
          <div className="text-5xl mb-3">😢</div>
          <h1 className="font-display text-xl text-white mb-2">Ops!</h1>
          <p className="text-gray-400 mb-5">{error}</p>
          <Link to="/" className="btn-primary text-sm py-2.5 px-6">Voltar</Link>
        </div>
      </div>
    )
  }

  const handleOpenGift = () => {
    setShowIntro(false)
    if (presente.musica_video_id) setIsPlaying(true)
  }

  const recipientName = presente.nome_destinataria || ''

  if (showIntro) {
    const greeting = recipientName ? `${recipientName}, tenho um presente pra você` : 'Tenho um presente pra você'
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-950 via-rose-950 to-black flex flex-col items-center justify-center px-4">
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div key={i} className="absolute bg-white rounded-full" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              opacity: Math.random() * 0.4 + 0.1
            }} />
          ))}
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <svg viewBox="0 0 200 200" className="w-28 h-28 drop-shadow-2xl animate-float">
            <defs>
              <linearGradient id="crocGradIntro" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22C55E" />
                <stop offset="100%" stopColor="#16A34A" />
              </linearGradient>
              <linearGradient id="bellyGradIntro" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#86EFAC" />
                <stop offset="100%" stopColor="#4ADE80" />
              </linearGradient>
            </defs>
            <ellipse cx="100" cy="115" rx="70" ry="60" fill="url(#crocGradIntro)" />
            <ellipse cx="100" cy="145" rx="50" ry="35" fill="url(#bellyGradIntro)" />
            <ellipse cx="65" cy="80" rx="25" ry="28" fill="#22C55E" />
            <ellipse cx="135" cy="80" rx="25" ry="28" fill="#22C55E" />
            <ellipse cx="65" cy="80" rx="15" ry="18" fill="#1A1A1A" />
            <ellipse cx="135" cy="80" rx="15" ry="18" fill="#1A1A1A" />
            <circle cx="60" cy="77" r="4" fill="white" />
            <circle cx="130" cy="77" r="4" fill="white" />
            <ellipse cx="100" cy="100" rx="12" ry="8" fill="#166534" />
            <path d="M 100 100 Q 95 105 100 110 Q 105 105 100 100" fill="#166534" />
            <ellipse cx="100" cy="113" rx="20" ry="15" fill="#1A1A1A" />
            <path d="M 65 113 Q 80 123 100 123 Q 120 123 135 113" fill="none" stroke="#166534" strokeWidth="2" />
            <ellipse cx="100" cy="123" rx="8" ry="4" fill="#F43F5E" />
            <path d="M 50 65 Q 45 50 55 40 Q 65 45 60 60" fill="#22C55E" stroke="#166534" strokeWidth="1" />
            <ellipse cx="52" cy="43" rx="6" ry="8" fill="#22C55E" />
            <path d="M 150 65 Q 155 50 145 40 Q 135 45 140 60" fill="#22C55E" stroke="#166534" strokeWidth="1" />
            <ellipse cx="148" cy="43" rx="6" ry="8" fill="#22C55E" />
            <path d="M 70 40 Q 100 30 130 40" fill="none" stroke="#166534" strokeWidth="3" strokeLinecap="round" />
            <circle cx="75" cy="37" r="2" fill="#166534" />
            <circle cx="100" cy="33" r="2" fill="#166534" />
            <circle cx="125" cy="37" r="2" fill="#166534" />
            <path d="M 60 130 L 55 150 L 65 150 Z" fill="#22C55E" />
            <path d="M 140 130 L 145 150 L 135 150 Z" fill="#22C55E" />
            <ellipse cx="80" cy="163" rx="12" ry="4" fill="#166534" />
            <ellipse cx="120" cy="163" rx="12" ry="4" fill="#166534" />
          </svg>

          <div className="mt-3 mb-5">
            <div className="bg-white rounded-xl p-3 shadow-2xl">
              <p className="text-gray-800 font-display text-base text-center">{greeting} ❤️</p>
            </div>
          </div>

          {showButton && (
            <button onClick={handleOpenGift} className="px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full font-semibold text-white text-base shadow-lg hover:shadow-rose-500/40 transition-all active:scale-95 animate-slide-up">
              Abrir presente 🎁
            </button>
          )}
        </div>
      </div>
    )
  }

  const hasPhotos = presente.fotos?.length > 0

  return (
    <div className="min-h-screen bg-black flex justify-center">
      <div className="w-full max-w-[400px] bg-gradient-to-b from-black via-gray-950 to-black overflow-y-auto">
        <div className="p-4 space-y-4">
          <div className="text-center pt-2">
            <h1 className="font-display text-2xl text-white glow-text leading-tight">{presente.titulo_presente}</h1>
            <p className="text-rose-400 font-accent text-xl mt-1">Para {presente.nome_destinataria}</p>
          </div>

          {hasPhotos && (
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-rose-500/20">
              {presente.fotos.map((foto, i) => (
                <img key={i} src={foto} alt="" className={`w-full aspect-[4/3] object-cover transition-opacity duration-700 ${i === currentPhoto ? 'opacity-100' : 'opacity-0 absolute inset-0'}`} />
              ))}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                {presente.fotos.map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === currentPhoto ? 'bg-rose-500' : 'bg-white/40'}`} />
                ))}
              </div>
            </div>
          )}

          {timeData && (
            <div className="bg-gradient-to-r from-rose-900/50 to-purple-900/50 rounded-2xl p-4 border border-rose-500/20">
              <div className="text-center">
                <p className="text-2xl">❤️</p>
                <p className="text-white text-xl font-display">
                  {timeData.years > 0 && `${timeData.years}a `}
                  {timeData.months > 0 && `${timeData.months}m `}
                  {timeData.days}d
                </p>
                <p className="text-gray-400 text-xs">juntos • {timeData.hours}h {timeData.minutes}m</p>
              </div>
            </div>
          )}

          <TransitionText>Esse foi só o começo ❤️</TransitionText>

          {presente.musica_video_id && (
            <>
              <div className="bg-gradient-to-br from-rose-900/30 to-purple-900/30 rounded-2xl p-0.5 border border-rose-500/20">
                <div className="bg-black/50 rounded-xl p-3">
                  <p className="text-gray-400 text-xs mb-2">🎵 Música do momento</p>
                  <div className="relative">
                    {!isPlaying ? (
                      <>
                        <img src={`https://img.youtube.com/vi/${presente.musica_video_id}/mqdefault.jpg`} alt="Music" className="w-full rounded-lg" />
                        <button onClick={() => setIsPlaying(true)} className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
                          <div className="w-12 h-12 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                          </div>
                        </button>
                      </>
                    ) : (
                      <iframe className="w-full aspect-video rounded-lg" src={`https://www.youtube.com/embed/${presente.musica_video_id}?autoplay=1&rel=0`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                    )}
                  </div>
                  {(presente.musica_titulo || presente.musica_artista) && (
                    <p className="text-white text-center text-sm mt-2 font-medium">{presente.musica_titulo}{presente.musica_artista && <span className="text-gray-400"> — {presente.musica_artista}</span>}</p>
                  )}
                </div>
              </div>
              <TransitionText>Essa música combina com a gente de um jeito que nem dá pra explicar...</TransitionText>
            </>
          )}

          {hasPhotos && (
            <>
              <div className="bg-gradient-to-br from-rose-900/30 to-purple-900/30 rounded-2xl p-4 border border-rose-500/20">
                <div className="flex justify-center mb-3">
                  <div className="flex -space-x-3">
                    {presente.fotos.slice(0, Math.min(3, presente.fotos.length)).map((foto, i) => (
                      <div key={i} className="w-14 h-14 rounded-full overflow-hidden border-3 border-black">
                        <img src={foto} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-white text-base font-medium">{presente.nome_remetente} & {presente.nome_destinataria}</p>
                  <p className="text-gray-400 text-xs mt-0.5">Juntos desde {presente.data_inicio && new Date(presente.data_inicio).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              <TransitionText>Algumas coisas merecem ser lembradas pra sempre</TransitionText>
            </>
          )}

          {presente.mensagem && (
            <>
              <div className="bg-gradient-to-br from-rose-900/50 via-red-900/30 to-purple-900/50 rounded-2xl p-4 border border-rose-500/30">
                <div className="text-center mb-3">
                  <span className="text-2xl">💌</span>
                  <h2 className="font-display text-lg text-white mt-1">Mensagem Especial</h2>
                </div>
                <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                  <p className="text-white text-base leading-relaxed italic text-center font-body">"{presente.mensagem}"</p>
                </div>
                <p className="text-rose-400 text-center mt-2 font-accent text-lg">— {presente.nome_remetente}</p>
              </div>
              <TransitionText>Agora segura essa lembrança...</TransitionText>
            </>
          )}

          {presente.linha_tempo?.momentos?.length > 0 && (
            <>
              <div className="bg-black/40 rounded-2xl p-4 border border-purple-500/20">
                <div className="text-center mb-3">
                  <span className="text-2xl">📅</span>
                  <h2 className="font-display text-lg text-white mt-1">{presente.linha_tempo.titulo}</h2>
                </div>
                <Timeline data={presente.linha_tempo} />
              </div>
              <TransitionText>Cada momento dessa história conta...</TransitionText>
            </>
          )}

          {presente.mapa_estrelas && (
            <>
              <div className="text-center mb-2">
                <span className="text-2xl">⭐</span>
                <h2 className="font-display text-lg text-white mt-1">Mapa das Estrelas</h2>
              </div>
              <StarMap data={presente.mapa_estrelas} />
              <TransitionText>Nosso amor brilha até no céu</TransitionText>
            </>
          )}

          {presente.jogo_palavra?.palavra && (
            <>
              <div className="text-center mb-2">
                <span className="text-2xl">🔤</span>
                <h2 className="font-display text-lg text-white mt-1">Jogo da Palavra</h2>
              </div>
              <WordGame data={presente.jogo_palavra} onComplete={() => setGameCompleted(true)} />
              <TransitionText>Se prepara, porque ainda tem mais...</TransitionText>
            </>
          )}

          {presente.roleta?.opcoes?.length > 0 && (
            <>
              <div className="text-center mb-2">
                <span className="text-2xl">🎡</span>
                <h2 className="font-display text-lg text-white mt-1">Roleta do Amor</h2>
              </div>
              <Roulette data={presente.roleta} />
              <TransitionText>A sorte favorece quem ama ❤️</TransitionText>
            </>
          )}

          <div className="text-center pt-4 pb-6">
            <div className="text-4xl mb-3">💕</div>
            <h2 className="font-display text-2xl text-white mb-1 glow-text">EU TE AMO</h2>
            <p className="text-gray-400 text-sm mb-5">Um presente feito com todo meu amor</p>
            <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Link copiado!'); }} className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl font-semibold text-white shadow-lg hover:shadow-rose-500/30 transition-all active:scale-95">
              📤 Compartilhar presente
            </button>
            <p className="text-gray-600 text-xs mt-4">Feito com ❤️ por Amor Presente</p>
          </div>
        </div>
      </div>
    </div>
  )
}