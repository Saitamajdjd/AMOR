import { StarMap, Timeline, WordGame, Roulette, AudioPlayer, SlideShell } from './GiftUI'
import { getListItems, getText, getAudioUrl } from './helpers'

const stopStory = (e) => {
  e.stopPropagation()
}

const dateLabel = (value) => {
  if (!value) return null
  return new Date(value).toLocaleDateString('pt-BR')
}

const sinceLabel = (timeData) => {
  if (!timeData) return 'Cada segundo virou lembranca'
  const parts = []
  if (timeData.years > 0) parts.push(`${timeData.years} ano${timeData.years > 1 ? 's' : ''}`)
  if (timeData.months > 0) parts.push(`${timeData.months} mes${timeData.months > 1 ? 'es' : ''}`)
  parts.push(`${timeData.days} dia${timeData.days > 1 ? 's' : ''}`)
  return parts.join(', ')
}

function PhotoFrame({ photos, currentPhoto, label }) {
  if (!photos?.length) {
    return (
      <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-rose-900/60 via-purple-950 to-black shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(244,63,94,.45),transparent_32%),radial-gradient(circle_at_75%_80%,rgba(168,85,247,.4),transparent_38%)]" />
        <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
          <p className="font-display text-4xl leading-tight text-white">Nosso amor em destaque</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-[0_30px_80px_rgba(244,63,94,.26)]">
      {photos.map((foto, i) => (
        <img
          key={`${foto}-${i}`}
          src={foto}
          alt={label || 'Foto do presente'}
          className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ${i === currentPhoto ? 'scale-100 opacity-100' : 'scale-105 opacity-0'}`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-transparent" />
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">Memoria favorita</p>
        <div className="flex gap-1.5">
          {photos.map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${i === currentPhoto ? 'w-6 bg-rose-400' : 'w-1.5 bg-white/40'}`} />
          ))}
        </div>
      </div>
    </div>
  )
}

function MetricGrid({ timeData }) {
  if (!timeData) return null
  const items = [
    ['anos', timeData.years],
    ['meses', timeData.months],
    ['dias', timeData.days],
    ['horas', timeData.hours],
    ['min', timeData.minutes],
    ['seg', timeData.seconds ?? 0]
  ]

  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.07] px-2 py-3 text-center shadow-lg backdrop-blur">
          <p className="text-xl font-black leading-none text-white">{value}</p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">{label}</p>
        </div>
      ))}
    </div>
  )
}

