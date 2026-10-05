const fs = require('fs');
const path = require('path');
const database = require('./database.js');

const modelsDir = path.join(__dirname, '..', 'models');

for (const file of fs.readdirSync(modelsDir).filter(f => f.endsWith('.js'))) {
    require(path.join(modelsDir, file));
}

async function ensureMigrationsApplied() {
    const queryInterface = database.getQueryInterface();

    for (const model of Object.values(database.models)) {
        let columns;
        try {
            columns = await queryInterface.describeTable(model.getTableName());
        } catch {
            throw new Error(`Table '${model.getTableName()}' is missing. Run "npm run db-run-migrations" and restart.`);
        }

        for (const attribute of Object.values(model.rawAttributes)) {
            if (!(attribute.field in columns)) {
                throw new Error(`Column '${attribute.field}' is missing from table '${model.getTableName()}'. Run "npm run db-run-migrations" and restart.`);
            }
        }
    }
}

module.exports = { ensureMigrationsApplied };
