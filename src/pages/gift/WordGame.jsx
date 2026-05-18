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

  const submitGuess = useCallback((e) => {
    e?.preventDefault?.()
    e?.stopPropagation?.()
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
        submitGuess(e)
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
      className="pointer-events-auto mx-auto w-full max-w-full touch-manipulation overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/35 p-3 shadow-2xl backdrop-blur sm:rounded-[2rem] sm:p-4"
    >
      <p className="mb-3 text-center text-base font-bold leading-snug text-white sm:text-lg">{data.pergunta}</p>

      <form onSubmit={submitGuess} data-story-controls onClick={stopBubble} onTouchStart={stopBubble} onPointerDown={stopBubble}>
        <input
          ref={inputRef}
          type="text"
          inputMode="text"
          enterKeyHint="done"
          autoCapitalize="characters"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          maxLength={word.length}
          value={currentGuess}
          onChange={(e) => { stopBubble(e); applyGuess(e.target.value) }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submitGuess(e)
            else e.stopPropagation()
          }}
          onClick={stopBubble}
          onTouchStart={stopBubble}
          className="sr-only"
          aria-label="Digite a palavra"
        />

        <button
          type="button"
          className="mx-auto mb-3 grid w-full max-w-[min(100%,22rem)] gap-1.5"
          style={{ gridTemplateColumns: `repeat(${word.length}, minmax(0, 1fr))` }}
          onClick={focusInput}
          onTouchStart={stopBubble}
        >
          {Array(word.length).fill(0).map((_, i) => (
            <span
              key={i}
              className={`flex aspect-square min-w-0 items-center justify-center rounded-lg border text-base font-black sm:rounded-xl sm:text-xl ${
                currentGuess[i] ? 'border-white/20 bg-gradient-to-br from-rose-500 to-pink-500 text-white' : 'border-white/10 bg-white/10 text-white/30'
              }`}
            >
              {currentGuess[i] || ''}
            </span>
          ))}
        </button>
      </form>

      {[...Array(maxAttempts - attempts.length)].map((_, i) => (
        <div
          key={i}
          className="mx-auto mb-1 grid w-full max-w-[min(100%,22rem)] gap-1.5"
          style={{ gridTemplateColumns: `repeat(${word.length}, minmax(0, 1fr))` }}
        >
          {Array(word.length).fill(0).map((_, j) => (
            <span key={j} className="block aspect-square min-w-0 rounded-lg border border-white/5 bg-white/5 sm:rounded-xl" />
          ))}
        </div>
      ))}

      {attempts.map((attempt, i) => (
        <div
          key={i}
          className="mx-auto mb-1 grid w-full max-w-[min(100%,22rem)] gap-1.5"
          style={{ gridTemplateColumns: `repeat(${word.length}, minmax(0, 1fr))` }}
        >
          {attempt.split('').map((letter, j) => {
            const s = statusOf(letter, j)
            return (
              <span
                key={j}
                className={`flex aspect-square min-w-0 items-center justify-center rounded-lg text-sm font-black sm:rounded-xl sm:text-base ${
                  s === 'correct' ? 'bg-emerald-500' : s === 'present' ? 'bg-yellow-500' : 'bg-zinc-600'
                } text-white`}
              >
                {letter}
              </span>
            )
          })}
        </div>
      ))}

      <div className="mt-3 space-y-1.5" data-story-controls onClick={stopBubble} onTouchStart={stopBubble} onPointerDown={stopBubble}>
        {rows.map((row, ri) => (
          <div key={ri} className="grid w-full gap-1" style={{ gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))` }}>
            {row.map(({ key, label }) => (
              <button
                key={`${ri}-${key}`}
                type="button"
                onClick={(e) => { stopBubble(e); handleKeyPress(key) }}
                onTouchStart={stopBubble}
                onTouchEnd={stopBubble}
                onPointerDown={stopBubble}
                className={`min-h-10 min-w-0 rounded-lg px-1 text-[11px] font-black shadow-lg active:bg-rose-500/70 sm:min-h-11 sm:rounded-xl sm:text-xs ${
                  key === 'OK'
                    ? 'bg-emerald-400 text-black'
                    : key === 'APAGAR'
                      ? 'bg-rose-500/80 text-white'
                      : 'bg-white/10 text-white'
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
