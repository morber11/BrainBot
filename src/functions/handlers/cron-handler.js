const decrementDespair = require('./cron/decrement-despair-cron');
const patriotAct = require('./cron/patriot-act-cron');
const debug = require('./cron/debug-cron');

module.exports = (client) => {
    client.handleCrons = async () => {
        decrementDespair.start();
        patriotAct(client).start();
        //debug(client).start(); // uncomment if debug, move to environment file or arg at some point
    };
};
