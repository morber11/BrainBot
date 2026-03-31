const sinon = require('sinon');
const proxyquire = require('proxyquire');
const CONSTANTS = require('../../../../utils/constants.js');

describe('handleMentalDespair handler', () => {
    let handleMentalDespair;
    let MemberStub;
    let KeywordStub;
    let CustomUrlStub;
    let stringUtilStub;
    let loggerStub;

    beforeEach(() => {
        MemberStub = {
            findOne: sinon.stub().resolves(null),
            findOrCreate: sinon.stub().resolves([{ id: 'u1', despairCount: 1 }, false]),
            update: sinon.stub().resolves()
        };

        KeywordStub = { findAll: sinon.stub().resolves([]) };
        CustomUrlStub = { findAll: sinon.stub().resolves([]) };
        stringUtilStub = { selectRandomFromArray: sinon.stub() };
        loggerStub = { error: sinon.stub() };

        handleMentalDespair = proxyquire('../../../../events/client/handlers/handleMentalDespair.js', {
            '../../../dal/models/member.js': MemberStub,
            '../../../dal/models/keyword.js': KeywordStub,
            '../../../dal/models/custom-url.js': CustomUrlStub,
            '../../../utils/string-util.js': stringUtilStub,
            '../../../utils/logger.js': loggerStub,
        });
    });

    it('updates member despair count when keywords present', async () => {
        KeywordStub.findAll.resolves([{ name: 'sad', value: 2 }]);
        MemberStub.findOrCreate.resolves([{ id: 'u1', despairCount: 1 }, false]);
        MemberStub.findOne.resolves({ despairCount: 1 });

        const message = { content: 'I am sad', author: { id: 'u1', username: 'bob' }, guildId: 'g1', channelId: 'c1', id: 'm1', reply: sinon.stub().resolves() };

        await handleMentalDespair(message);

        expect(MemberStub.findOrCreate).to.have.been.calledWith({ where: { id: message.author.id } });
        expect(MemberStub.update).to.have.been.calledWith(sinon.match.has('despairCount', 3), { where: { id: 'u1' } });
    });

    it('replies with a despair URL when count exceeds limit', async () => {
        MemberStub.findOne.resolves({ despairCount: CONSTANTS.POINT_VALUES.MAX_DESPAIR });
        CustomUrlStub.findAll.resolves([{ url: 'http://a' }, { url: 'http://b' }]);
        stringUtilStub.selectRandomFromArray.returns({ url: 'http://a' });

        const message = { content: 'nothing', author: { id: 'u2' }, reply: sinon.stub().resolves() };

        await handleMentalDespair(message);

        expect(CustomUrlStub.findAll).to.have.been.calledWith({ attributes: ['url'], where: { type: 'despair' }, raw: true });
        expect(message.reply).to.have.been.calledWith(`Your despair is too high! \nhttp://a`);
    });

    it('logs errors when message.reply throws', async () => {
        MemberStub.findOne.resolves({ despairCount: CONSTANTS.POINT_VALUES.MAX_DESPAIR });
        CustomUrlStub.findAll.resolves([{ url: 'http://a' }]);
        stringUtilStub.selectRandomFromArray.returns({ url: 'http://a' });

        const message = { content: 's', author: { id: 'u3' }, guildId: 'g3', channelId: 'c3', id: 'm3', reply: sinon.stub().rejects(new Error('fail')) };

        await handleMentalDespair(message);

        expect(loggerStub.error).to.have.been.called;
    });
});
