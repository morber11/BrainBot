const Sequelize = require('sequelize');
const Birthday = require('../dal/models/birthday.js');

function isLeapYear(year) {
    return new Date(year, 1, 29).getMonth() === 1;
}

async function setBirthday({ guildId, userId, month, day }) {
    return Birthday.upsert({ guildId, userId, month, day });
}

// 29 february birthdays are celebrated on 28 february in non leap years
async function findBirthdaysOn(date) {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dates = [{ month, day }];

    const isFebruary28 = month === 2 && day === 28;
    if (isFebruary28 && !isLeapYear(date.getFullYear())) {
        dates.push({ month: 2, day: 29 });
    }

    return Birthday.findAll({ where: { [Sequelize.Op.or]: dates } });
}

async function removeBirthday(guildId, userId) {
    return Birthday.destroy({ where: { guildId, userId } });
}

module.exports = {
    setBirthday,
    findBirthdaysOn,
    removeBirthday,
};
