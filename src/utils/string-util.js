module.exports = {
    isNumeric: function isNumeric(str) {
        if (typeof str != "string") return false
        return !isNaN(str) &&
            !isNaN(parseFloat(str))
    },
    selectRandomFromArray: function selectRandomFromArray(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
}

