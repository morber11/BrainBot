const FactOrFiction = require('../dal/models/fact-or-fiction.js');

// not much actually happening here, thin wrappers around the model
async function findOrCreate(entryHash) {
    return FactOrFiction.findOrCreate({ where: { entryHash } });
}

async function update(id, value) {
    return FactOrFiction.update({ value }, { where: { id } });
}

module.exports = { findOrCreate, update };