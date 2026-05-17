import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

const particles = Array.from({ length: 25 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  delay: Math.random() * 5,
  duration: Math.random() * 4 + 3,
  type: Math.random() > 0.5 ? 'star' : 'heart'
}))

const featureCards = [
  { icon: '📸', title: 'Fotos especiais', desc: 'Adicione as melhores memórias' },
  { icon: '🎵', title: 'Música do casal', desc: 'A música que marca tudo' },
  { icon: '💌', title: 'Mensagem emocionante', desc: 'Palavras que vêm do coração' },
  { icon: '🔗', title: 'Link personalizado', desc: 'Compartilhe de forma única' }
]

const steps = [
  { icon: '✏️', title: 'Preencha', desc: 'Informações do casal' },
  { icon: '🎨', title: 'Personalize', desc: 'Fotos e música' },
  { icon: '🔗', title: 'Compartilhe', desc: 'O link mágico' }
]

export default function Landing() {
  const [showMascote, setShowMascote] = useState(false)
  const [showTitle, setShowTitle] = useState(false)
  const [showSubtitle, setShowSubtitle] = useState(false)
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    const timers = [
      setTimeout(() => setShowMascote(true), 300),
      setTimeout(() => setShowTitle(true), 600),
      setTimeout(() => setShowSubtitle(true), 900),
      setTimeout(() => setShowButton(true), 1200)
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/30 to-black" />

      <div className="absolute inset-0">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-40 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/5 rounded-full blur-[120px]" />
      </div>

      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-float-slow"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            opacity: 0.3 + Math.random() * 0.4,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`
          }}
        >
          {p.type === 'star' ? (
            <div className="text-white" style={{ fontSize: `${p.size}px` }}>✦</div>
          ) : (
            <div className="text-rose-400" style={{ fontSize: `${p.size * 2}px` }}>♥</div>
          )}
        </div>
      ))}

      <div className="relative z-10 flex flex-col items-center px-4 py-16">
        <div className="w-full max-w-2xl mx-auto">
          <div
            className={`flex flex-col items-center mb-10 transition-all duration-700 ${showMascote ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <div className="relative">
              <svg
                viewBox="0 0 200 200"
                className="w-32 h-32 drop-shadow-2xl animate-float"
              >
                <defs>
                  <linearGradient id="crocGradHome" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22C55E" />
                    <stop offset="100%" stopColor="#16A34A" />
                  </linearGradient>
                  <linearGradient id="bellyGradHome" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#86EFAC" />
                    <stop offset="100%" stopColor="#4ADE80" />
                  </linearGradient>
                </defs>

                <ellipse cx="100" cy="115" rx="70" ry="60" fill="url(#crocGradHome)" />
                <ellipse cx="100" cy="145" rx="50" ry="35" fill="url(#bellyGradHome)" />

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

              <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64">
                <div className="bg-white rounded-2xl p-3 shadow-2xl animate-bounce-in">
                  <p className="text-gray-800 font-body text-sm text-center">Ei, romântico(a)... bora criar uma surpresa inesquecível?</p>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-white"></div>
                </div>
              </div>
            </div>
          </div>

          <h1
            className={`font-display text-4xl md:text-5xl lg:text-6xl text-white text-center mb-5 leading-tight transition-all duration-700 ${showTitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            Declare seu <span className="text-rose-400">amor</span> de um jeito <span className="text-pink-400">inesquecível</span>
          </h1>

          <p
            className={`text-gray-400 text-base md:text-lg text-center mb-8 max-w-lg mx-auto leading-relaxed transition-all duration-700 ${showSubtitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            Crie um presente digital com fotos, música, mensagem especial e uma retrospectiva animada para sua namorada ou esposa.
          </p>

          <div className={`flex justify-center mb-16 transition-all duration-700 ${showButton ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
            <Link
              to="/criar"
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white font-semibold text-lg rounded-full shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <span>Criar presente agora</span>
              <span className="text-xl group-hover:animate-bounce">❤️</span>
              <div className="absolute inset-0 rounded-full bg-white/20 blur-lg group-hover:blur-xl transition-all" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
            {featureCards.map((card, i) => (
              <div
                key={i}
                className="group bg-dark-card/50 backdrop-blur-sm border border-dark-border/50 rounded-2xl p-4 text-center hover:border-rose-500/30 hover:shadow-lg hover:shadow-rose-500/10 transition-all duration-300"
                style={{ animationDelay: `${1500 + i * 100}ms` }}
              >
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{card.icon}</div>
                <h3 className="font-display text-sm text-white mb-1">{card.title}</h3>
                <p className="text-gray-500 text-xs">{card.desc}</p>
              </div>
            ))}
          </div>

          <div className="mb-12">
            <h2 className="font-display text-2xl text-white text-center mb-6">Como funciona?</h2>
            <div className="grid grid-cols-3 gap-4">
              {steps.map((step, i) => (
                <div
                  key={i}
                  className="text-center"
                >
                  <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-rose-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center text-2xl border border-rose-500/20">
                    {step.icon}
                  </div>
                  <h3 className="font-display text-sm text-white mb-1">{step.title}</h3>
                  <p className="text-gray-500 text-xs">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center pb-8">
            <p className="text-gray-500 text-sm">
              Feito com ❤️ para celebrar o amor
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}