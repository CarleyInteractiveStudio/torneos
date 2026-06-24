import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { User, Shield, Target } from 'lucide-react'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/register')

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-900 border border-red-600 rounded-3xl p-8 shadow-[0_0_50px_rgba(220,38,38,0.15)]">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <div className="w-32 h-32 bg-gray-800 rounded-full border-4 border-red-600 flex items-center justify-center overflow-hidden">
                {perfil?.foto_url ? (
                  <img src={perfil.foto_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={64} className="text-gray-600" />
                )}
              </div>
              {perfil?.es_admin && (
                <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black p-1 rounded-full border-2 border-black">
                  <Shield size={20} />
                </div>
              )}
            </div>

            <div className="text-center md:text-left flex-grow">
              <h1 className="text-4xl font-black uppercase italic tracking-tighter">{perfil?.nickname}</h1>
              <p className="text-red-500 font-mono font-bold mt-1">ID: {perfil?.ff_id}</p>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-black/50 p-4 rounded-xl border border-gray-800">
                  <p className="text-gray-500 text-xs uppercase font-bold">Puntos Totales</p>
                  <p className="text-2xl font-black text-white">{perfil?.puntos_totales}</p>
                </div>
                <div className="bg-black/50 p-4 rounded-xl border border-gray-800">
                  <p className="text-gray-500 text-xs uppercase font-bold">Nivel Guerrero</p>
                  <p className="text-2xl font-black text-red-500">{(perfil?.puntos_totales || 0) > 1000 ? 'HEROICO' : 'PLATINO'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
