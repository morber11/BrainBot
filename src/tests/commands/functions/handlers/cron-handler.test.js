const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('handleCrons', () => {
    let mockClient;
    let mockDecrementDespair;
    let mockPatriotAct;
    let mockDebug;
    let cronHandler;

    beforeEach(() => {
        mockDecrementDespair = { start: sinon.stub() };
        mockPatriotAct = { start: sinon.stub() };
        mockDebug = { start: sinon.stub() };

        cronHandler = proxyquire('../../../../functions/handlers/cron-handler', {
            './cron/decrement-despair-cron': mockDecrementDespair,
            './cron/patriot-act-cron': sinon.stub().returns(mockPatriotAct),
            './cron/debug-cron': sinon.stub().returns(mockDebug),
        });

        mockClient = {
            handleCrons: sinon.stub(),
            guilds: {
                cache: {
                    values: sinon.stub().returns([
                        {
                            name: 'Test Guild',
                            channels: {
                                cache: new Map([
                                    ['1', { name: 'general', type: 0, send: sinon.stub() }],
                                ]),
                            },
                        },
                    ]),
                },
            },
        };
    });

    it('should start all cron jobs', async () => {
        cronHandler(mockClient);
        await mockClient.handleCrons();
        sinon.assert.calledOnce(mockDecrementDespair.start);
        sinon.assert.calledOnce(mockPatriotAct.start);
        sinon.assert.notCalled(mockDebug.start);
    });
});