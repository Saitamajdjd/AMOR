import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Mascote from '../components/Mascote'
import Preview from '../components/Preview'
import { uploadImage, uploadAudio, savePresente, extractYouTubeId } from '../lib/supabase'
import {
  AUDIO_DEFAULT_MESSAGE,
  AUDIO_DEFAULT_TITLE,
  getAudioExtension,
  getSupportedRecordingMimeType,
  validateAudioFile
} from '../lib/audio'

const STEPS = [
  { id: 1, title: 'Dados do Casal', icon: '💕' },
  { id: 2, title: 'Título', icon: '✨' },
  { id: 3, title: 'Música', icon: '🎵' },
  { id: 4, title: 'Fotos', icon: '📸' },
  { id: 5, title: 'Mensagem', icon: '💌' },
  { id: 6, title: 'Audio especial', icon: '🎙️' },
  { id: 7, title: 'Extras', icon: '🎁' }
]

const MASCOTE_MESSAGES = {
  1: "Calma aí, romântico... primeiro me conta quem são vocês.",
  2: "Agora escolhe um título que vai fazer ela sorrir.",
  3: "Agora escolhe aquela música que lembra ela.",
  4: "Manda as fotos que vão fazer ela sorrir.",
  5: "Agora escreve aquela mensagem que bate no coração.",
  6: "Se voce quiser fazer ela se emocionar de verdade, manda sua voz aqui.",
  7: "Quase pronto! Adicione os extras para deixar tudo mais especial."
}

const STEP_DETAILS = {
  1: { title: 'Dados do Casal', subtitle: 'Comece com quem envia, quem recebe e quando tudo virou historia.', icon: '01', mood: 'calm' },
  2: { title: 'Titulo', subtitle: 'Escolha uma frase de abertura com cara de presente unico.', icon: '02', mood: 'title' },
  3: { title: 'Musica', subtitle: 'Adicione a trilha que vai tocar quando o presente abrir.', icon: '03', mood: 'music' },
  4: { title: 'Fotos', subtitle: 'Separe as lembrancas que merecem virar destaque.', icon: '04', mood: 'photos' },
  5: { title: 'Mensagem', subtitle: 'Escreva o texto principal com calma e carinho.', icon: '05', mood: 'message' },
  6: { title: 'Audio especial', subtitle: 'Opcional, mas a sua voz deixa tudo mais pessoal.', icon: '06', mood: 'audio' },
  7: { title: 'Extras', subtitle: 'Complete com timeline, estrelas, jogo e roleta.', icon: '07', mood: 'extras' }
}

const GUIDE_MESSAGES = {
  1: "Calma ai, romantico... primeiro me conta quem sao voces.",
  2: "Agora escolhe um titulo que vai fazer ela sorrir.",
  3: "Agora escolhe aquela musica que faz lembrar dela.",
  4: "Manda aquelas fotos que fazem o coracao apertar.",
  5: "Agora escreve aquilo que talvez voce nao diga todo dia.",
  6: "Sua voz pode deixar esse presente ainda mais especial.",
  7: "Quase pronto! Vamos deixar alguns detalhes inesqueciveis."
}

const SUGESTOES_MENSAGEM = [
  "Desde o dia em que te conheci, minha vida ganhou cores que eu nem sabia que existiam. Você é a melhor parte de cada meu dia.",
  "Te amo mais do que todas as estrelas do céu. Você é meu aujourd'hui, meu amanhã, meu sempre.",
  "Em você encontrei meu lar, minha paz e meu reason d'être. Obrigado por ser você.",
  "Cada momento ao seu lado é um presente. Obrigado por escolher estar comigo.",
  "Você é a resposta que eu não sabia que estava procurando. Te amo para sempre."
]

function generateSlug() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let slug = ''
  for (let i = 0; i < 12; i++) {
    slug += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return slug
}

function useObjectUrls(files) {
  const urls = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files])

  useEffect(() => {
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [urls])

  return urls
}

