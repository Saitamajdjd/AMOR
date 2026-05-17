import { useSearchParams, Link } from 'react-router-dom'
import { useState } from 'react'
import Mascote from '../components/Mascote'

export default function Success() {
  const [searchParams] = useSearchParams()
  const slug = searchParams.get('slug') || ''
  const [copied, setCopied] = useState(false)

  const baseUrl = window.location.origin
  const giftUrl = `${baseUrl}/presente/${slug}`

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(giftUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="max-w-lg mx-auto text-center">
        <div className="mb-8">
          <Mascote message="Pronto! Aqui está o link para enviar para sua namorada." />
        </div>

        <h1 className="font-display text-3xl md:text-4xl text-white mb-4 glow-text">
          Presente criado com sucesso!
        </h1>

        <p className="text-gray-400 mb-8">
          Agora é só enviar este link para ela e esperar o sorriso lovel.
        </p>

        <div className="card-glass glow-card mb-6">
          <label className="block text-gray-400 text-sm mb-2">Link do presente</label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={giftUrl}
              className="input-field flex-1 text-sm truncate"
            />
            <button
              onClick={copyLink}
              className="btn-primary px-4 py-2 whitespace-nowrap"
            >
              {copied ? '✓ Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to={giftUrl}
            target="_blank"
            className="btn-primary flex-1 text-center"
          >
            Abrir presente
          </Link>
          <Link
            to="/criar"
            className="btn-secondary flex-1 text-center"
          >
            Criar outro
          </Link>
        </div>

        <div className="mt-10 p-4 bg-purple-900/20 border border-purple-500/30 rounded-xl">
          <p className="text-purple-300 text-sm">
            💡 Dica: Compartilhe o link no WhatsApp, Instagram ou mande por mensagem de texto!
          </p>
        </div>
      </div>
    </div>
  )
}