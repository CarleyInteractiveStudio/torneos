'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function RecoveryPage() {
  const [email, setEmail] = useState('')
  const [ffId, setFfId] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setError(null)

    // Validar que el ID de FF coincide con el correo (opcional pero solicitado por el usuario)
    const { data, error: profileError } = await supabase
      .from('perfiles')
      .select('id')
      .eq('email', email)
      .eq('ff_id', ffId)
      .single()

    if (profileError || !data) {
      setError('Los datos no coinciden con nuestros registros.')
      return
    }

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email)

    if (resetError) {
      setError(resetError.message)
    } else {
      setMessage('Se ha enviado un enlace de recuperación a tu correo.')
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 text-white">
      <form onSubmit={handleRecovery} className="flex flex-col gap-4 max-w-md w-full p-6 bg-gray-900 rounded-lg border border-red-600">
        <h2 className="text-2xl font-bold text-center text-red-500 uppercase">Recuperar Acceso</h2>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold">Email Registrado</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-2 bg-gray-800 border border-gray-700 rounded outline-none"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold">ID de Free Fire</label>
          <input
            type="text"
            value={ffId}
            onChange={(e) => setFfId(e.target.value)}
            className="p-2 bg-gray-800 border border-gray-700 rounded outline-none"
            required
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {message && <p className="text-green-500 text-sm">{message}</p>}

        <button
          type="submit"
          className="bg-red-600 hover:bg-red-700 font-bold py-2 rounded transition-colors"
        >
          ENVIAR ENLACE
        </button>
      </form>
    </div>
  )
}
