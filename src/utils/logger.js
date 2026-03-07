module.exports = {
    error(err, context) {
        if (context) {
            console.error(err, context);
        } else {
            console.error(err);
        }
    },
    info(message, context) {
        if (context) {
            console.info(message, context);
        } else {
            console.info(message);
        }
    }
    ,
    warn(message, context) {
        if (context) {
            console.warn(message, context);
        } else {
            console.warn(message);
        }
    }
};
