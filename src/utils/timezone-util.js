// Validate IANA timezone strings using Intl
function isValidTimeZone(tz) {
    try {
        Intl.DateTimeFormat(undefined, { timeZone: tz }).format();
        return true;
    } catch (e) {
        return false;
    }
}

module.exports = { isValidTimeZone };
