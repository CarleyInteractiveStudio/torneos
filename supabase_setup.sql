-- SQL para configurar o actualizar las tablas en Supabase

-- 1. Perfiles (Usando IF NOT EXISTS para evitar errores si ya existen)
CREATE TABLE IF NOT EXISTS perfiles (
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

-- Asegurar que las columnas nuevas existan si la tabla ya existía
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='perfiles' AND column_name='pais') THEN
    ALTER TABLE perfiles ADD COLUMN pais TEXT;
  END IF;
END $$;

-- 2. Torneos
CREATE TABLE IF NOT EXISTS torneos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('1v1', 'br')),
  estado TEXT DEFAULT 'votacion',
  precio_inscripcion DECIMAL DEFAULT 0.00,
  premio_descripcion TEXT,
  max_participantes INTEGER DEFAULT 50,
  link_youtube_live TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Participantes
CREATE TABLE IF NOT EXISTS participantes (
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
CREATE TABLE IF NOT EXISTS votos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  perfil_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
  tipo_preferido TEXT NOT NULL,
  semana_inicio DATE NOT NULL,
  UNIQUE(perfil_id, semana_inicio)
);

-- 5. Mensajes de Soporte
CREATE TABLE IF NOT EXISTS mensajes_soporte (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  perfil_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
  mensaje TEXT NOT NULL,
  asunto TEXT,
  leido BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Historial de Temporadas
CREATE TABLE IF NOT EXISTS historial_temporadas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mes_anio TEXT NOT NULL,
  perfil_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
  puntos_acumulados INTEGER NOT NULL,
  posicion INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HABILITAR RLS
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE torneos ENABLE ROW LEVEL SECURITY;
ALTER TABLE participantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE votos ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensajes_soporte ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_temporadas ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS (Usando DROP POLICY IF EXISTS para que se puedan re-ejecutar)

-- Perfiles
DROP POLICY IF EXISTS "Perfiles legibles por todos" ON perfiles;
CREATE POLICY "Perfiles legibles por todos" ON perfiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Usuarios pueden insertar su propio perfil" ON perfiles;
CREATE POLICY "Usuarios pueden insertar su propio perfil" ON perfiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON perfiles;
CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON perfiles FOR UPDATE USING (auth.uid() = id);

-- Torneos
DROP POLICY IF EXISTS "Torneos legibles por todos" ON torneos;
CREATE POLICY "Torneos legibles por todos" ON torneos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Solo admin puede editar torneos" ON torneos;
CREATE POLICY "Solo admin puede editar torneos" ON torneos FOR ALL USING (
  EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND es_admin = true)
);

-- Participantes
DROP POLICY IF EXISTS "Participantes legibles por todos" ON participantes;
CREATE POLICY "Participantes legibles por todos" ON participantes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Usuarios pueden inscribirse ellos mismos" ON participantes;
CREATE POLICY "Usuarios pueden inscribirse ellos mismos" ON participantes FOR INSERT WITH CHECK (auth.uid() = perfil_id);

-- Mensajes Soporte
DROP POLICY IF EXISTS "Usuarios pueden enviar soporte" ON mensajes_soporte;
CREATE POLICY "Usuarios pueden enviar soporte" ON mensajes_soporte FOR INSERT WITH CHECK (auth.uid() = perfil_id);

DROP POLICY IF EXISTS "Admin puede leer todos los mensajes" ON mensajes_soporte;
CREATE POLICY "Admin puede leer todos los mensajes" ON mensajes_soporte FOR SELECT USING (
  EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND es_admin = true) OR auth.uid() = perfil_id
);
