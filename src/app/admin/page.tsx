import TournamentCreator from '@/components/admin/TournamentCreator'
import UserManagement from '@/components/admin/UserManagement'
import ResultsManager from '@/components/admin/ResultsManager'
import AdminActions from '@/components/admin/AdminDashboard'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('perfiles')
    .select('es_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.es_admin) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <h1 className="text-3xl font-bold text-red-600">ACCESO DENEGADO - SOLO ADMINS</h1>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black text-red-600 mb-8 italic uppercase tracking-tighter">Panel de Comandante</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <TournamentCreator />
          <UserManagement />
          <ResultsManager />
          <AdminActions />
        </div>
      </div>
    </div>
  )
}
