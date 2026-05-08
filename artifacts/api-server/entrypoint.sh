#!/bin/sh
set -e

MIGRATION_MAX_RETRIES="${MIGRATION_MAX_RETRIES:-10}"
MIGRATION_RETRY_DELAY_SECONDS="${MIGRATION_RETRY_DELAY_SECONDS:-3}"

attempt=1
while [ "$attempt" -le "$MIGRATION_MAX_RETRIES" ]; do
	echo "Running database migrations (attempt ${attempt}/${MIGRATION_MAX_RETRIES})..."

	if node --enable-source-maps ./dist/migrate.mjs; then
		echo "Migrations completed successfully."
		break
	fi

	if [ "$attempt" -eq "$MIGRATION_MAX_RETRIES" ]; then
		echo "Migrations failed after ${MIGRATION_MAX_RETRIES} attempts." >&2
		exit 1
	fi

	echo "Migration attempt ${attempt} failed. Retrying in ${MIGRATION_RETRY_DELAY_SECONDS}s..."
	sleep "$MIGRATION_RETRY_DELAY_SECONDS"
	attempt=$((attempt + 1))
done

echo "Starting API server..."
exec node --enable-source-maps ./dist/index.mjs
