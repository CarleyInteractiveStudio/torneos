'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function RegisterForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [ffId, setFfId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      const { error: profileError } = await supabase.from('perfiles').insert({
        id: data.user.id,
        email,
        nickname,
        ff_id: ffId,
      })

      if (profileError) {
        setError(profileError.message)
      } else {
        router.push('/profile')
      }
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleRegister} className="flex flex-col gap-4 max-w-md mx-auto p-6 bg-gray-900 text-white rounded-lg border border-red-600">
      <h2 className="text-2xl font-bold text-center text-red-500 uppercase">Registro de Guerrero</h2>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 bg-gray-800 border border-gray-700 rounded focus:border-red-500 outline-none"
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold">Nickname de Free Fire</label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="p-2 bg-gray-800 border border-gray-700 rounded focus:border-red-500 outline-none"
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold">ID de Free Fire (No se puede cambiar después)</label>
        <input
          type="text"
          value={ffId}
          onChange={(e) => setFfId(e.target.value)}
          className="p-2 bg-gray-800 border border-gray-700 rounded focus:border-red-500 outline-none"
          required
        />
        <p className="text-[10px] text-gray-400">Asegúrate de que el ID esté correcto.</p>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold">Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 bg-gray-800 border border-gray-700 rounded focus:border-red-500 outline-none"
          required
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded transition-colors disabled:opacity-50"
      >
        {loading ? 'Registrando...' : 'UNIRSE A LA BATALLA'}
      </button>
    </form>
  )
}
