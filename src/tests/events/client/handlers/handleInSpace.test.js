const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('handleInSpace handler', () => {
    let handleInSpace;
    let mathStub;
    let loggerStub;

    beforeEach(() => {
        mathStub = { getRandomInt: sinon.stub() };
        loggerStub = { error: sinon.stub() };

        handleInSpace = proxyquire('../../../../events/client/handlers/handleInSpace.js', {
            '../../../utils/math-util.js': mathStub,
            '../../../utils/logger.js': loggerStub,
        });
    });

    it('replies with repeated phrase when content includes "in space"', async () => {
        mathStub.getRandomInt.returns(2);
        const message = { content: 'we are in space', reply: sinon.stub().resolves() };

        await handleInSpace(message);

        const phrase = 'in space no one can hear you in space';
        const expected = Array(7).fill(phrase).join(' ');
        expect(message.reply).to.have.been.calledWith(expected);
    });

    it('does nothing when content does not include "in space"', async () => {
        mathStub.getRandomInt.returns(2);
        const message = { content: 'not relevant', reply: sinon.stub().resolves() };

        await handleInSpace(message);

        expect(message.reply).to.not.have.been.called;
    });

    it('logs errors when message.reply throws', async () => {
        mathStub.getRandomInt.returns(0);
        const message = { content: 'in space', reply: sinon.stub().rejects(new Error('fail')) };

        await handleInSpace(message);

        expect(loggerStub.error).to.have.been.called;
    });
});
