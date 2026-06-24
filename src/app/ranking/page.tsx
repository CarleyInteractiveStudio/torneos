import { createClient } from '@/lib/supabase/server'
import { Trophy, Medal } from 'lucide-react'

export default async function RankingPage() {
  const supabase = await createClient()

  const { data: ranking } = await supabase
    .from('perfiles')
    .select('nickname, puntos_totales, foto_url')
    .order('puntos_totales', { ascending: false })
    .limit(50)

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black text-center text-red-600 mb-12 uppercase italic">Top Mundial de Guerreros</h1>

        <div className="bg-gray-900 border border-red-900 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(153,27,27,0.2)]">
          <table className="w-full text-left">
            <thead className="bg-red-900/50">
              <tr>
                <th className="p-4 text-sm font-bold uppercase tracking-widest">Posición</th>
                <th className="p-4 text-sm font-bold uppercase tracking-widest">Guerrero</th>
                <th className="p-4 text-sm font-bold uppercase tracking-widest text-right">Puntos Totales</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {ranking?.map((user, index) => (
                <tr key={user.nickname} className="hover:bg-gray-800/50 transition-colors">
                  <td className="p-4 font-bold">
                    {index === 0 ? <Trophy className="text-yellow-500 inline mr-2" size={20} /> : index + 1}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center border border-red-500 overflow-hidden">
                        {user.foto_url ? <img src={user.foto_url} alt="Profile" /> : <Medal className="text-gray-500" size={24} />}
                      </div>
                      <span className="font-bold">{user.nickname}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right font-mono text-xl text-red-500 font-bold">
                    {user.puntos_totales.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
