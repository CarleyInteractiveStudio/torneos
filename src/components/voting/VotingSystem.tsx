'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Trophy, Users } from 'lucide-react'

export default function VotingSystem() {
  const [selected, setSelected] = useState<'1v1' | 'br' | null>(null)
  const [loading, setLoading] = useState(false)
  const [voted, setVoted] = useState(false)
  const [timeLeft, setTimeLeft] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      const friday = new Date()
      friday.setDate(now.getDate() + (5 - now.getDay()))
      friday.setHours(16, 0, 0, 0)

      if (now > friday) {
        setTimeLeft('Votación cerrada')
      } else {
        const diff = friday.getTime() - now.getTime()
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
        const mins = Math.floor((diff / (1000 * 60)) % 60)
        setTimeLeft(`${days}d ${hours}h ${mins}m`)
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleVote = async () => {
    if (!selected) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Debes iniciar sesión para votar')
      setLoading(false)
      return
    }

    const startOfWeek = new Date()
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    const weekStr = startOfWeek.toISOString().split('T')[0]

    const { error } = await supabase.from('votos').upsert({
      perfil_id: user.id,
      tipo_preferido: selected,
      semana_inicio: weekStr
    })

    if (error) {
      alert('Error al votar: ' + error.message)
    } else {
      setVoted(true)
    }
    setLoading(false)
  }

  return (
    <div className="bg-gray-900 p-8 rounded-xl border-2 border-red-600 max-w-2xl w-full text-white">
      <h2 className="text-3xl font-black text-center mb-2 italic">ELIGE EL PRÓXIMO TORNEO</h2>
      <p className="text-center text-gray-400 mb-8 uppercase tracking-widest text-sm">La votación termina: <span className="text-red-500 font-bold">{timeLeft}</span></p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <button
          onClick={() => setSelected('1v1')}
          className={`p-6 border-2 rounded-lg flex flex-col items-center gap-4 transition-all ${selected === '1v1' ? 'border-red-500 bg-red-900/20' : 'border-gray-700 hover:border-gray-500'}`}
        >
          <Trophy size={48} className={selected === '1v1' ? 'text-red-500' : 'text-gray-400'} />
          <div className="text-center">
            <h3 className="font-bold text-xl uppercase">Duelo 1v1</h3>
            <p className="text-xs text-gray-400 mt-1">Mínimo 10 jugadores</p>
          </div>
        </button>

        <button
          onClick={() => setSelected('br')}
          className={`p-6 border-2 rounded-lg flex flex-col items-center gap-4 transition-all ${selected === 'br' ? 'border-red-500 bg-red-900/20' : 'border-gray-700 hover:border-gray-500'}`}
        >
          <Users size={48} className={selected === 'br' ? 'text-red-500' : 'text-gray-400'} />
          <div className="text-center">
            <h3 className="font-bold text-xl uppercase">Battle Royale</h3>
            <p className="text-xs text-gray-400 mt-1">Mínimo 30 jugadores</p>
          </div>
        </button>
      </div>

      <button
        onClick={handleVote}
        disabled={loading || !selected || voted || timeLeft === 'Votación cerrada'}
        className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white font-black py-4 rounded uppercase tracking-tighter text-xl transition-all shadow-[0_0_15px_rgba(220,38,38,0.4)]"
      >
        {voted ? '¡VOTO REGISTRADO!' : 'CONFIRMAR VOTO'}
      </button>
    </div>
  )
}
