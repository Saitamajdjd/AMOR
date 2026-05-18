import { useState, useEffect, useCallback, useRef } from 'react'

const stopBubble = (e) => {
  e.stopPropagation()
}

export default function WordGame({ data, onComplete, isActive }) {
  const [attempts, setAttempts] = useState([])
  const [currentGuess, setCurrentGuess] = useState('')
  const [won, setWon] = useState(false)
  const inputRef = useRef(null)
  const word = data.palavra.toUpperCase()
  const maxAttempts = 6

  const applyGuess = useCallback((raw) => {
    setCurrentGuess(raw.toUpperCase().replace(/[^A-Z]/g, '').slice(0, word.length))
  }, [word.length])

  const submitGuess = useCallback(() => {
    if (currentGuess.length !== word.length) return
    const guess = currentGuess.toUpperCase()
    setAttempts((a) => [...a, guess])
    setCurrentGuess('')
    if (guess === word) {
      setWon(true)
      onComplete?.()
    }
  }, [currentGuess, word, onComplete])

  const handleKeyPress = useCallback((key) => {
    if (key === 'ENTER' || key === 'OK') submitGuess()
    else if (key === 'APAGAR') setCurrentGuess((g) => g.slice(0, -1))
    else if (/^[A-Z]$/.test(key)) setCurrentGuess((g) => (g.length < word.length ? g + key : g))
  }, [word.length, submitGuess])

  useEffect(() => {
    if (!isActive || won) return
    const onKey = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') return
      if (e.key === 'Enter') {
        e.stopPropagation()
        e.preventDefault()
        submitGuess()
      } else if (e.key === 'Backspace') {
        e.stopPropagation()
        setCurrentGuess((g) => g.slice(0, -1))
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        e.stopPropagation()
        setCurrentGuess((g) => (g.length < word.length ? g + e.key.toUpperCase() : g))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isActive, won, word.length, submitGuess])

  const statusOf = (letter, index) => {
    if (word[index] === letter) return 'correct'
    if (word.includes(letter)) return 'present'
    return 'absent'
  }

  const focusInput = (e) => {
    stopBubble(e)
    inputRef.current?.focus()
  }

  if (won) {
    return (
      <div
        className="pointer-events-auto rounded-[2rem] border border-white/10 bg-white/[0.08] p-6 text-center shadow-2xl backdrop-blur"
        data-story-interactive
        onClick={stopBubble}
        onTouchStart={stopBubble}
      >
        <p className="mb-2 text-5xl font-black text-rose-300">LOVE</p>
        <h3 className="mb-1 font-display text-3xl text-white">Parabens!</h3>
        <p className="text-xl font-black text-emerald-300">{data.mensagemFinal}</p>
      </div>
    )
  }

  const rows = [
    'QWERTYUIOP'.split('').map((k) => ({ key: k, label: k })),
    'ASDFGHJKL'.split('').map((k) => ({ key: k, label: k })),
    [{ key: 'OK', label: 'OK' }, ...'ZXCVBNM'.split('').map((k) => ({ key: k, label: k })), { key: 'APAGAR', label: '<' }]
  ]

  return (
    <div
      className="pointer-events-auto touch-manipulation rounded-[2rem] border border-white/10 bg-black/35 p-4 shadow-2xl backdrop-blur"
      data-story-interactive
      onClick={stopBubble}
      onTouchStart={stopBubble}
      onTouchEnd={stopBubble}
      onPointerDown={stopBubble}
    >
      <p className="mb-4 text-center text-lg font-bold leading-snug text-white">{data.pergunta}</p>

      <input
        ref={inputRef}
        type="text"
        inputMode="text"
        autoCapitalize="characters"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        maxLength={word.length}
        value={currentGuess}
        onChange={(e) => { stopBubble(e); applyGuess(e.target.value) }}
        onKeyDown={(e) => e.stopPropagation()}
        onClick={stopBubble}
        onTouchStart={stopBubble}
        className="sr-only"
        aria-label="Digite a palavra"
      />

      <button type="button" className="mb-3 flex w-full justify-center gap-1.5" onClick={focusInput} onTouchStart={stopBubble}>
        {Array(word.length).fill(0).map((_, i) => (
          <span
            key={i}
            className={`flex h-12 w-10 items-center justify-center rounded-xl border text-xl font-black ${
              currentGuess[i] ? 'border-white/20 bg-gradient-to-br from-rose-500 to-pink-500 text-white' : 'border-white/10 bg-white/10 text-white/30'
            }`}
          >
            {currentGuess[i] || ''}
          </span>
        ))}
      </button>

      {[...Array(maxAttempts - attempts.length)].map((_, i) => (
        <div key={i} className="mb-1 flex justify-center gap-1.5">
          {Array(word.length).fill(0).map((_, j) => (
            <span key={j} className="block h-12 w-10 rounded-xl border border-white/5 bg-white/5" />
          ))}
        </div>
      ))}

      {attempts.map((attempt, i) => (
        <div key={i} className="mb-1 flex justify-center gap-1.5">
          {attempt.split('').map((letter, j) => {
            const s = statusOf(letter, j)
            return (
              <span
                key={j}
                className={`flex h-12 w-10 items-center justify-center rounded-xl text-base font-black ${
                  s === 'correct' ? 'bg-emerald-500' : s === 'present' ? 'bg-yellow-500' : 'bg-zinc-600'
                } text-white`}
              >
                {letter}
              </span>
            )
          })}
        </div>
      ))}

      <div className="mt-3 space-y-1.5">
        {rows.map((row, ri) => (
          <div key={ri} className="flex flex-wrap justify-center gap-1">
            {row.map(({ key, label }) => (
              <button
                key={`${ri}-${key}`}
                type="button"
                onClick={(e) => { stopBubble(e); handleKeyPress(key) }}
                onTouchStart={stopBubble}
                onTouchEnd={stopBubble}
                onPointerDown={stopBubble}
                className={`min-h-11 rounded-xl text-xs font-black shadow-lg active:bg-rose-500/70 ${
                  key === 'OK'
                    ? 'min-w-[3.5rem] bg-emerald-400 px-2 text-black'
                    : key === 'APAGAR'
                      ? 'min-w-[3rem] bg-rose-500/80 text-white'
                      : 'w-8 min-w-[2rem] bg-white/10 text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        ))}
      </div>

      <p className="mt-3 text-center text-[10px] text-white/40">Toque nas letras ou nos quadrados para digitar no celular</p>
    </div>
  )
}
