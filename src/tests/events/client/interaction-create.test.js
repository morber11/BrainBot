const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('interactionCreate event handler', () => {
    let handler;
    let loggerStub;

    function createInteraction(command, { replied }) {
        return {
            isChatInputCommand: () => true,
            commandName: 'test',
            replied,
            deferred: false,
            reply: sinon.stub().resolves(),
            client: { commands: new Map([['test', command]]) },
        };
    }

    beforeEach(() => {
        loggerStub = { error: sinon.stub() };

        handler = proxyquire('../../../events/client/interaction-create.js', {
            '../../utils/logger.js': loggerStub,
        });
    });

    it('tells the user when a command fails before responding', async () => {
        const command = { execute: sinon.stub().rejects(new Error('boom')) };
        const interaction = createInteraction(command, { replied: false });

        await handler.execute(interaction, interaction.client);

        expect(loggerStub.error).to.have.been.calledOnce;
        expect(interaction.reply).to.have.been.calledOnce;
    });

    it('only logs when a command fails after it already responded', async () => {
        const command = { execute: sinon.stub().rejects(new Error('boom')) };
        const interaction = createInteraction(command, { replied: true });

        await handler.execute(interaction, interaction.client);

        expect(loggerStub.error).to.have.been.calledOnce;
        expect(interaction.reply).not.to.have.been.called;
    });
});
