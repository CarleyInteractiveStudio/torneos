'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TournamentCreator() {
  const [titulo, setTitulo] = useState('')
  const [tipo, setTipo] = useState<'1v1' | 'br'>('1v1')
  const [precio, setPrecio] = useState(0)
  const [premio, setPremio] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('torneos').insert({
      titulo,
      tipo,
      precio_inscripcion: precio,
      premio_descripcion: premio,
      estado: 'abierto'
    })

    if (error) alert(error.message)
    else {
      alert('Torneo creado con éxito')
      setTitulo('')
      setPremio('')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleCreate} className="bg-gray-800 p-6 rounded-lg border border-red-900 flex flex-col gap-4">
      <h3 className="text-xl font-bold text-red-500 uppercase">Crear Nuevo Torneo</h3>

      <input
        placeholder="Título del Torneo"
        value={titulo}
        onChange={e => setTitulo(e.target.value)}
        className="p-2 bg-gray-900 border border-gray-700 rounded"
        required
      />

      <select
        value={tipo}
        onChange={e => setTipo(e.target.value as '1v1' | 'br')}
        className="p-2 bg-gray-900 border border-gray-700 rounded"
      >
        <option value="1v1">1 vs 1 (Duelo)</option>
        <option value="br">Battle Royale</option>
      </select>

      <input
        type="number"
        placeholder="Precio de Inscripción ($)"
        value={precio}
        onChange={e => setPrecio(Number(e.target.value))}
        className="p-2 bg-gray-900 border border-gray-700 rounded"
      />

      <textarea
        placeholder="Descripción del Premio (ej: 500 Diamantes)"
        value={premio}
        onChange={e => setPremio(e.target.value)}
        className="p-2 bg-gray-900 border border-gray-700 rounded"
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-red-600 font-bold py-2 rounded hover:bg-red-700 transition-colors"
      >
        {loading ? 'CREANDO...' : 'LANZAR TORNEO'}
      </button>
    </form>
  )
}
