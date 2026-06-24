-- Esquema de Base de Datos para Torneos Free Fire

-- 1. Tabla de Perfiles
CREATE TABLE perfiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  ff_id TEXT UNIQUE NOT NULL,
  nickname TEXT NOT NULL,
  email TEXT NOT NULL,
  puntos_totales INTEGER DEFAULT 0,
  foto_url TEXT,
  es_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Tabla de Torneos
CREATE TYPE tipo_torneo AS ENUM ('1v1', 'br');
CREATE TYPE estado_torneo AS ENUM ('votacion', 'abierto', 'en_progreso', 'finalizado');

CREATE TABLE torneos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  tipo tipo_torneo NOT NULL,
  estado estado_torneo DEFAULT 'votacion',
  precio_inscripcion DECIMAL(10,2) DEFAULT 0.00,
  premio_descripcion TEXT,
  min_participantes INTEGER DEFAULT 10,
  max_participantes INTEGER DEFAULT 50,
  fecha_inicio TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Tabla de Votos (Sistema de votación semanal)
CREATE TABLE votos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  perfil_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
  tipo_preferido tipo_torneo NOT NULL,
  semana_inicio DATE NOT NULL, -- Para identificar la votación de la semana
  UNIQUE(perfil_id, semana_inicio)
);

-- 4. Tabla de Participantes (Inscripciones)
CREATE TYPE estado_pago AS ENUM ('pendiente', 'completado', 'rechazado');

CREATE TABLE participantes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  torneo_id UUID REFERENCES torneos(id) ON DELETE CASCADE,
  perfil_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
  metodo_pago TEXT, -- 'paypal' o 'efectivo'
  estado_pago estado_pago DEFAULT 'pendiente',
  puntos_ganados INTEGER DEFAULT 0,
  posicion_final INTEGER,
  kills INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(torneo_id, perfil_id)
);

-- 5. Tabla de Enfrentamientos (Para 1v1)
CREATE TABLE enfrentamientos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  torneo_id UUID REFERENCES torneos(id) ON DELETE CASCADE,
  ronda INTEGER NOT NULL,
  jugador1_id UUID REFERENCES perfiles(id),
  jugador2_id UUID REFERENCES perfiles(id),
  ganador_id UUID REFERENCES perfiles(id),
  orden INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS (Row Level Security)
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE torneos ENABLE ROW LEVEL SECURITY;
ALTER TABLE votos ENABLE ROW LEVEL SECURITY;
ALTER TABLE participantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE enfrentamientos ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (Lectura pública para algunos, escritura protegida)
CREATE POLICY "Perfiles visibles por todos" ON perfiles FOR SELECT USING (true);
CREATE POLICY "Usuarios pueden insertar su propio perfil" ON perfiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins pueden actualizar perfiles" ON perfiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND es_admin = true)
);

CREATE POLICY "Torneos visibles por todos" ON torneos FOR SELECT USING (true);
CREATE POLICY "Admins pueden insertar torneos" ON torneos FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND es_admin = true)
);

CREATE POLICY "Participantes visibles por todos" ON participantes FOR SELECT USING (true);
CREATE POLICY "Usuarios pueden inscribirse" ON participantes FOR INSERT WITH CHECK (auth.uid() = perfil_id);
CREATE POLICY "Admins pueden actualizar participantes" ON participantes FOR UPDATE USING (
  EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND es_admin = true)
);

CREATE POLICY "Votos visibles por todos" ON votos FOR SELECT USING (true);
CREATE POLICY "Usuarios pueden votar" ON votos FOR INSERT WITH CHECK (auth.uid() = perfil_id);

CREATE POLICY "Enfrentamientos visibles por todos" ON enfrentamientos FOR SELECT USING (true);
