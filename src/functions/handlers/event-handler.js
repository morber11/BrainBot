const fs = require('fs');
const path = require('path');
const logger = require('../../utils/logger.js');

module.exports = (client) => {
    client.handleEvents = async () => {
        const eventFolders = fs.readdirSync('./src/events');

        eventFolders.forEach(folder => {
            const eventFilesPath = path.join(__dirname, '..', '..', 'events', folder);
            const eventFiles = fs
                .readdirSync(eventFilesPath)
                .filter(file => file.endsWith('.js'));

            if (folder === 'client') {
                eventFiles.forEach(file => {
                    const eventPath = path.join(eventFilesPath, file);
                    
                    let event;
                    try {
                        event = require(eventPath);
                    } catch (err) {
                        logger.error(`Failed to load event ${file} from ${eventPath}:`, err);
                        throw err;
                    }

                    if (event.once) {
                        client.once(event.name, (...args) => event.execute(...args, client));
                    } else {
                        client.on(event.name, (...args) => event.execute(...args, client));
                    }
                });
            }
        });
    };
};