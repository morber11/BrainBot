# BrainBot
Simple Discord bot for brain spam. Made for a few friends.

Requires GLIBC 2.36

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

Run the entire test suite (Mocha/Chai/Sinon/Proxyquire) with:
```bash
npm test
```
