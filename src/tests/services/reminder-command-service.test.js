const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('reminder-command-service', () => {
    let ReminderStub;
    let reminderCommandService;

    beforeEach(() => {
        ReminderStub = {
            create: sinon.stub(),
            update: sinon.stub(),
        };

        reminderCommandService = proxyquire('../../services/reminder-command-service.js', {
            '../dal/models/reminder.js': ReminderStub,
        });
    });

    it('creates a reminder', async () => {
        const attrs = { userId: 'u1', message: 'hi' };
        const row = { id: 1 };
        ReminderStub.create.resolves(row);

        const result = await reminderCommandService.createReminder(attrs);

        expect(ReminderStub.create).to.have.been.calledWith(attrs);
        expect(result).to.equal(row);
    });

    it('marks alerts sent', async () => {
        ReminderStub.update.resolves([1]);

        const result = await reminderCommandService.markAlertsSent([1, 2]);

        expect(ReminderStub.update).to.have.been.calledWith(
            { alertSent: true, advanceSendingAt: null },
            { where: { id: [1, 2], alertSent: false } }
        );
        expect(result).to.deep.equal([1]);
    });

    it('marks reminders complete', async () => {
        ReminderStub.update.resolves([2]);

        const result = await reminderCommandService.markComplete([3]);

        expect(ReminderStub.update).to.have.been.calledWith(
            { complete: true, reminderSendingAt: null },
            { where: { id: [3], complete: false } }
        );
        expect(result).to.deep.equal([2]);
    });
});