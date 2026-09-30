#!/usr/bin/env bash
# Applies every migration, in order, to a throwaway local Postgres with Supabase's roles and
# auth stubbed (local/stub.sql), then runs local/checks.sql against the result. For testing
# a migration before `supabase db push`, which can't be undone on the live project.
#
#   brew install postgresql@17 && supabase/tests/local_migrations.sh
#
# The cluster lives in a new temporary directory and is stopped at the end.
set -euo pipefail
cd "$(dirname "$0")/../.."
# Without a locale, Postgres on macOS refuses to start ("postmaster became multithreaded").
export LC_ALL="${LC_ALL:-en_US.UTF-8}"
PG="${PG_BIN:-/opt/homebrew/opt/postgresql@17/bin}"
DIR="$(mktemp -d "${TMPDIR:-/tmp}/rb-pg.XXXXXX")"
PORT="${PG_PORT:-55432}"
"$PG/initdb" -D "$DIR/data" -U postgres --auth=trust >/dev/null
"$PG/pg_ctl" -D "$DIR/data" -o "-p $PORT -k $DIR" -l "$DIR/log" -w start >/dev/null
trap '"$PG/pg_ctl" -D "$DIR/data" -m fast stop >/dev/null' EXIT
run() { "$PG/psql" -h "$DIR" -p "$PORT" -U postgres -d postgres -v ON_ERROR_STOP=1 -q "$@"; }

run -f supabase/tests/local/stub.sql
for f in supabase/migrations/*.sql; do
  echo "applied  $(basename "$f")"
  run -f "$f"
done
run -f supabase/tests/local/checks.sql
