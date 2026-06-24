'use client'

import { createClient } from '@/lib/supabase/client'
import { Zap } from 'lucide-react'

export default function AdminActions() {
  const supabase = createClient()

  const handleProcessVoting = async () => {
    const { data, error } = await supabase.functions.invoke('process-voting')
    if (error) alert('Error al procesar: ' + error.message)
    else alert('Votación procesada: Torneo semanal creado.')
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-yellow-600 mt-6 col-span-full">
      <h3 className="text-xl font-bold text-yellow-500 uppercase mb-4 flex items-center gap-2">
        <Zap size={20} /> Acciones Rápidas
      </h3>
      <button
        onClick={handleProcessVoting}
        className="bg-yellow-600 hover:bg-yellow-700 text-black font-black py-2 px-4 rounded transition-colors"
      >
        CERRAR VOTACIÓN Y CREAR TORNEO AHORA
      </button>
    </div>
  )
}
