'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Check, X } from 'lucide-react'

export default function UserManagement() {
  const [pendingPayments, setPendingPayments] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    const { data } = await supabase
      .from('participantes')
      .select('*, perfiles(nickname, ff_id), torneos(titulo)')
      .eq('estado_pago', 'pendiente')

    if (data) setPendingPayments(data)
  }

  const handleApprove = async (id: string) => {
    const { error } = await supabase
      .from('participantes')
      .update({ estado_pago: 'completado' })
      .eq('id', id)

    if (!error) fetchPayments()
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-red-900 mt-6">
      <h3 className="text-xl font-bold text-red-500 uppercase mb-4">Validar Pagos Manuales</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="p-2">Jugador</th>
              <th className="p-2">FF ID</th>
              <th className="p-2">Torneo</th>
              <th className="p-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pendingPayments.map((p) => (
              <tr key={p.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                <td className="p-2">{p.perfiles.nickname}</td>
                <td className="p-2 text-gray-400">{p.perfiles.ff_id}</td>
                <td className="p-2">{p.torneos.titulo}</td>
                <td className="p-2 flex justify-end gap-2">
                  <button onClick={() => handleApprove(p.id)} className="bg-green-600 p-1 rounded hover:bg-green-700">
                    <Check size={18} />
                  </button>
                  <button className="bg-red-600 p-1 rounded hover:bg-red-700">
                    <X size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pendingPayments.length === 0 && <p className="text-center text-gray-500 py-4">No hay pagos pendientes.</p>}
      </div>
    </div>
  )
}
