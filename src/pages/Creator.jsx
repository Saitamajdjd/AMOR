import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Mascote from '../components/Mascote'
import Preview from '../components/Preview'
import { uploadImage, savePresente, extractYouTubeId } from '../lib/supabase'

const STEPS = [
  { id: 1, title: 'Dados do Casal', icon: '💕' },
  { id: 2, title: 'Título', icon: '✨' },
  { id: 3, title: 'Música', icon: '🎵' },
  { id: 4, title: 'Fotos', icon: '📸' },
  { id: 5, title: 'Mensagem', icon: '💌' },
  { id: 6, title: 'Extras', icon: '🎁' }
]

const MASCOTE_MESSAGES = {
  1: "Calma aí, romântico... primeiro me conta quem são vocês.",
  2: "Agora escolhe um título que vai fazer ela sorrir.",
  3: "Agora escolhe aquela música que lembra ela.",
  4: "Manda as fotos que vão fazer ela sorrir.",
  5: "Agora escreve aquela mensagem que bate no coração.",
  6: "Quase pronto! Adicione os extras para deixar tudo mais especial."
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

export default function Creator() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

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
    linhaTempo: { titulo: 'Nossa História', subtitulo: 'Momentos especiais', momentos: [] },
    mapaEstrelas: { texto: 'Sob este céu estrellado, nosso amor nasceu', dataCidade: '' },
    jogoPalavra: { pergunta: 'Qual o nome do meu amor?', palavra: '', mensagemFinal: 'Acertou! Eu te amo!' },
    roleta: { pergunta: 'O que eu mais amo em você?', tema: 'rosa', opcoes: [] }
  })

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

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
        roleta: formData.roleta.opcoes.length > 0 ? formData.roleta : null
      }

      await savePresente(presenteData)
      navigate(`/sucesso?slug=${slug}`)
    } catch (err) {
      console.error('Erro ao salvar presente:', err)
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
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>

          <div className="flex gap-2">
            {STEPS.map((s) => (
              <div
                key={s.id}
                className={`w-3 h-3 rounded-full transition-all ${
                  s.id === step
                    ? 'bg-rose-500 scale-125'
                    : s.id < step
                    ? 'bg-rose-800'
                    : 'bg-dark-border'
                }`}
              />
            ))}
          </div>

          <div className="w-6" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="lg:order-1">
            <div className="card-glass glow-card mb-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">{STEPS[step - 1].icon}</span>
                <h2 className="font-display text-2xl text-white">{STEPS[step - 1].title}</h2>
              </div>

              <div className="mb-6">
                <Mascote message={MASCOTE_MESSAGES[step]} />
              </div>

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
                    <div className="border-2 border-dashed border-dark-border rounded-xl p-6 text-center hover:border-rose-500/50 transition-colors">
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
                    <div className="grid grid-cols-3 gap-2">
                      {formData.fotos.map((foto, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(foto)}
                            alt={`Foto ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removeFoto(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
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
                <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                  <div className="border border-dark-border rounded-xl p-4">
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
                      <div key={index} className="bg-dark-border/50 rounded-lg p-3 mb-2">
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

                  <div className="border border-dark-border rounded-xl p-4">
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

                  <div className="border border-dark-border rounded-xl p-4">
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

                  <div className="border border-dark-border rounded-xl p-4">
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
                    <div className="flex gap-2 mb-3">
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
                      <div key={index} className="flex gap-2 mb-2">
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

              {error && (
                <div className="mt-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                {step > 1 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="btn-secondary flex-1"
                  >
                    Voltar
                  </button>
                )}
                {step < 6 ? (
                  <button
                    onClick={() => setStep(step + 1)}
                    disabled={!isStepValid()}
                    className={`btn-primary flex-1 ${!isStepValid() ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Próximo
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!isStepValid() || isLoading}
                    className={`btn-primary flex-1 ${!isStepValid() || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
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

        <div className="lg:hidden mt-8">
          <h3 className="font-display text-lg text-white mb-4 text-center">Prévia ao Vivo</h3>
          <Preview data={formData} mobile />
        </div>
      </div>
    </div>
  )
}