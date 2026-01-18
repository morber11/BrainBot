const fs = require('fs');
const path = require('path');

async function run() {
    try {
        console.log('Starting migrations...');

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
            console.log('No migration files found.');
            return;
        }

        for (const file of migrationFiles) {
            const migrationPath = path.join(migrationsDir, file);
            console.log(`Running migration: ${file}`);

            const migration = require(migrationPath);

            if (migration && typeof migration.Up === 'function') {
                try {
                    await migration.Up();
                } catch (err) {
                    console.error(`Migration ${file} failed:`, err);
                    throw err; // will be caught by outer catch to exit non-zero
                }
            } else {
                console.warn(`Skipping ${file}: no Up() export found.`);
            }
        }

        console.log('Migrations complete');
    } catch (err) {
        console.error('Error during migrations:', err);
        process.exit(1);
    }
}

run();