export function buildSlides(presente, options) {
  const {
    timeData,
    currentPhoto,
    activeSlideId,
    onGameComplete,
    musicPlaying,
    onToggleMusic,
    onAudioPlay,
    pauseAudioSignal = 0,
    musicProgress = 34
  } = options

  if (!presente) return []
  const slides = []
  const photos = presente.fotos || []
  const mainPhoto = photos[currentPhoto] || photos[0]
  const destinataria = presente.nome_destinataria || 'meu amor'
  const remetente = presente.nome_remetente || 'alguem que te ama'

  slides.push({
    id: 'capa',
    render: () => (
      <SlideShell tone="cover">
        <div className="flex h-full flex-col justify-between gap-4">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-emerald-300">Presente digital</p>
            <h1 className="font-display text-[2.7rem] leading-[0.95] text-white drop-shadow-2xl">{presente.titulo_presente || 'Uma surpresa pra voce'}</h1>
            <p className="mt-3 text-2xl font-semibold text-rose-200">Para {destinataria}</p>
          </div>

          <PhotoFrame photos={photos} currentPhoto={currentPhoto} label={presente.titulo_presente} />

          <div className="rounded-[1.75rem] border border-white/10 bg-black/35 p-4 shadow-2xl backdrop-blur">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">Juntos ha</p>
                <p className="mt-1 text-2xl font-black text-white">{sinceLabel(timeData)}</p>
              </div>
              <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-black text-black">PLAY</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-white/70">Algumas lembrancas mereciam virar uma experiencia so sua.</p>
          </div>
        </div>
      </SlideShell>
    )
  })

  if (presente.musica_video_id) {
    slides.push({
      id: 'musica',
      interactive: true,
      render: () => (
        <SlideShell tone="spotify">
          <div className="flex h-full flex-col justify-between gap-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-300">Nossa trilha</p>
              <h2 className="mt-2 font-display text-4xl leading-none text-white">A musica que toca essa historia</h2>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-[#121212]/90 p-5 shadow-[0_30px_90px_rgba(0,0,0,.55)]">
              <img
                src={`https://img.youtube.com/vi/${presente.musica_video_id}/hqdefault.jpg`}
                alt=""
                className="aspect-square w-full rounded-3xl object-cover shadow-2xl"
              />
              <div className="mt-5">
                <p className="truncate text-2xl font-black text-white">{presente.musica_titulo || 'Musica do presente'}</p>
                <p className="mt-1 truncate text-sm font-medium text-white/50">{presente.musica_artista || 'Escolhida com carinho'}</p>
              </div>
              <div className="mt-5">
                <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
                  <div className="h-full rounded-full bg-emerald-400 transition-all duration-500" style={{ width: `${musicProgress}%` }} />
                </div>
                <div className="mt-2 flex justify-between text-[11px] text-white/40">
                  <span>{musicPlaying ? 'tocando agora' : 'pausada'}</span>
                  <span>presente atual</span>
                </div>
              </div>
              <button
                type="button"
                onClick={onToggleMusic}
                onTouchStart={stopStory}
                onPointerDown={stopStory}
                data-story-controls
                className="pointer-events-auto mt-5 flex h-14 w-full items-center justify-center rounded-full bg-emerald-400 text-base font-black text-black shadow-[0_14px_45px_rgba(52,211,153,.35)] active:scale-95"
              >
                {musicPlaying ? 'Pausar musica' : 'Tocar musica'}
              </button>
            </div>
          </div>
        </SlideShell>
      )
    })
  }

  slides.push({
    id: 'sobre-nos',
    render: () => (
      <SlideShell tone="memory">
        <div className="flex h-full flex-col justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-rose-200">Retrospectiva</p>
            <h2 className="mt-2 font-display text-5xl leading-none text-white">{remetente} & {destinataria}</h2>
            {presente.data_inicio && <p className="mt-3 text-sm font-semibold text-white/60">Juntos desde {dateLabel(presente.data_inicio)}</p>}
          </div>
          <PhotoFrame photos={photos} currentPhoto={currentPhoto} label="Foto do casal" />
          <MetricGrid timeData={timeData} />
        </div>
      </SlideShell>
    )
  })

  if (presente.mensagem) {
    slides.push({
      id: 'mensagem',
      render: () => (
        <SlideShell tone="rose">
          <div className="flex h-full flex-col justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-rose-100/70">Mensagem especial</p>
              <h2 className="mt-2 font-display text-5xl leading-none text-white">Leia com calma.</h2>
            </div>
            <div className="rounded-[2rem] border border-white/15 bg-white/[0.08] p-6 shadow-2xl backdrop-blur">
              <p className="text-xl font-semibold leading-snug text-white whitespace-pre-wrap">"{presente.mensagem}"</p>
              <p className="mt-5 text-2xl font-bold text-rose-100">- {remetente}</p>
            </div>
            <p className="text-sm font-medium text-white/60">Algumas coisas merecem ser ditas olhando pro coracao.</p>
          </div>
        </SlideShell>
      )
    })
  }

  const coisas = getListItems(presente.coisas_pequenas)
  if (coisas?.length) {
    slides.push({
      id: 'coisas-pequenas',
      render: () => (
        <SlideShell tone="purple">
          <div className="flex h-full flex-col justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-pink-200">Detalhes</p>
              <h2 className="mt-2 font-display text-5xl leading-none text-white">Coisas que amo em voce</h2>
            </div>
            <div className="grid gap-3">
              {coisas.slice(0, 8).map((item, i) => (
                <div key={i} className="rounded-3xl border border-white/10 bg-black/30 p-4 shadow-xl backdrop-blur">
                  <p className="text-lg font-black text-white"><span className="mr-2 text-rose-300">0{i + 1}</span>{item}</p>
                </div>
              ))}
            </div>
            <p className="text-sm font-medium text-white/55">E isso ainda nao chega perto de tudo.</p>
          </div>
        </SlideShell>
      )
    })
  }

  const desculpa = getText(presente.desculpa_imperfeito)
  if (desculpa) {
    slides.push({
      id: 'desculpa',
      render: () => (
        <SlideShell tone="darkrose">
          <div className="flex h-full flex-col justify-center gap-7">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-rose-200/70">Com sinceridade</p>
              <h2 className="mt-3 font-display text-5xl leading-none text-white">Desculpa por ser imperfeito</h2>
            </div>
            <div className="rounded-[2rem] border border-rose-300/20 bg-black/35 p-6 shadow-2xl backdrop-blur">
              <p className="text-xl font-semibold leading-snug text-white/90 whitespace-pre-wrap">{desculpa}</p>
            </div>
          </div>
        </SlideShell>
      )
    })
  }

  const obrigado = getText(presente.obrigado_desistir)
  if (obrigado) {
    slides.push({
      id: 'obrigado',
      render: () => (
        <SlideShell tone="thanks">
          <div className="flex h-full flex-col justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-violet-100/70">Gratidao</p>
              <h2 className="mt-3 font-display text-5xl leading-none text-white">Obrigado por nao desistir de mim</h2>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl backdrop-blur">
              <p className="text-xl font-semibold leading-snug text-white whitespace-pre-wrap">{obrigado}</p>
            </div>
            <p className="text-sm text-white/55">Voce mudou o jeito que eu enxergo amor.</p>
          </div>
        </SlideShell>
      )
    })
  }

  if (presente.linha_tempo?.momentos?.length > 0) {
    slides.push({
      id: 'timeline',
      interactive: true,
      render: () => (
        <SlideShell tone="stars" scroll>
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/45">Linha do tempo</p>
            <h2 className="mt-2 font-display text-4xl leading-none text-white">{presente.linha_tempo.titulo || 'Nossa historia'}</h2>
          </div>
          <Timeline data={presente.linha_tempo} />
        </SlideShell>
      )
    })
  }

  if (presente.mapa_estrelas?.texto) {
    slides.push({
      id: 'mapa-estrelas',
      render: () => (
        <SlideShell tone="night">
          <div className="flex h-full flex-col justify-between gap-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-sky-200/70">Ceu daquele dia</p>
              <h2 className="mt-2 font-display text-5xl leading-none text-white">Mapa das estrelas</h2>
            </div>
            <StarMap data={presente.mapa_estrelas} />
            <p className="text-sm font-medium text-white/55">Nao precisa ser astronomia perfeita para ser infinito.</p>
          </div>
        </SlideShell>
      )
    })
  }

  if (presente.jogo_palavra?.palavra) {
    slides.push({
      id: 'jogo-palavra',
      interactive: true,
      render: () => (
        <SlideShell tone="game">
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-200/80">Desafio</p>
            <h2 className="mt-2 font-display text-4xl leading-none text-white">Jogo da palavra</h2>
          </div>
          <WordGame
            data={presente.jogo_palavra}
            onComplete={onGameComplete}
            isActive={activeSlideId === 'jogo-palavra'}
          />
        </SlideShell>
      )
    })
  }

  if (presente.roleta?.opcoes?.length > 0) {
    slides.push({
      id: 'roleta',
      interactive: true,
      render: () => (
        <SlideShell tone="roulette">
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-pink-100/70">Sorte ou destino?</p>
            <h2 className="mt-2 font-display text-4xl leading-none text-white">Roleta do amor</h2>
          </div>
          <Roulette data={presente.roleta} />
        </SlideShell>
      )
    })
  }

  const audioUrl = getAudioUrl(presente.audio_especial)
  if (audioUrl) {
    const audioTitulo = typeof presente.audio_especial === 'object' ? presente.audio_especial.titulo : null
    const audioMensagem = typeof presente.audio_especial === 'object' ? presente.audio_especial.mensagem : null
    slides.push({
      id: 'audio-especial',
      interactive: true,
      render: () => (
        <SlideShell tone="audio">
          <AudioPlayer
            url={audioUrl}
            titulo={audioTitulo}
            mensagem={audioMensagem}
            onPlay={onAudioPlay}
            pauseSignal={pauseAudioSignal}
            isActive={activeSlideId === 'audio-especial'}
          />
        </SlideShell>
      )
    })
  }

  const carta = getText(presente.carta_final)
  if (carta) {
    slides.push({
      id: 'carta-final',
      interactive: true,
      render: () => (
        <SlideShell tone="letter">
          <div className="pointer-events-auto flex h-full flex-col justify-center gap-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-200/80">Leia so no final</p>
              <h2 className="mt-2 font-display text-5xl leading-none text-white">Carta final</h2>
            </div>
            <details
              className="group rounded-[2rem] border border-amber-200/20 bg-amber-50/95 p-5 text-zinc-950 shadow-2xl open:animate-fade-in"
              data-story-interactive
              onClick={stopStory}
              onTouchStart={stopStory}
              onPointerDown={stopStory}
            >
              <summary className="cursor-pointer list-none text-center font-black text-rose-700" onClick={stopStory}>
                Abrir carta
              </summary>
              <p className="mt-5 max-h-[48vh] overflow-y-auto whitespace-pre-wrap text-base font-semibold leading-relaxed text-zinc-900">{carta}</p>
              <p className="mt-5 text-right text-xl font-black text-rose-700">- {remetente}</p>
            </details>
          </div>
        </SlideShell>
      )
    })
  }

  slides.push({
    id: 'encerramento',
    interactive: true,
    render: () => (
      <SlideShell tone="final">
        <div className="pointer-events-auto flex h-full flex-col justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-rose-200/70">Final</p>
            <h2 className="mt-3 font-display text-6xl leading-[0.9] text-white">Eu te amo.</h2>
            <p className="mt-5 text-lg font-semibold leading-snug text-white/70">Esse foi so o comeco. Algumas coisas merecem ser lembradas pra sempre.</p>
          </div>
          {mainPhoto && <img src={mainPhoto} alt="" className="aspect-[4/3] w-full rounded-[2rem] object-cover opacity-90 shadow-2xl" />}
          <div className="space-y-3">
            <button
              type="button"
              onClick={(e) => {
                stopStory(e)
                navigator.clipboard?.writeText(window.location.href)
                alert('Link copiado!')
              }}
              onTouchStart={stopStory}
              className="h-14 w-full rounded-full bg-white text-base font-black text-black shadow-2xl active:scale-95"
            >
              Copiar link
            </button>
            <button
              type="button"
              onClick={(e) => {
                stopStory(e)
                if (navigator.share) navigator.share({ title: presente.titulo_presente || 'Meu presente', url: window.location.href })
                else navigator.clipboard?.writeText(window.location.href)
              }}
              onTouchStart={stopStory}
              className="h-14 w-full rounded-full border border-white/20 bg-white/10 text-base font-black text-white backdrop-blur active:scale-95"
            >
              Compartilhar presente
            </button>
            <p className="pt-2 text-center text-xs font-semibold text-white/35">Feito com amor por Amor Presente</p>
          </div>
        </div>
      </SlideShell>
    )
  })

  return slides
}
