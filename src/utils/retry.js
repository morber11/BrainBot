const logger = require('./logger.js');

module.exports = async function retryOperation(operation, retries = 5, delay = 500) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            if (error.message.includes('SQLITE_BUSY')) {
                if (attempt < retries) {
                    logger.warn(`Database is locked. Retrying (${attempt}/${retries})...`);
                    await new Promise(res => setTimeout(res, delay));
                } else {
                    throw new Error(`Operation failed after ${retries} retries: ${error?.message || error}`, { cause: error });
                }
            } else {
                throw error;
            }
        }
    }
};
