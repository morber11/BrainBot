const fs = require('fs');
const path = require('path');
const logger = require('../../utils/logger.js');

async function run() {
    try {
        logger.info('Starting migrations...');

        const migrationsDir = path.join(__dirname, '..', 'migrations');
        const migrationFiles = fs.readdirSync(migrationsDir)
            .filter(f => f.endsWith('.js'))
            .map(f => {
                const match = f.match(/^(\d+)-/);
                return { file: f, order: match ? parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER };
            })
            .sort((a, b) => {
                if (a.order !== b.order) {
                    return a.order - b.order;
                }

                return a.file.localeCompare(b.file);
            })
            .map(x => x.file);

        if (migrationFiles.length === 0) {
            logger.info('No migration files found.');
            return;
        }

        for (const file of migrationFiles) {
            const migrationPath = path.join(migrationsDir, file);
            logger.info(`Running migration: ${file}`);

            const migration = require(migrationPath);

            if (migration && typeof migration.Up === 'function') {
                try {
                    await migration.Up();
                } catch (err) {
                    logger.error(`Migration ${file} failed:`, err);
                    throw err;
                }
            } else {
                logger.warn(`Skipping ${file}: no Up() export found.`);
            }
        }

        logger.info('Migrations complete');
    } catch (err) {
        logger.error('Error during migrations:', err);
        process.exit(1);
    }
}

run();