// Función de ejemplo para procesar votos (Deno / Supabase Edge Functions)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const startOfWeek = new Date()
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
  const weekStr = startOfWeek.toISOString().split('T')[0]

  // Contar votos
  const { data: votos } = await supabase
    .from('votos')
    .select('tipo_preferido')
    .eq('semana_inicio', weekStr)

  if (!votos) return new Response('No hay votos')

  const counts = votos.reduce((acc: any, curr: any) => {
    acc[curr.tipo_preferido] = (acc[curr.tipo_preferido] || 0) + 1
    return acc
  }, {})

  const ganador = counts['1v1'] >= (counts['br'] || 0) ? '1v1' : 'br'

  // Crear torneo ganador
  await supabase.from('torneos').insert({
    titulo: `Torneo Semanal - ${ganador === '1v1' ? 'Duelo' : 'Battle Royale'}`,
    tipo: ganador,
    estado: 'abierto'
  })

  return new Response(`Procesado: Ganador ${ganador}`)
})
