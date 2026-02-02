-- ARCHIVO: apps/api/scripts/manual_migration_relations.sql
-- Ejecuta este script manualmente en el Editor SQL de Supabase para crear las tablas intermedias faltantes.

-- 1. Tabla intermedia para asignar Regiones a Usuarios
CREATE TABLE IF NOT EXISTS "_UserAssignedRegions" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_UserAssignedRegions_AB_unique" UNIQUE ("A", "B"),
    FOREIGN KEY ("A") REFERENCES "regions"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "_UserAssignedRegions_B_index" ON "_UserAssignedRegions"("B");

-- 2. Tabla intermedia para asignar Municipios a Usuarios
CREATE TABLE IF NOT EXISTS "_UserAssignedMunicipalities" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_UserAssignedMunicipalities_AB_unique" UNIQUE ("A", "B"),
    FOREIGN KEY ("A") REFERENCES "municipalities"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "_UserAssignedMunicipalities_B_index" ON "_UserAssignedMunicipalities"("B");

-- 3. Tabla intermedia para asignar Veredas a Usuarios
CREATE TABLE IF NOT EXISTS "_UserAssignedVeredas" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_UserAssignedVeredas_AB_unique" UNIQUE ("A", "B"),
    FOREIGN KEY ("A") REFERENCES "veredas"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "_UserAssignedVeredas_B_index" ON "_UserAssignedVeredas"("B");
