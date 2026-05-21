-- Bootstrap PostgreSQL extensions required by NHPMBR.
-- Runs once on first container start, before Alembic migrations.
-- The Alembic migration `0001` redefines these idempotently, so this file
-- is a convenience to make psql usable before any migration runs.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- UUIDv7 helper. Postgres 17 ships this natively; on 16 we provide a
-- portable plpgsql implementation that is RFC 9562 compliant (sortable
-- timestamps + random tail, version=7, RFC 4122 variant).
CREATE OR REPLACE FUNCTION public.uuid_generate_v7()
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
    unix_ts_ms bytea;
    uuid_bytes bytea;
BEGIN
    unix_ts_ms := substring(int8send(
        (extract(epoch from clock_timestamp()) * 1000)::bigint
    ) FROM 3);

    uuid_bytes := unix_ts_ms || gen_random_bytes(10);

    uuid_bytes := set_byte(uuid_bytes, 6,
        (get_byte(uuid_bytes, 6) & 15) | 112);
    uuid_bytes := set_byte(uuid_bytes, 8,
        (get_byte(uuid_bytes, 8) & 63) | 128);

    RETURN encode(uuid_bytes, 'hex')::uuid;
END;
$$;
