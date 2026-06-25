-- SQL para crear las tablas en Supabase

-- 1. Perfiles
CREATE TABLE perfiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  ff_id TEXT UNIQUE NOT NULL,
  nickname TEXT NOT NULL,
  email TEXT NOT NULL,
  puntos_totales INTEGER DEFAULT 0,
  foto_url TEXT,
  pais TEXT,
  es_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Torneos
CREATE TABLE torneos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('1v1', 'br')),
  estado TEXT DEFAULT 'votacion',
  precio_inscripcion DECIMAL DEFAULT 0.00,
  premio_descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Participantes
CREATE TABLE participantes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  torneo_id UUID REFERENCES torneos(id) ON DELETE CASCADE,
  perfil_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
  metodo_pago TEXT,
  estado_pago TEXT DEFAULT 'pendiente',
  kills INTEGER DEFAULT 0,
  puntos_ganados INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(torneo_id, perfil_id)
);

-- 4. Votos
CREATE TABLE votos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  perfil_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
  tipo_preferido TEXT NOT NULL,
  semana_inicio DATE NOT NULL,
  UNIQUE(perfil_id, semana_inicio)
);

-- RLS (Habilita Row Level Security y añade las políticas en el dashboard de Supabase)
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE torneos ENABLE ROW LEVEL SECURITY;
ALTER TABLE participantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE votos ENABLE ROW LEVEL SECURITY;

-- Políticas Sugeridas:
-- Perfiles: Lectura todos, Inserción auth.uid() = id.
-- Torneos: Lectura todos, Escritura solo admin.
-- Participantes: Lectura todos, Inserción auth.uid() = perfil_id.
-- Votos: Lectura todos, Upsert auth.uid() = perfil_id.
