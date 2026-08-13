const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('ask-service', () => {
    let askService;
    let askResponseServiceStub;

    beforeEach(() => {
        askResponseServiceStub = { evaluateAskResponse: sinon.stub() };
        askService = proxyquire('../../services/ask-service.js', {
            './system-stat-command-service.js': { incrementSystemStat: sinon.stub() },
            './ask-response-service.js': askResponseServiceStub,
            '../utils/logger.js': { error: sinon.stub() },
        });
    });

    describe('getAskText', () => {
        it('passes message content to the response evaluator', () => {
            askResponseServiceStub.evaluateAskResponse.returns({ replyText: "i didn't ask" });
            sinon.stub(Math, 'random').returns(0.42);

            const result = askService.getAskText({ content: 'the sky is blue' });

            expect(askResponseServiceStub.evaluateAskResponse).to.have.been.calledWith({
                content: 'the sky is blue',
                roll: 42,
            });
            expect(result).to.equal("i didn't ask");
        });
    });
});
