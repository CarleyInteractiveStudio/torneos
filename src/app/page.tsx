import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Trophy, Users, Sword, Shield, LogIn } from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-900/20 to-black z-10" />
        <div className="relative z-20 text-center px-4">
          <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase mb-4 animate-pulse">
            FF <span className="text-red-600">ARENA</span> RD
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 uppercase tracking-widest mb-8">
            Domina el campo, gana diamantes, sé una leyenda
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/torneos" className="bg-red-600 hover:bg-red-700 text-white font-black px-8 py-4 rounded-full transition-all flex items-center gap-2 text-lg">
              <Sword size={24} /> VER TORNEOS
            </Link>
            {!user ? (
              <Link href="/register" className="bg-white hover:bg-gray-200 text-black font-black px-8 py-4 rounded-full transition-all flex items-center gap-2 text-lg">
                <LogIn size={24} /> UNIRSE AHORA
              </Link>
            ) : (
              <Link href="/perfil" className="bg-gray-800 hover:bg-gray-700 text-white font-black px-8 py-4 rounded-full transition-all flex items-center gap-2 text-lg">
                <Shield size={24} /> MI PERFIL
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Features */}
      <section className="py-20 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="text-center p-8 bg-gray-900/50 rounded-3xl border border-gray-800">
          <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
            <Trophy size={32} />
          </div>
          <h3 className="text-2xl font-bold mb-4 uppercase">Premios Reales</h3>
          <p className="text-gray-400">Gana Pases Booyah y miles de diamantes cada fin de semana.</p>
        </div>
        <div className="text-center p-8 bg-gray-900/50 rounded-3xl border border-gray-800">
          <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 -rotate-3">
            <Users size={32} />
          </div>
          <h3 className="text-2xl font-bold mb-4 uppercase">Comunidad RD</h3>
          <p className="text-gray-400">Compite contra los mejores jugadores de República Dominicana.</p>
        </div>
        <div className="text-center p-8 bg-gray-900/50 rounded-3xl border border-gray-800">
          <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
            <Sword size={32} />
          </div>
          <h3 className="text-2xl font-bold mb-4 uppercase">Votación Semanal</h3>
          <p className="text-gray-400">Tú decides el modo de juego: ¿Duelo 1v1 o Battle Royale?</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-900 text-center text-gray-500">
        <p>© 2024 FF ARENA RD - TORNEOS NO OFICIALES</p>
      </footer>
    </main>
  )
}
