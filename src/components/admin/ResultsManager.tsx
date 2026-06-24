'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ResultsManager() {
  const [torneos, setTorneos] = useState<any[]>([])
  const [selectedTorneo, setSelectedTorneo] = useState<string | null>(null)
  const [participantes, setParticipantes] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    fetchActiveTournaments()
  }, [])

  const fetchActiveTournaments = async () => {
    const { data } = await supabase
      .from('torneos')
      .select('*')
      .eq('estado', 'abierto')
    if (data) setTorneos(data)
  }

  const fetchParticipantes = async (torneoId: string) => {
    const { data } = await supabase
      .from('participantes')
      .select('*, perfiles(nickname, id)')
      .eq('torneo_id', torneoId)
      .eq('estado_pago', 'completado')
    if (data) setParticipantes(data)
  }

  const handleAddKill = async (pId: string, currentKills: number, profileId: string) => {
    // 1. Update participant kills
    await supabase
      .from('participantes')
      .update({ kills: currentKills + 1, puntos_ganados: (currentKills + 1) * 10 })
      .eq('id', pId)

    // 2. Update global profile points
    const { data: profile } = await supabase.from('perfiles').select('puntos_totales').eq('id', profileId).single()
    await supabase
      .from('perfiles')
      .update({ puntos_totales: (profile?.puntos_totales || 0) + 10 })
      .eq('id', profileId)

    if (selectedTorneo) fetchParticipantes(selectedTorneo)
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-red-900 mt-6 col-span-full">
      <h3 className="text-xl font-bold text-red-500 uppercase mb-4">Gestionar Resultados de Torneo</h3>

      <select
        onChange={(e) => {
          setSelectedTorneo(e.target.value)
          fetchParticipantes(e.target.value)
        }}
        className="w-full p-2 bg-gray-900 border border-gray-700 rounded mb-4"
      >
        <option value="">Selecciona un torneo activo...</option>
        {torneos.map(t => <option key={t.id} value={t.id}>{t.titulo}</option>)}
      </select>

      {selectedTorneo && (
        <div className="space-y-2">
          {participantes.map(p => (
            <div key={p.id} className="flex justify-between items-center bg-black/30 p-3 rounded border border-gray-800">
              <span className="font-bold">{p.perfiles.nickname}</span>
              <div className="flex items-center gap-4">
                <span className="text-gray-400">Kills: {p.kills}</span>
                <button
                  onClick={() => handleAddKill(p.id, p.kills, p.perfiles.id)}
                  className="bg-red-600 px-3 py-1 rounded text-xs font-bold hover:bg-red-700"
                >
                  +1 KILL (10 pts)
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
