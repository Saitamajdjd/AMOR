export default function Mascote({ message, className = '' }) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative">
        <svg
          viewBox="0 0 200 200"
          className="w-32 h-32 drop-shadow-lg"
        >
          <defs>
            <linearGradient id="crocGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22C55E" />
              <stop offset="100%" stopColor="#16A34A" />
            </linearGradient>
            <linearGradient id="bellyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#86EFAC" />
              <stop offset="100%" stopColor="#4ADE80" />
            </linearGradient>
          </defs>

          <ellipse cx="100" cy="110" rx="70" ry="60" fill="url(#crocGrad)" />

          <ellipse cx="100" cy="140" rx="50" ry="35" fill="url(#bellyGrad)" />

          <ellipse cx="65" cy="75" rx="25" ry="28" fill="#22C55E" />
          <ellipse cx="135" cy="75" rx="25" ry="28" fill="#22C55E" />

          <ellipse cx="65" cy="75" rx="15" ry="18" fill="#1A1A1A" />
          <ellipse cx="135" cy="75" rx="15" ry="18" fill="#1A1A1A" />

          <circle cx="60" cy="72" r="4" fill="white" />
          <circle cx="130" cy="72" r="4" fill="white" />

          <ellipse cx="100" cy="95" rx="12" ry="8" fill="#166534" />

          <path d="M 100 95 Q 95 100 100 105 Q 105 100 100 95" fill="#166534" />

          <ellipse cx="100" cy="108" rx="20" ry="15" fill="#1A1A1A" />

          <path d="M 65 108 Q 80 118 100 118 Q 120 118 135 108" fill="none" stroke="#166534" strokeWidth="2" />

          <ellipse cx="100" cy="118" rx="8" ry="4" fill="#F43F5E" />

          <path d="M 50 60 Q 45 45 55 35 Q 65 40 60 55" fill="#22C55E" stroke="#166534" strokeWidth="1" />
          <ellipse cx="52" cy="38" rx="6" ry="8" fill="#22C55E" />

          <path d="M 150 60 Q 155 45 145 35 Q 135 40 140 55" fill="#22C55E" stroke="#166534" strokeWidth="1" />
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

        {message && (
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48">
            <div className="bg-white rounded-2xl p-4 shadow-xl relative">
              <p className="text-gray-800 font-body text-sm text-center">{message}</p>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-4 h-4 bg-white"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}