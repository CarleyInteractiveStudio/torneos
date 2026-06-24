export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      perfiles: {
        Row: {
          id: string
          ff_id: string
          nickname: string
          email: string
          puntos_totales: number
          foto_url: string | null
          es_admin: boolean
          created_at: string
        }
        Insert: {
          id: string
          ff_id: string
          nickname: string
          email: string
          puntos_totales?: number
          foto_url?: string | null
          es_admin?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          ff_id?: string
          nickname?: string
          email?: string
          puntos_totales?: number
          foto_url?: string | null
          es_admin?: boolean
          created_at?: string
        }
      }
      torneos: {
        Row: {
          id: string
          titulo: string
          tipo: '1v1' | 'br'
          estado: 'votacion' | 'abierto' | 'en_progreso' | 'finalizado'
          precio_inscripcion: number
          premio_descripcion: string | null
          min_participantes: number
          max_participantes: number
          fecha_inicio: string | null
          created_at: string
        }
      }
      // ... añadir el resto conforme sea necesario
    }
  }
}
