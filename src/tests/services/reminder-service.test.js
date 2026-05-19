const sinon = require('sinon');
const proxyquire = require('proxyquire');
const Sequelize = require('sequelize');

describe('reminder-service', () => {
    let ReminderStub;
    let reminderService;

    beforeEach(() => {
        ReminderStub = {
            create: sinon.stub(),
            findAll: sinon.stub(),
            update: sinon.stub(),
        };

        reminderService = proxyquire('../../services/reminder-service.js', {
            '../dal/models/reminder.js': ReminderStub,
        });
    });

    it('should create reminder', async () => {
        const attrs = { userId: 'u1', message: 'hi' };
        const row = { id: 1 };
        ReminderStub.create.resolves(row);

        const result = await reminderService.createReminder(attrs);

        expect(ReminderStub.create).to.have.been.calledWith(attrs);
        expect(result).to.equal(row);
    });

    it('should find advance due reminders', async () => {
        const now = new Date();
        const rows = [{ id: 1 }];
        ReminderStub.findAll.resolves(rows);

        const result = await reminderService.findAdvanceDueReminders(now);

        expect(ReminderStub.findAll).to.have.been.calledOnce;
        const callArg = ReminderStub.findAll.firstCall.args[0];
        expect(callArg.raw).to.be.true;
        expect(callArg.where.alertSent).to.equal(false);
        expect(callArg.where.complete).to.equal(false);
        expect(callArg.where.alertAt).to.deep.equal({ [Sequelize.Op.lte]: now });
        expect(result).to.equal(rows);
    });

    it('should find final due reminders', async () => {
        const now = new Date();
        const rows = [{ id: 2 }];
        ReminderStub.findAll.resolves(rows);

        const result = await reminderService.findFinalDueReminders(now);

        expect(ReminderStub.findAll).to.have.been.calledOnce;
        const callArg = ReminderStub.findAll.firstCall.args[0];
        expect(callArg.raw).to.be.true;
        expect(callArg.where.complete).to.equal(false);
        expect(callArg.where.remindAt).to.deep.equal({ [Sequelize.Op.lte]: now });
        expect(result).to.equal(rows);
    });

    it('should mark alerts sent', async () => {
        ReminderStub.update.resolves([1]);

        const result = await reminderService.markAlertsSent([1, 2]);

        expect(ReminderStub.update).to.have.been.calledWith(
            { alertSent: true },
            { where: { id: [1, 2], alertSent: false } }
        );
        expect(result).to.deep.equal([1]);
    });

    it('should mark complete', async () => {
        ReminderStub.update.resolves([2]);

        const result = await reminderService.markComplete([3]);

        expect(ReminderStub.update).to.have.been.calledWith(
            { complete: true },
            { where: { id: [3], complete: false } }
        );
        expect(result).to.deep.equal([2]);
    });
});
