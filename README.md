# BrainBot
Simple Discord bot for brain spam. Made for a few friends.

Requires GLIBC 2.36

## Setup & Build

### YouTube playback

The `/play` and other audio commands use ``yt-dlp` to extract the audio from a Youtube vdieo. Docker installs the pinned yt-dlp release automatically. For local dev, install the current [yt-dlp release](https://github.com/yt-dlp/yt-dlp/releases) and either make the executable available on `PATH`:

```bash
yt-dlp --version
```

or set `YT_DLP_COMMAND` in `.env` to the executable path, for example `YT_DLP_COMMAND=C:/tools/yt-dlp.exe`

I will consider expanding to other services like soundcloud later

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

