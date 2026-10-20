module.exports = {
    get NODE_ENV() { return process.env.NODE_ENV; },
    get isDev() { return process.env.NODE_ENV === 'development'; },
    get isSet() { return process.env.NODE_ENV !== undefined && process.env.NODE_ENV !== null && process.env.NODE_ENV !== ''; },
};
