import TournamentList from '@/components/tournaments/TournamentList'

export default function TorneosPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-black text-red-600 italic tracking-tighter uppercase mb-2">CAMPOS DE BATALLA</h1>
          <p className="text-gray-400 uppercase tracking-widest text-sm">Elige tu destino y demuestra quién es el mejor</p>
        </header>

        <TournamentList />
      </div>
    </div>
  )
}
