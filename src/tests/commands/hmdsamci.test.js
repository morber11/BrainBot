const sinon = require('sinon');
const hmdsamciCommand = require('../../commands/simple-text-commands/hmdsamci.js');

describe('Hmdsamci Command', () => {
    let mockCommandInteraction;

    beforeEach(() => {
        mockCommandInteraction = {
            reply: sinon.stub(),
        };
    });

    it('should reply with days since a major cybersecurity incident and a URL', async () => {
        await hmdsamciCommand.execute(mockCommandInteraction);

        const [text, url] = mockCommandInteraction.reply.firstCall.args[0].split('\n');

        expect(text).to.equal('how many days since a major cybersecurity incident');
        expect(url).to.match(/^https:\/\//);
    });
});
