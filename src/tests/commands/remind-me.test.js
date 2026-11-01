const sinon = require('sinon');
const proxyquire = require('proxyquire');
const { MessageFlags } = require('discord.js');

describe('Remind-me command', () => {
    let reminderServiceStub;
    let remindMeCommand;
    let mockInteraction;
    let clock;

    beforeEach(() => {
        clock = sinon.useFakeTimers();

        reminderServiceStub = {
            createReminder: sinon.stub().callsFake(async attrs => ({ id: 1, ...attrs })),
            beginReminderSending: sinon.stub().resolves(true),
            markComplete: sinon.stub().resolves(),
        };

        const reminderMessageService = proxyquire('../../services/reminder-message-service.js', {
            './reminder-command-service.js': reminderServiceStub,
        });

        remindMeCommand = proxyquire('../../commands/tools/remind-me.js', {
            '../../services/reminder-command-service.js': reminderServiceStub,
            '../../services/reminder-message-service.js': reminderMessageService,
        });

        mockInteraction = {
            options: {
                getString: sinon.stub(),
                getUser: sinon.stub(),
            },
            reply: sinon.stub().resolves(),
            user: { id: 'creator-1' },
            channelId: 'channel-1',
            guildId: 'guild-1',
        };
    });

    it('should create a reminder with relative duration when time is provided', async () => {
        mockInteraction.options.getString.withArgs('time').returns('3h');
        mockInteraction.options.getString.withArgs('message').returns('Finish the report');
        mockInteraction.options.getUser.withArgs('target').returns({ id: 'target-1' });

        await remindMeCommand.execute(mockInteraction);

        expect(reminderServiceStub.createReminder).to.have.been.calledOnce;
        expect(reminderServiceStub.createReminder.firstCall.args[0]).to.include({ alertSent: false });
        expect(mockInteraction.reply).to.have.been.calledOnce;
        expect(mockInteraction.reply.getCall(0).args[0]).to.match(/Reminder set for <@target-1> at/);
    });

    it('should skip the early alert when the reminder is due sooner than the alert offset', async () => {
        mockInteraction.options.getString.withArgs('time').returns('5m');
        mockInteraction.options.getString.withArgs('message').returns('Take the bins out');
        mockInteraction.options.getUser.withArgs('target').returns(null);

        await remindMeCommand.execute(mockInteraction);

        expect(reminderServiceStub.createReminder.firstCall.args[0]).to.include({ alertSent: true });
    });

    it('should send a short reminder when it is due without waiting for the next reminder check', async () => {
        const channel = { send: sinon.stub().resolves() };
        mockInteraction.client = { channels: { fetch: sinon.stub().withArgs('channel-1').resolves(channel) } };
        mockInteraction.options.getString.withArgs('time').returns('2m');
        mockInteraction.options.getString.withArgs('message').returns('Kettle');
        mockInteraction.options.getUser.withArgs('target').returns(null);

        await remindMeCommand.execute(mockInteraction);
        await clock.tickAsync(2 * 60 * 1000);

        expect(channel.send).to.have.been.calledOnce;
    });

    it('should create a reminder with human text duration when time is provided', async () => {
        mockInteraction.options.getString.withArgs('time').returns('60 minutes');
        mockInteraction.options.getString.withArgs('message').returns('Stretch your legs');
        mockInteraction.options.getUser.withArgs('target').returns(null);

        await remindMeCommand.execute(mockInteraction);

        expect(reminderServiceStub.createReminder).to.have.been.calledOnce;
        expect(mockInteraction.reply).to.have.been.calledOnce;
        expect(mockInteraction.reply.getCall(0).args[0]).to.match(/Reminder set for you at/);
    });

    it('should create a reminder with default contextual time when no time is provided', async () => {
        mockInteraction.options.getString.withArgs('time').returns(null);
        mockInteraction.options.getString.withArgs('message').returns('Check the server');
        mockInteraction.options.getUser.withArgs('target').returns(null);

        await remindMeCommand.execute(mockInteraction);

        expect(reminderServiceStub.createReminder).to.have.been.calledOnce;
        expect(reminderServiceStub.createReminder.firstCall.args[0]).to.include({
            creatorId: 'creator-1',
            userId: 'creator-1',
            channelId: 'channel-1',
            guildId: 'guild-1',
            message: 'Check the server',
            alertOffsetMinutes: 15,
        });
        expect(mockInteraction.reply).to.have.been.calledOnce;
        expect(mockInteraction.reply.getCall(0).args[0]).to.match(/Reminder set for you at/);
    });

    it('should return an error when the provided time is invalid', async () => {
        mockInteraction.options.getString.withArgs('time').returns('bad-time');
        mockInteraction.options.getString.withArgs('message').returns('Do the thing');
        mockInteraction.options.getUser.withArgs('target').returns(null);

        await remindMeCommand.execute(mockInteraction);

        expect(mockInteraction.reply).to.have.been.calledOnce;
        const replyArg = mockInteraction.reply.getCall(0).args[0];
        expect(replyArg).to.have.property('flags', MessageFlags.Ephemeral);
        expect(replyArg.content).to.match(/valid future time/i);
    });
});