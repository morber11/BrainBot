const Guild = require('../models/guild.js');
const Member = require('../models/member.js');
const Keyword = require('../models/keyword.js');
const CustomUrl = require('../models/custom-url.js');
const FactOrFiction = require('../models/fact-or-fiction.js');
const Stat = require('../models/stat.js');

async function Up() {
    for (const model of [Guild, Member, Keyword, CustomUrl, FactOrFiction, Stat]) {
        await model.sync();
    }
}

module.exports = { Up };
