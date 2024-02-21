module.exports = {
    isNumeric(str) {
        if (typeof str !== "string") return false;
        return !isNaN(str) && !isNaN(parseFloat(str));
    },
    selectRandomFromArray(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
}