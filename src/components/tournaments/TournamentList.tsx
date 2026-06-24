'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Trophy, Calendar, DollarSign } from 'lucide-react'

export default function TournamentList() {
  const [torneos, setTorneos] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    const fetchTorneos = async () => {
      const { data } = await supabase
        .from('torneos')
        .select('*')
        .eq('estado', 'abierto')
        .order('created_at', { ascending: false })

      if (data) setTorneos(data)
    }
    fetchTorneos()
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {torneos.map((t) => (
        <div key={t.id} className="bg-gray-900 border border-red-600 rounded-lg overflow-hidden flex flex-col">
          <div className="bg-red-600 p-2 text-center font-bold uppercase text-sm tracking-widest">
            {t.tipo === '1v1' ? 'DUELO 1 VS 1' : 'BATTLE ROYALE'}
          </div>
          <div className="p-6 flex-grow">
            <h3 className="text-2xl font-black mb-4 uppercase">{t.titulo}</h3>
            <div className="space-y-2 text-gray-300">
              <div className="flex items-center gap-2">
                <Trophy size={18} className="text-yellow-500" />
                <span>Premio: {t.premio_descripcion}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign size={18} className="text-green-500" />
                <span>Inscripción: ${t.precio_inscripcion}</span>
              </div>
            </div>
          </div>
          <button className="w-full bg-white text-black font-black py-3 hover:bg-gray-200 transition-colors uppercase">
            Inscribirse Ahora
          </button>
        </div>
      ))}
      {torneos.length === 0 && <p className="text-gray-500 col-span-full text-center">No hay torneos abiertos en este momento.</p>}
    </div>
  )
}
