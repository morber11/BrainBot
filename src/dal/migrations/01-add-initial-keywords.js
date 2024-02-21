const Keyword = require('../models/keyword.js');

const keywords = [
    { type: "despair", value: 1, name: "despair"},
    { type: "despair", value: 1, name: "stress"},
    { type: "despair", value: 1, name: "hate"},
    { type: "despair", value: 1, name: "sir"},
    { type: "despair", value: 5, name: "coillte"},
    { type: "despair", value: 5, name: "met"},
    { type: "despair", value: 1, name: "..."},
    { type: "despair", value: 1, name: "dementia"},
    { type: "despair", value: 2, name: "bus"},
    { type: "despair", value: 1, name: "dublin"},
    { type: "despair", value: 2, name: "pensive"},
    { type: "despair", value: 2, name: "adamstown"},
    { type: "despair", value: 1, name: "beef"},
    { type: "despair", value: 1, name: "ops"},
    { type: "despair", value: 1, name: "shonk"},
    { type: "despair", value: 1, name: "curry"},
    { type: "despair", value: 1, name: "beefbrain"},
    { type: "despair", value: 1, name: "smh"},
    { type: "despair", value: 3, name: "meteorological"},
    { type: "despair", value: 1, name: "anime"},
    { type: "despair", value: 5, name: "detroit"},
    { type: "despair", value: 3, name: "dysphoria"},
    { type: "despair", value: 1, name: "american"},
    { type: "despair", value: 1, name: "javascript"},
    { type: "despair", value: 1, name: "flush"},
    { type: "despair", value: 2, name: "ryanair"},
    { type: "despair", value: 3, name: "mercedes"},
    { type: "despair", value: 1, name: "butter"},
    { type: "despair", value: 1, name: "cream"},
    { type: "despair", value: 1, name: "taskette"},
    { type: "despair", value: 1, name: "yuck"},

    { type: "despair", value: -1, name: "happy"},
    { type: "despair", value: -1, name: "agar"},
    { type: "despair", value: -1, name: "brain"},
    { type: "despair", value: -1, name: "lads"},
    { type: "despair", value: -2, name: "lord"},
    { type: "despair", value: -1, name: "good"},
    { type: "despair", value: -1, name: "vc"},
    { type: "despair", value: -1, name: "frog"},
    { type: "despair", value: -1, name: "beloved"},
    { type: "despair", value: -1, name: "fumo"},
    { type: "despair", value: -1, name: "milk"},
    { type: "despair", value: -5, name: ":pray:"},
    { type: "despair", value: -5, name: "U+1F64F"},
    { type: "despair", value: -5, name: "🙏"},
];

async function up() {
    await Promise.all(keywords.map(obj => 
        Keyword.findOrCreate({
            where: {
                name: obj.name,
                type: obj.type,
                value: obj.value
            }
        })
    ));
}

module.exports = { Up: up }