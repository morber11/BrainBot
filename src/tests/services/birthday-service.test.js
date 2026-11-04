const sinon = require('sinon');
const proxyquire = require('proxyquire');
const Sequelize = require('sequelize');

describe('birthday-service', () => {
    let BirthdayStub;
    let birthdayService;

    beforeEach(() => {
        BirthdayStub = { findAll: sinon.stub().resolves([]) };
        birthdayService = proxyquire('../../services/birthday-service.js', {
            '../dal/models/birthday.js': BirthdayStub,
        });
    });

    function queriedDates() {
        return BirthdayStub.findAll.firstCall.args[0].where[Sequelize.Op.or];
    }

    it('finds birthdays on the given day', async () => {
        await birthdayService.findBirthdaysOn(new Date(2026, 10, 4));

        expect(queriedDates()).to.deep.equal([{ month: 11, day: 4 }]);
    });

    it('includes 29 february birthdays on 28 february in a non leap year', async () => {
        await birthdayService.findBirthdaysOn(new Date(2027, 1, 28));

        expect(queriedDates()).to.deep.equal([{ month: 2, day: 28 }, { month: 2, day: 29 }]);
    });

    it('leaves 29 february birthdays for their own day in a leap year', async () => {
        await birthdayService.findBirthdaysOn(new Date(2028, 1, 28));

        expect(queriedDates()).to.deep.equal([{ month: 2, day: 28 }]);
    });
});
