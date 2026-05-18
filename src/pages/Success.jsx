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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050307] p-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(244,63,94,.28),transparent_30%),radial-gradient(circle_at_80%_80%,rgba(168,85,247,.22),transparent_34%)]" />
      <div className="relative z-10 mx-auto max-w-lg text-center">
        <div className="mb-6 rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/30">
          <Mascote message="Pronto! Agora e so mandar o link e esperar o sorriso." mood="success" />
        </div>

        <h1 className="font-display mb-4 text-4xl leading-none text-white glow-text md:text-5xl">
          Presente criado com sucesso!
        </h1>

        <p className="mb-8 text-white/60">
          Pronto! Seu presente ficou lindo. Aqui esta o link para enviar para quem voce ama.
        </p>

        <div className="card-glass glow-card mb-6 shadow-[0_24px_90px_rgba(0,0,0,.45)]">
          <label className="mb-2 block text-sm font-semibold text-rose-100/70">Link do presente</label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              readOnly
              value={giftUrl}
              className="input-field flex-1 truncate text-sm"
            />
            <button
              onClick={copyLink}
              className="btn-primary whitespace-nowrap px-5 py-3"
            >
              {copied ? 'Copiado!' : 'Copiar link'}
            </button>
          </div>
          {copied && (
            <p className="mt-3 rounded-full bg-emerald-400/10 px-3 py-2 text-sm font-semibold text-emerald-200">
              Link copiado para a area de transferencia.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
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

        <div className="mt-10 rounded-2xl border border-purple-400/20 bg-purple-500/10 p-4">
          <p className="text-sm text-purple-200">
            Dica: compartilhe no WhatsApp, Instagram ou envie por mensagem.
          </p>
        </div>
      </div>
    </div>
  )
}
