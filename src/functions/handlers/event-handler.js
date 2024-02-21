const fs = require('fs');
const path = require('path');

module.exports = (client) => {
    client.handleEvents = async () => {
        const eventFolders = fs.readdirSync('./src/events');

        eventFolders.forEach(folder => {
            const eventFilesPath = path.join(__dirname, '..', '..', 'events', folder);
            const eventFiles = fs
                .readdirSync(eventFilesPath)
                .filter(file => file.endsWith('.js'));

            if (folder === "client") {
                eventFiles.forEach(file => {
                    const event = require(path.join(eventFilesPath, file));

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