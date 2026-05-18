import { useRef, useCallback } from 'react'

function isBlockedTarget(target) {
  return target.closest('[data-story-interactive],[data-story-controls]')
}

export default function StoryTapZones({ onPrev, onNext, disabled }) {
  const lockRef = useRef(false)
  const startRef = useRef(null)

  const navigate = useCallback(
    (dir, e) => {
      if (disabled || lockRef.current) return
      if (isBlockedTarget(e.target)) return
      lockRef.current = true
      setTimeout(() => {
        lockRef.current = false
      }, 360)
      if (dir === 'prev') onPrev()
      else onNext()
    },
    [disabled, onPrev, onNext]
  )

  const onPointerDown = (dir) => (e) => {
    e.stopPropagation()
    startRef.current = { x: e.clientX, y: e.clientY, dir }
  }

  const onPointerUp = (dir) => (e) => {
    e.stopPropagation()
    const start = startRef.current
    startRef.current = null
    if (!start || start.dir !== dir) return
    if (Math.abs(e.clientX - start.x) > 18 || Math.abs(e.clientY - start.y) > 18) return
    navigate(dir, e)
  }

  return (
    <div className="absolute inset-0 z-10 flex select-none">
      <button
        type="button"
        aria-label="Story anterior"
        className="m-0 h-full w-1/2 cursor-pointer border-0 bg-transparent p-0"
        style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
        onPointerDown={onPointerDown('prev')}
        onPointerUp={onPointerUp('prev')}
      />
      <button
        type="button"
        aria-label="Proximo story"
        className="m-0 h-full w-1/2 cursor-pointer border-0 bg-transparent p-0"
        style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
        onPointerDown={onPointerDown('next')}
        onPointerUp={onPointerUp('next')}
      />
    </div>
  )
}