export default function Creator() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [audioError, setAudioError] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const recorderRef = useRef(null)
  const chunksRef = useRef([])
  const streamRef = useRef(null)
  const timerRef = useRef(null)

  const [formData, setFormData] = useState({
    nomeRemetente: '',
    nomeDestinataria: '',
    dataInicio: '',
    horaInicio: '',
    cidade: '',
    tituloPresente: '',
    musicaUrl: '',
    musicaTitulo: '',
    musicaArtista: '',
    mensagem: '',
    fotos: [],
    fotosUrls: [],
    audioEspecial: {
      titulo: AUDIO_DEFAULT_TITLE,
      mensagem: AUDIO_DEFAULT_MESSAGE,
      file: null,
      previewUrl: ''
    },
    linhaTempo: { titulo: 'Nossa História', subtitulo: 'Momentos especiais', momentos: [] },
    mapaEstrelas: { texto: 'Sob este céu estrellado, nosso amor nasceu', dataCidade: '' },
    jogoPalavra: { pergunta: 'Qual o nome do meu amor?', palavra: '', mensagemFinal: 'Acertou! Eu te amo!' },
    roleta: { pergunta: 'O que eu mais amo em você?', tema: 'rosa', opcoes: [] }
  })

  const fotoPreviewUrls = useObjectUrls(formData.fotos)

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const updateAudioEspecial = (field, value) => {
    setFormData(prev => ({
      ...prev,
      audioEspecial: { ...prev.audioEspecial, [field]: value }
    }))
  }

  const setAudioFile = (file, previewUrl) => {
    setFormData(prev => {
      if (prev.audioEspecial.previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(prev.audioEspecial.previewUrl)
      }
      return {
        ...prev,
        audioEspecial: { ...prev.audioEspecial, file, previewUrl }
      }
    })
  }

  const clearAudioFile = () => {
    setAudioFile(null, '')
    setAudioError(null)
  }

  const stopAudioStream = () => {
    streamRef.current?.getTracks?.().forEach((track) => track.stop())
    streamRef.current = null
  }

  const stopRecordingTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
  }

  const startRecording = async () => {
    setAudioError(null)
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setAudioError('Seu navegador nao liberou gravacao. Envie um arquivo de audio manualmente.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []
      const mimeType = getSupportedRecordingMimeType(MediaRecorder.isTypeSupported?.bind(MediaRecorder))
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      recorderRef.current = recorder

      recorder.ondataavailable = (event) => {
        if (event.data?.size > 0) chunksRef.current.push(event.data)
      }

      recorder.onerror = () => {
        stopRecordingTimer()
        stopAudioStream()
        setIsRecording(false)
        setAudioError('A gravacao falhou neste navegador. Envie um arquivo de audio manualmente.')
      }

      recorder.onstop = () => {
        stopRecordingTimer()
        stopAudioStream()
        setIsRecording(false)
        try {
          const recordedType = chunksRef.current[0]?.type || mimeType || 'audio/webm'
          const blob = new Blob(chunksRef.current, { type: recordedType })
          if (!blob.size) {
            setAudioError('Nao foi possivel gerar o audio. Tente gravar novamente ou envie um arquivo.')
            return
          }
          const tempFile = { name: 'audio-gravado', type: blob.type, size: blob.size }
          const fileName = `audio-${Date.now()}.${getAudioExtension(tempFile) || 'webm'}`
          const file = typeof File === 'function'
            ? new File([blob], fileName, { type: blob.type || 'audio/webm' })
            : Object.assign(blob, { name: fileName })
          const validation = validateAudioFile(file)
          if (!validation.valid) {
            setAudioError(validation.error)
            return
          }
          setAudioFile(file, URL.createObjectURL(file))
        } catch {
          setAudioError('Nao foi possivel finalizar a gravacao. Tente novamente ou envie um arquivo.')
        }
      }

      recorder.start(1000)
      setRecordingSeconds(0)
      setIsRecording(true)
      timerRef.current = setInterval(() => {
        setRecordingSeconds((seconds) => seconds + 1)
      }, 1000)
    } catch {
      stopRecordingTimer()
      stopAudioStream()
      setIsRecording(false)
      setAudioError('Nao foi possivel acessar o microfone. Voce pode enviar um arquivo de audio.')
    }
  }

  const stopRecording = () => {
    if (recorderRef.current?.state === 'recording') {
      try {
        recorderRef.current.requestData?.()
      } catch {
        // Alguns navegadores mobile nao aceitam requestData antes do stop.
      }
      recorderRef.current.stop()
    }
  }

  const handleAudioUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const validation = validateAudioFile(file)
    if (!validation.valid) {
      setAudioError(validation.error)
      e.target.value = ''
      return
    }
    setAudioError(null)
    setAudioFile(file, URL.createObjectURL(file))
  }

  const recordingLabel = `${String(Math.floor(recordingSeconds / 60)).padStart(2, '0')}:${String(recordingSeconds % 60).padStart(2, '0')}`

  const handleFotoUpload = async (e) => {
    const files = Array.from(e.target.files).slice(0, 6 - formData.fotos.length)
    if (files.length === 0) return

    const newFotos = [...formData.fotos, ...files]
    setFormData(prev => ({ ...prev, fotos: newFotos }))
  }

  const removeFoto = (index) => {
    setFormData(prev => ({
      ...prev,
      fotos: prev.fotos.filter((_, i) => i !== index)
    }))
  }

  const generateSugestao = () => {
    const sugestao = SUGESTOES_MENSAGEM[Math.floor(Math.random() * SUGESTOES_MENSAGEM.length)]
    setFormData(prev => ({ ...prev, mensagem: sugestao }))
  }

  const addMomento = () => {
    setFormData(prev => ({
      ...prev,
      linhaTempo: {
        ...prev.linhaTempo,
        momentos: [...prev.linhaTempo.momentos, { data: '', descricao: '', legenda: '' }]
      }
    }))
  }

  const updateMomento = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      linhaTempo: {
        ...prev.linhaTempo,
        momentos: prev.linhaTempo.momentos.map((m, i) =>
          i === index ? { ...m, [field]: value } : m
        )
      }
    }))
  }

  const removeMomento = (index) => {
    setFormData(prev => ({
      ...prev,
      linhaTempo: {
        ...prev.linhaTempo,
        momentos: prev.linhaTempo.momentos.filter((_, i) => i !== index)
      }
    }))
  }

  const addOpcaoRoleta = () => {
    setFormData(prev => ({
      ...prev,
      roleta: {
        ...prev.roleta,
        opcoes: [...prev.roleta.opcoes, '']
      }
    }))
  }

  const updateOpcaoRoleta = (index, value) => {
    setFormData(prev => ({
      ...prev,
      roleta: {
        ...prev.roleta,
        opcoes: prev.roleta.opcoes.map((o, i) => i === index ? value : o)
      }
    }))
  }

  const removeOpcaoRoleta = (index) => {
    setFormData(prev => ({
      ...prev,
      roleta: {
        ...prev.roleta,
        opcoes: prev.roleta.opcoes.filter((_, i) => i !== index)
      }
    }))
  }

  useEffect(() => {
    return () => {
      stopRecordingTimer()
      stopAudioStream()
      if (formData.audioEspecial.previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(formData.audioEspecial.previewUrl)
      }
    }
  }, [formData.audioEspecial.previewUrl])

  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const slug = generateSlug()

      let fotosUrls = []
      if (formData.fotos.length > 0) {
        for (let i = 0; i < formData.fotos.length; i++) {
          const url = await uploadImage(formData.fotos[i], slug, i)
          fotosUrls.push(url)
        }
      }

      let audioEspecial = null
      if (formData.audioEspecial.file) {
        const audioUpload = await uploadAudio(formData.audioEspecial.file, slug)
        audioEspecial = {
          url: audioUpload.url,
          path: audioUpload.path,
          titulo: formData.audioEspecial.titulo || AUDIO_DEFAULT_TITLE,
          mensagem: formData.audioEspecial.mensagem || AUDIO_DEFAULT_MESSAGE
        }
      }

      const videoId = extractYouTubeId(formData.musicaUrl)

      const presenteData = {
        slug,
        nome_remetente: formData.nomeRemetente,
        nome_destinataria: formData.nomeDestinataria,
        titulo_presente: formData.tituloPresente,
        data_inicio: formData.dataInicio,
        hora_inicio: formData.horaInicio || null,
        cidade: formData.cidade || null,
        mensagem: formData.mensagem,
        musica_url: formData.musicaUrl || null,
        musica_video_id: videoId,
        musica_titulo: formData.musicaTitulo || null,
        musica_artista: formData.musicaArtista || null,
        fotos: fotosUrls,
        linha_tempo: formData.linhaTempo.momentos.length > 0 ? formData.linhaTempo : null,
        mapa_estrelas: formData.mapaEstrelas.texto ? formData.mapaEstrelas : null,
        jogo_palavra: formData.jogoPalavra.palavra ? formData.jogoPalavra : null,
        roleta: formData.roleta.opcoes.length > 0 ? formData.roleta : null,
        audio_especial: audioEspecial
      }

      await savePresente(presenteData)
      navigate(`/sucesso?slug=${slug}`)
    } catch (err) {
      console.error('Erro ao salvar presente:', err)
      if (err.message?.toLowerCase().includes('audio') || err.message?.includes('presentes-audios')) {
        setStep(6)
        setAudioError(err.message)
      }
      setError(err.message || 'Erro ao criar presente. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.nomeRemetente && formData.nomeDestinataria && formData.dataInicio
      case 2:
        return formData.tituloPresente
      case 3:
        return true
      case 4:
        return true
      case 5:
        return formData.mensagem
      case 6:
        return true
      case 7:
        return true
      default:
        return false
    }
  }

  const currentStep = STEP_DETAILS[step] || STEP_DETAILS[1]
  const progress = Math.round((step / STEPS.length) * 100)

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#050307] px-3 py-4 sm:px-4 md:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(244,63,94,.22),transparent_28%),radial-gradient(circle_at_88%_18%,rgba(168,85,247,.18),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(127,29,29,.22),transparent_38%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-gray-300 shadow-lg shadow-black/20 transition hover:border-rose-300/50 hover:text-white"
            aria-label="Voltar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>

          <div className="min-w-0 flex-1">
            <div className="mx-auto flex max-w-md items-center gap-1.5 sm:gap-2">
              {STEPS.map((s) => (
                <div key={s.id} className="flex flex-1 items-center gap-1.5">
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[10px] font-black transition-all duration-300 sm:h-8 sm:w-8 ${
                      s.id === step
                        ? 'scale-105 border-rose-300 bg-gradient-to-br from-rose-500 to-purple-600 text-white shadow-[0_0_24px_rgba(244,63,94,.45)]'
                        : s.id < step
                        ? 'border-emerald-300/40 bg-emerald-400/15 text-emerald-200'
                        : 'border-white/10 bg-white/[0.04] text-white/35'
                    }`}
                  >
                    {s.id < step ? '✓' : s.id}
                  </div>
                  {s.id < STEPS.length && (
                    <div className="hidden h-px flex-1 overflow-hidden rounded-full bg-white/10 sm:block">
                      <div className={`h-full rounded-full bg-gradient-to-r from-rose-500 to-purple-500 transition-all duration-500 ${s.id < step ? 'w-full' : 'w-0'}`} />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mx-auto mt-3 h-1 max-w-md overflow-hidden rounded-full bg-white/10 sm:hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="hidden w-11 sm:block" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="lg:order-1">
            <div className="card-glass glow-card mb-6 w-full max-w-full overflow-hidden shadow-[0_24px_90px_rgba(0,0,0,.45)]">
              <div className="mb-6 flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-rose-300/25 bg-gradient-to-br from-rose-500/25 to-purple-500/20 text-sm font-black text-rose-100 shadow-lg shadow-rose-950/25">
                  {currentStep.icon}
                </span>
                <div className="min-w-0">
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.26em] text-rose-200/70">Etapa {step} de {STEPS.length}</p>
                  <h2 className="font-display text-3xl leading-none text-white">{currentStep.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{currentStep.subtitle}</p>
                </div>
              </div>

              <div className="mb-6 rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-4">
                <Mascote message={GUIDE_MESSAGES[step] || MASCOTE_MESSAGES[step]} mood={currentStep.mood} />
              </div>

              <div key={step} className="creator-step-enter">
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Seu nome *</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.nomeRemetente}
                      onChange={(e) => handleInputChange('nomeRemetente', e.target.value)}
                      placeholder="Seu nome"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Nome da namorada/esposa *</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.nomeDestinataria}
                      onChange={(e) => handleInputChange('nomeDestinataria', e.target.value)}
                      placeholder="Nome dela"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Data de início do relacionamento *</label>
                    <input
                      type="date"
                      className="input-field"
                      value={formData.dataInicio}
                      onChange={(e) => handleInputChange('dataInicio', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Horário (opcional)</label>
                    <input
                      type="time"
                      className="input-field"
                      value={formData.horaInicio}
                      onChange={(e) => handleInputChange('horaInicio', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Cidade (opcional)</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.cidade}
                      onChange={(e) => handleInputChange('cidade', e.target.value)}
                      placeholder="Ex: São Paulo, SP"
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Título do presente *</label>
                    <input
                      type="text"
                      className="input-field text-lg"
                      value={formData.tituloPresente}
                      onChange={(e) => handleInputChange('tituloPresente', e.target.value)}
                      placeholder="Ex: Tu é chata, mas eu te amo"
                    />
                    <p className="text-gray-500 text-xs mt-2">
                      Escolha um título romântico ou divertido que represente vocês
                    </p>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Link da música (YouTube)</label>
                    <input
                      type="url"
                      className="input-field"
                      value={formData.musicaUrl}
                      onChange={(e) => handleInputChange('musicaUrl', e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                    {formData.musicaUrl && extractYouTubeId(formData.musicaUrl) && (
                      <div className="mt-3 p-3 bg-dark-border rounded-lg">
                        <p className="text-green-400 text-sm">✓ vídeo detectado</p>
                        <img
                          src={`https://img.youtube.com/vi/${extractYouTubeId(formData.musicaUrl)}/mqdefault.jpg`}
                          alt="Video preview"
                          className="mt-2 rounded-lg w-full max-w-xs"
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Nome da música (opcional)</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.musicaTitulo}
                      onChange={(e) => handleInputChange('musicaTitulo', e.target.value)}
                      placeholder="Ex: Perfect"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Artista (opcional)</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.musicaArtista}
                      onChange={(e) => handleInputChange('musicaArtista', e.target.value)}
                      placeholder="Ex: Ed Sheeran"
                    />
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">
                      Fotos do casal (até 6)
                    </label>
                    <div className="rounded-[1.5rem] border border-dashed border-rose-300/25 bg-white/[0.035] p-6 text-center shadow-inner shadow-black/30 transition-colors hover:border-rose-300/60 hover:bg-rose-500/5">
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        multiple
                        onChange={handleFotoUpload}
                        className="hidden"
                        id="foto-upload"
                        disabled={formData.fotos.length >= 6}
                      />
                      <label
                        htmlFor="foto-upload"
                        className={`cursor-pointer ${formData.fotos.length >= 6 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="text-4xl mb-2">📷</div>
                        <p className="text-gray-400 text-sm">
                          {formData.fotos.length >= 6
                            ? 'Limite atingido'
                            : 'Clique para selecionar fotos'}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          JPG, PNG ou WEBP
                        </p>
                      </label>
                    </div>
                  </div>

                  {formData.fotos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      {formData.fotos.map((foto, index) => (
                        <div key={index} className="relative">
                          <img
                            src={fotoPreviewUrls[index]}
                            alt={`Foto ${index + 1}`}
                            className="h-24 w-full rounded-2xl border border-white/10 object-cover shadow-lg shadow-black/20"
                          />
                          <button
                            onClick={() => removeFoto(index)}
                            className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-xs text-white shadow-lg"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {step === 5 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Mensagem especial *</label>
                    <textarea
                      className="input-field min-h-[200px]"
                      value={formData.mensagem}
                      onChange={(e) => handleInputChange('mensagem', e.target.value)}
                      placeholder="Escreva algo especial para ela..."
                    />
                    <div className="flex gap-2 mt-3">
                      <button
                        type="button"
                        onClick={generateSugestao}
                        className="btn-secondary text-sm py-2"
                      >
                        Gerar sugestão
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {step === 6 && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Titulo do audio</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.audioEspecial.titulo}
                      onChange={(e) => updateAudioEspecial('titulo', e.target.value)}
                      placeholder={AUDIO_DEFAULT_TITLE}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Mensagem antes do audio</label>
                    <textarea
                      className="input-field min-h-[90px]"
                      value={formData.audioEspecial.mensagem}
                      onChange={(e) => updateAudioEspecial('mensagem', e.target.value)}
                      placeholder={AUDIO_DEFAULT_MESSAGE}
                    />
                  </div>

                  <div className="rounded-[1.5rem] border border-rose-300/15 bg-gradient-to-br from-rose-950/20 to-purple-950/20 p-4 shadow-inner shadow-black/30">
                    <div className="flex flex-col gap-3 sm:flex-row">
                      {!isRecording ? (
                        <button
                          type="button"
                          onClick={startRecording}
                          className="btn-primary min-h-12 flex-1 px-4"
                        >
                          Gravar audio
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={stopRecording}
                          className="min-h-12 flex-1 rounded-full bg-gradient-to-r from-red-500 to-rose-600 px-4 py-3 font-semibold text-white shadow-lg shadow-red-950/30 transition active:scale-95"
                        >
                          Parar gravacao {recordingLabel}
                        </button>
                      )}

                      <label className="btn-secondary min-h-12 flex-1 cursor-pointer px-4 text-center">
                        Enviar arquivo
                        <input
                          type="file"
                          accept="audio/mpeg,audio/wav,audio/webm,audio/mp4,audio/x-m4a,audio/ogg,.mp3,.wav,.webm,.m4a,.mp4,.ogg"
                          onChange={handleAudioUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {isRecording && (
                      <div className="mt-4 flex items-center justify-center gap-1.5">
                        {[16, 26, 18, 32, 22].map((height, index) => (
                          <span key={index} className="w-1.5 rounded-full bg-red-300 animate-pulse" style={{ height, animationDelay: `${index * 0.08}s` }} />
                        ))}
                      </div>
                    )}

                    <p className="mt-3 text-xs text-gray-500">
                      MP3, WAV, WEBM, M4A, MP4 ou OGG. Ate 10MB.
                    </p>

                    {audioError && (
                      <div className="mt-3 rounded-lg border border-red-500 bg-red-500/15 p-3 text-sm text-red-300">
                        {audioError}
                      </div>
                    )}
                  </div>

                  {formData.audioEspecial.previewUrl && (
                    <div className="rounded-[1.5rem] border border-rose-300/25 bg-gradient-to-br from-rose-500/15 to-purple-500/10 p-4 shadow-xl shadow-rose-950/20">
                      <p className="mb-3 text-sm font-semibold text-rose-200">Audio pronto para usar</p>
                      <audio controls src={formData.audioEspecial.previewUrl} className="w-full" />
                      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                        <button
                          type="button"
                          onClick={clearAudioFile}
                          className="btn-secondary flex-1"
                        >
                          Regravar
                        </button>
                        <button
                          type="button"
                          onClick={() => setAudioError(null)}
                          className="btn-primary flex-1"
                        >
                          Usar este audio
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 7 && (
                <div className="max-h-none space-y-6 overflow-visible pr-0 lg:max-h-[500px] lg:overflow-y-auto lg:pr-2">
                  <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.035] p-4 shadow-lg shadow-black/20">
                    <h3 className="font-display text-lg text-white mb-3">📅 Linha do Tempo</h3>
                    <div className="space-y-3 mb-3">
                      <input
                        type="text"
                        className="input-field"
                        value={formData.linhaTempo.titulo}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          linhaTempo: { ...prev.linhaTempo, titulo: e.target.value }
                        }))}
                        placeholder="Título"
                      />
                    </div>
                    {formData.linhaTempo.momentos.map((momento, index) => (
                      <div key={index} className="mb-2 rounded-2xl border border-white/10 bg-black/25 p-3">
                        <input
                          type="date"
                          className="input-field mb-2"
                          value={momento.data}
                          onChange={(e) => updateMomento(index, 'data', e.target.value)}
                        />
                        <input
                          type="text"
                          className="input-field mb-2"
                          value={momento.descricao}
                          onChange={(e) => updateMomento(index, 'descricao', e.target.value)}
                          placeholder="O que aconteceu"
                        />
                        <input
                          type="text"
                          className="input-field mb-2"
                          value={momento.legenda}
                          onChange={(e) => updateMomento(index, 'legenda', e.target.value)}
                          placeholder="Legenda"
                        />
                        <button
                          onClick={() => removeMomento(index)}
                          className="text-red-400 text-sm"
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                    {formData.linhaTempo.momentos.length < 5 && (
                      <button
                        onClick={addMomento}
                        className="text-rose-400 text-sm"
                      >
                        + Adicionar momento
                      </button>
                    )}
                  </div>

                  <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.035] p-4 shadow-lg shadow-black/20">
                    <h3 className="font-display text-lg text-white mb-3">⭐ Mapa das Estrelas</h3>
                    <textarea
                      className="input-field mb-2"
                      value={formData.mapaEstrelas.texto}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        mapaEstrelas: { ...prev.mapaEstrelas, texto: e.target.value }
                      }))}
                      placeholder="Texto do mapa das estrelas"
                    />
                    <input
                      type="text"
                      className="input-field"
                      value={formData.mapaEstrelas.dataCidade}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        mapaEstrelas: { ...prev.mapaEstrelas, dataCidade: e.target.value }
                      }))}
                      placeholder="Data e cidade"
                    />
                  </div>

                  <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.035] p-4 shadow-lg shadow-black/20">
                    <h3 className="font-display text-lg text-white mb-3">🔤 Jogo da Palavra</h3>
                    <input
                      type="text"
                      className="input-field mb-2"
                      value={formData.jogoPalavra.pergunta}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        jogoPalavra: { ...prev.jogoPalavra, pergunta: e.target.value }
                      }))}
                      placeholder="Pergunta/dica"
                    />
                    <input
                      type="text"
                      className="input-field mb-2"
                      value={formData.jogoPalavra.palavra}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        jogoPalavra: { ...prev.jogoPalavra, palavra: e.target.value.toUpperCase() }
                      }))}
                      placeholder="Palavra secreta (3-10 letras)"
                      maxLength={10}
                    />
                    <input
                      type="text"
                      className="input-field"
                      value={formData.jogoPalavra.mensagemFinal}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        jogoPalavra: { ...prev.jogoPalavra, mensagemFinal: e.target.value }
                      }))}
                      placeholder="Mensagem quando acertar"
                    />
                  </div>

                  <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.035] p-4 shadow-lg shadow-black/20">
                    <h3 className="font-display text-lg text-white mb-3">🎡 Roleta do Amor</h3>
                    <input
                      type="text"
                      className="input-field mb-2"
                      value={formData.roleta.pergunta}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        roleta: { ...prev.roleta, pergunta: e.target.value }
                      }))}
                      placeholder="Pergunta da roleta"
                    />
                    <div className="mb-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          roleta: { ...prev.roleta, tema: 'rosa' }
                        }))}
                        className={`px-4 py-2 rounded-full text-sm ${
                          formData.roleta.tema === 'rosa'
                            ? 'bg-rose-500 text-white'
                            : 'bg-dark-border text-gray-400'
                        }`}
                      >
                        🌸 Rosa
                      </button>
                      <button
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          roleta: { ...prev.roleta, tema: 'azul' }
                        }))}
                        className={`px-4 py-2 rounded-full text-sm ${
                          formData.roleta.tema === 'azul'
                            ? 'bg-blue-500 text-white'
                            : 'bg-dark-border text-gray-400'
                        }`}
                      >
                        💙 Azul
                      </button>
                    </div>
                    {formData.roleta.opcoes.map((opcao, index) => (
                      <div key={index} className="mb-2 flex min-w-0 gap-2">
                        <input
                          type="text"
                          className="input-field flex-1"
                          value={opcao}
                          onChange={(e) => updateOpcaoRoleta(index, e.target.value)}
                          placeholder={`Opção ${index + 1}`}
                        />
                        <button
                          onClick={() => removeOpcaoRoleta(index)}
                          className="text-red-400"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {formData.roleta.opcoes.length < 8 && (
                      <button
                        onClick={addOpcaoRoleta}
                        className="text-rose-400 text-sm"
                      >
                        + Adicionar opção
                      </button>
                    )}
                  </div>
                </div>
              )}

              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="mt-6 flex gap-3 border-t border-white/10 pt-5">
                {step > 1 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="btn-secondary min-h-12 flex-1 px-4"
                  >
                    Voltar
                  </button>
                )}
                {step < STEPS.length ? (
                  <button
                    onClick={() => setStep(step + 1)}
                    disabled={!isStepValid()}
                    className={`btn-primary min-h-12 flex-1 px-4 ${!isStepValid() ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Próximo
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!isStepValid() || isLoading}
                    className={`btn-primary min-h-12 flex-1 px-4 ${!isStepValid() || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isLoading ? 'Criando...' : 'Criar Presente'}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="lg:order-2 hidden lg:block">
            <div className="sticky top-8">
              <h3 className="font-display text-xl text-white mb-4 text-center">Prévia ao Vivo</h3>
              <Preview data={formData} />
            </div>
          </div>
        </div>

        <div className="mt-8 lg:hidden">
          <h3 className="font-display text-lg text-white mb-4 text-center">Prévia ao Vivo</h3>
          <Preview data={formData} mobile />
        </div>
      </div>
    </div>
  )
}
