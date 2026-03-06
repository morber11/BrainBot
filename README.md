# BrainBot
Simple Discord bot for brain spam. Made for a few friends.

## Setup & Build

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Configure database**
   - edit `src/config.json` with your file path and credentials for the SQLite database.
   - run migrations to create required tables:
     ```bash
     npm run db-run-migrations
     ```
   - alternatively, you can reset and sync the schema in development via:
     ```bash
     node ./src/dal/database/sync-db.js
     ```

## Running tests

Run the entire Jest suite with:
```bash
npm test
```