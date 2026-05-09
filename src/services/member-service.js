const Member = require('../dal/models/member.js');

async function findOrCreate(id, options = {}) {
    return Member.findOrCreate({ where: { id }, ...options });
}

async function findOne(id, options = {}) {
    return Member.findOne({ where: { id }, ...options });
}

async function findAll(options = {}) {
    return Member.findAll(options);
}

async function update(id, attrs) {
    return Member.update(attrs, { where: { id } });
}

module.exports = {
    findOrCreate,
    findOne,
    findAll,
    update,
};
