const moodDetails = {
  calm: { accessory: null, accent: 'bg-rose-300', animation: 'mascot-wave' },
  title: { accessory: 'sparkles', accent: 'bg-fuchsia-300', animation: 'mascot-float' },
  music: { accessory: 'notes', accent: 'bg-emerald-300', animation: 'mascot-dance' },
  photos: { accessory: 'camera', accent: 'bg-sky-300', animation: 'mascot-blink' },
  message: { accessory: 'letter', accent: 'bg-rose-300', animation: 'mascot-heartbeat' },
  audio: { accessory: 'mic', accent: 'bg-purple-300', animation: 'mascot-pulse' },
  extras: { accessory: 'album', accent: 'bg-amber-300', animation: 'mascot-bounce' },
  success: { accessory: 'confetti', accent: 'bg-emerald-300', animation: 'mascot-celebrate' }
}

function Accessory({ type }) {
  if (!type) return null

  const floating = 'absolute text-lg drop-shadow-lg'
  if (type === 'notes') {
    return (
      <>
        <span className={`${floating} -right-3 top-5 animate-note-float`}>♪</span>
        <span className={`${floating} -left-2 top-9 animate-note-float-delayed`}>♫</span>
      </>
    )
  }
  if (type === 'sparkles') {
    return (
      <>
        <span className={`${floating} -right-2 top-4 animate-soft-twinkle`}>✦</span>
        <span className={`${floating} left-2 top-1 animate-soft-twinkle-delayed`}>✧</span>
      </>
    )
  }
  if (type === 'confetti') {
    return (
      <>
        <span className={`${floating} -right-4 top-3 animate-note-float`}>♥</span>
        <span className={`${floating} -left-3 top-7 animate-note-float-delayed`}>✦</span>
        <span className={`${floating} right-2 -top-2 animate-soft-twinkle`}>•</span>
      </>
    )
  }

  const badge = {
    camera: '📷',
    letter: '✉',
    mic: '🎙',
    album: '▣'
  }[type]

  return (
    <span className="absolute -right-2 bottom-7 flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-black/55 text-base shadow-xl backdrop-blur animate-soft-pop">
      {badge}
    </span>
  )
}

export default function Mascote({ message, mood = 'calm', className = '' }) {
  const detail = moodDetails[mood] || moodDetails.calm

  return (
    <div className={`mascot-guide flex flex-col items-center ${className}`}>
      {message && (
        <div className="relative z-10 mb-3 w-full max-w-sm">
          <div className="relative rounded-3xl border border-white/12 bg-white/[0.08] px-4 py-3 text-center shadow-2xl backdrop-blur-md">
            <div className={`absolute left-5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full ${detail.accent} shadow-[0_0_18px_currentColor]`} />
            <p className="px-3 text-sm font-semibold leading-relaxed text-white/85 sm:text-[15px]">{message}</p>
            <div className="absolute bottom-0 left-1/2 h-4 w-4 -translate-x-1/2 translate-y-1/2 rotate-45 border-b border-r border-white/12 bg-[#23131d]" />
          </div>
        </div>
      )}

      <div className={`relative ${detail.animation}`}>
        <div className="absolute inset-3 rounded-full bg-emerald-400/15 blur-2xl" />
        <Accessory type={detail.accessory} />
        <svg viewBox="0 0 200 200" className="relative h-28 w-28 drop-shadow-2xl sm:h-32 sm:w-32" aria-hidden="true">
          <defs>
            <linearGradient id="crocGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4ADE80" />
              <stop offset="100%" stopColor="#16A34A" />
            </linearGradient>
            <linearGradient id="bellyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#BBF7D0" />
              <stop offset="100%" stopColor="#4ADE80" />
            </linearGradient>
          </defs>

          <ellipse cx="100" cy="110" rx="70" ry="60" fill="url(#crocGrad)" />
          <ellipse cx="100" cy="140" rx="50" ry="35" fill="url(#bellyGrad)" />
          <ellipse cx="65" cy="75" rx="25" ry="28" fill="#22C55E" />
          <ellipse cx="135" cy="75" rx="25" ry="28" fill="#22C55E" />
          <ellipse className="mascot-eye" cx="65" cy="75" rx="15" ry="18" fill="#111827" />
          <ellipse className="mascot-eye" cx="135" cy="75" rx="15" ry="18" fill="#111827" />
          <circle cx="60" cy="72" r="4" fill="white" />
          <circle cx="130" cy="72" r="4" fill="white" />
          <ellipse cx="100" cy="95" rx="12" ry="8" fill="#166534" />
          <path d="M 100 95 Q 95 100 100 105 Q 105 100 100 95" fill="#166534" />
          <ellipse cx="100" cy="108" rx="20" ry="15" fill="#111827" />
          <path d="M 65 108 Q 80 121 100 121 Q 120 121 135 108" fill="none" stroke="#14532D" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="100" cy="119" rx="8" ry="4" fill="#F43F5E" />
          <path className="mascot-arm-left" d="M 50 60 Q 45 45 55 35 Q 65 40 60 55" fill="#22C55E" stroke="#166534" strokeWidth="1" />
          <ellipse cx="52" cy="38" rx="6" ry="8" fill="#22C55E" />
          <path className="mascot-arm-right" d="M 150 60 Q 155 45 145 35 Q 135 40 140 55" fill="#22C55E" stroke="#166534" strokeWidth="1" />
          <ellipse cx="148" cy="38" rx="6" ry="8" fill="#22C55E" />
          <path d="M 70 35 Q 100 25 130 35" fill="none" stroke="#166534" strokeWidth="3" strokeLinecap="round" />
          <circle cx="75" cy="32" r="2" fill="#166534" />
          <circle cx="100" cy="28" r="2" fill="#166534" />
          <circle cx="125" cy="32" r="2" fill="#166534" />
          <path d="M 60 125 L 55 145 L 65 145 Z" fill="#22C55E" />
          <path d="M 140 125 L 145 145 L 135 145 Z" fill="#22C55E" />
          <ellipse cx="80" cy="158" rx="12" ry="4" fill="#166534" />
          <ellipse cx="120" cy="158" rx="12" ry="4" fill="#166534" />
        </svg>
      </div>
    </div>
  )
}
