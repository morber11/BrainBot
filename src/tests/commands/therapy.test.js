const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('Therapy Command', () => {
    let mockCommandInteraction;
    let therapyCommand;
    let loggerStub;

    beforeEach(() => {
        loggerStub = { error: sinon.stub() };
        therapyCommand = proxyquire('../../commands/simple-text-commands/therapy.js', {
            '../../utils/logger.js': loggerStub,
        });
        mockCommandInteraction = {
            deferReply: sinon.stub(),
            editReply: sinon.stub(),
        };
    });

    it('should reply with pls rember', async () => {
        await therapyCommand.execute(mockCommandInteraction);

        const expected = [
            'pls rember that wen u feel scare or frigten',
            'never forget ttimes wen u feeled happy',
            '',
            'wen day is dark alway rember happy day',
            '',
            'https://youtu.be/x6LovY_DdEE?si=bv3gjBJyXuVc7U-u',
        ].join('\n');

        expect(mockCommandInteraction.deferReply).to.have.been.called;
        expect(mockCommandInteraction.editReply).to.have.been.calledWith(expected);
    });

    it('should handle errors', async () => {
        mockCommandInteraction.deferReply.throws(new Error('boom'));

        await therapyCommand.execute(mockCommandInteraction);

        expect(mockCommandInteraction.editReply).to.have.been.calledWith('An error occurred.');
        expect(loggerStub.error).to.have.been.calledOnce;
    });
});
