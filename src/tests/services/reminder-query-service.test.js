const sinon = require('sinon');
const proxyquire = require('proxyquire');
const Sequelize = require('sequelize');

describe('reminder-query-service', () => {
    let ReminderStub;
    let reminderQueryService;

    beforeEach(() => {
        ReminderStub = { findAll: sinon.stub() };
        reminderQueryService = proxyquire('../../services/reminder-query-service.js', {
            '../dal/models/reminder.js': ReminderStub,
        });
    });

    it('finds advance due reminders', async () => {
        const now = new Date();
        const rows = [{ id: 1 }];
        ReminderStub.findAll.resolves(rows);

        const result = await reminderQueryService.findAdvanceDueReminders(now);
        const options = ReminderStub.findAll.firstCall.args[0];

        expect(options.raw).to.be.true;
        expect(options.where.alertSent).to.equal(false);
        expect(options.where.complete).to.equal(false);
        expect(options.where.advanceSendingAt).to.deep.equal({ [Sequelize.Op.is]: null });
        expect(options.where.alertAt).to.deep.equal({ [Sequelize.Op.lte]: now });
        expect(result).to.equal(rows);
    });

    it('finds final due reminders', async () => {
        const now = new Date();
        const rows = [{ id: 2 }];
        ReminderStub.findAll.resolves(rows);

        const result = await reminderQueryService.findFinalDueReminders(now);
        const options = ReminderStub.findAll.firstCall.args[0];

        expect(options.raw).to.be.true;
        expect(options.where.complete).to.equal(false);
        expect(options.where.reminderSendingAt).to.deep.equal({ [Sequelize.Op.is]: null });
        expect(options.where.remindAt).to.deep.equal({ [Sequelize.Op.lte]: now });
        expect(result).to.equal(rows);
    });
});