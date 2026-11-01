const sinon = require('sinon');
const proxyquire = require('proxyquire');
const { RESTJSONErrorCodes } = require('discord.js');
const CONSTANTS = require('../../utils/constants.js');

describe('reminder-message-service', () => {
    let reminderCommandServiceStub;
    let loggerStub;
    let reminderMessageService;
    let channel;
    let client;
    let clock;

    function createReminder(remindInMs) {
        return {
            id: 1,
            channelId: 'channel-1',
            userId: 'user-1',
            message: 'Take the bins out',
            remindAt: new Date(Date.now() + remindInMs),
        };
    }

    beforeEach(() => {
        clock = sinon.useFakeTimers();

        reminderCommandServiceStub = {
            beginAdvanceSending: sinon.stub().resolves(true),
            beginReminderSending: sinon.stub().resolves(true),
            markComplete: sinon.stub().resolves(),
            releaseAdvanceSending: sinon.stub().resolves(),
            releaseReminderSending: sinon.stub().resolves(),
        };
        loggerStub = { error: sinon.stub(), warn: sinon.stub() };

        reminderMessageService = proxyquire('../../services/reminder-message-service.js', {
            './reminder-command-service.js': reminderCommandServiceStub,
            '../utils/logger.js': loggerStub,
        });

        channel = { send: sinon.stub().resolves() };
        client = { channels: { fetch: sinon.stub().withArgs('channel-1').resolves(channel) } };
    });

    describe('scheduleReminder', () => {
        it('sends the reminder exactly when it is due', async () => {
            reminderMessageService.scheduleReminder(client, createReminder(2 * 60 * 1000));

            await clock.tickAsync(2 * 60 * 1000 - 1);
            expect(channel.send).not.to.have.been.called;

            await clock.tickAsync(1);
            expect(channel.send).to.have.been.calledOnce;
            expect(reminderCommandServiceStub.markComplete).to.have.been.calledOnceWith([1]);
        });

        it('sends the reminder once when it is scheduled more than once', async () => {
            const reminder = createReminder(0);

            reminderMessageService.scheduleReminder(client, reminder);
            reminderMessageService.scheduleReminder(client, reminder);
            await clock.tickAsync(0);

            expect(channel.send).to.have.been.calledOnce;
        });

        it('leaves reminders due after the next check for that check to schedule', async () => {
            const reminder = createReminder(CONSTANTS.REMINDER.LOOKAHEAD_MS + 1);

            reminderMessageService.scheduleReminder(client, reminder);
            await clock.tickAsync(CONSTANTS.REMINDER.LOOKAHEAD_MS + 1);

            expect(channel.send).not.to.have.been.called;
        });

        it('releases the reminder for a later attempt when sending fails', async () => {
            channel.send.rejects(new Error('Discord unavailable'));

            reminderMessageService.scheduleReminder(client, createReminder(0));
            await clock.tickAsync(0);

            expect(reminderCommandServiceStub.releaseReminderSending).to.have.been.calledOnce;
            expect(reminderCommandServiceStub.markComplete).not.to.have.been.called;
            expect(loggerStub.error.firstCall.args[1]).to.include({ reminderId: 1 });
        });

        it('marks the reminder complete when its channel was deleted', async () => {
            client.channels.fetch.rejects(Object.assign(new Error('Unknown Channel'), { code: RESTJSONErrorCodes.UnknownChannel }));

            reminderMessageService.scheduleReminder(client, createReminder(0));
            await clock.tickAsync(0);

            expect(reminderCommandServiceStub.markComplete).to.have.been.calledOnceWith([1]);
            expect(reminderCommandServiceStub.releaseReminderSending).not.to.have.been.called;
            expect(loggerStub.warn).to.have.been.calledOnce;
        });
    });

    describe('scheduleAlert', () => {
        it('marks the whole reminder complete when its channel was deleted', async () => {
            client.channels.fetch.rejects(Object.assign(new Error('Unknown Channel'), { code: RESTJSONErrorCodes.UnknownChannel }));
            const reminder = { ...createReminder(15 * 60 * 1000), alertAt: new Date() };

            reminderMessageService.scheduleAlert(client, reminder);
            await clock.tickAsync(0);

            expect(reminderCommandServiceStub.markComplete).to.have.been.calledOnceWith([1]);
            expect(reminderCommandServiceStub.releaseAdvanceSending).not.to.have.been.called;
            expect(loggerStub.warn).to.have.been.calledOnce;
        });
    });
});
