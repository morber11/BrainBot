const sinon = require('sinon');
const proxyquire = require('proxyquire');
const CONSTANTS = require('../../../../utils/constants.js');

describe('handleMentalDespair handler', () => {
    let handleMentalDespair;
    let MemberServiceStub;
    let KeywordStub;
    let CustomUrlStub;
    let stringUtilStub;
    let loggerStub;

    beforeEach(() => {
        MemberServiceStub = {
            findOne: sinon.stub().resolves(null),
            findOrCreate: sinon.stub().resolves([{ id: 'u1', despairCount: 1 }, false]),
            update: sinon.stub().resolves()
        };

        KeywordStub = { findAll: sinon.stub().resolves([]) };
        CustomUrlStub = { findAllByType: sinon.stub().resolves([]) };
        stringUtilStub = { selectRandomFromArray: sinon.stub() };
        loggerStub = { error: sinon.stub() };

        handleMentalDespair = proxyquire('../../../../events/client/handlers/handleMentalDespair.js', {
            '../../../services/member-service.js': MemberServiceStub,
            '../../../dal/models/keyword.js': KeywordStub,
            '../../../services/custom-url-service.js': CustomUrlStub,
            '../../../utils/string-util.js': stringUtilStub,
            '../../../utils/logger.js': loggerStub,
        });
    });

    it('updates member despair count when keywords present', async () => {
        KeywordStub.findAll.resolves([{ name: 'sad', value: 2 }]);
        MemberServiceStub.findOrCreate.resolves([{ id: 'u1', despairCount: 1 }, false]);
        MemberServiceStub.findOne.resolves({ despairCount: 1 });

        const message = { content: 'I am sad', author: { id: 'u1', username: 'bob' }, guildId: 'g1', channelId: 'c1', id: 'm1', reply: sinon.stub().resolves() };

        await handleMentalDespair(message);

        expect(MemberServiceStub.findOrCreate).to.have.been.calledWith(message.author.id);
        expect(MemberServiceStub.update).to.have.been.calledWith('u1', sinon.match.has('despairCount', 3));
    });

    it('replies with a despair URL when count exceeds limit', async () => {
        MemberServiceStub.findOne.resolves({ despairCount: CONSTANTS.POINT_VALUES.MAX_DESPAIR });
        CustomUrlStub.findAllByType.resolves([{ url: 'http://a' }, { url: 'http://b' }]);
        stringUtilStub.selectRandomFromArray.returns({ url: 'http://a' });

        const message = { content: 'nothing', author: { id: 'u2' }, reply: sinon.stub().resolves() };

        await handleMentalDespair(message);

        expect(CustomUrlStub.findAllByType).to.have.been.calledWith('despair', ['url']);
        expect(message.reply).to.have.been.calledWith(`Your despair is too high! \nhttp://a`);
    });

    it('logs errors when message.reply throws', async () => {
        MemberServiceStub.findOne.resolves({ despairCount: CONSTANTS.POINT_VALUES.MAX_DESPAIR });
        CustomUrlStub.findAllByType.resolves([{ url: 'http://a' }]);
        stringUtilStub.selectRandomFromArray.returns({ url: 'http://a' });

        const message = { content: 's', author: { id: 'u3' }, guildId: 'g3', channelId: 'c3', id: 'm3', reply: sinon.stub().rejects(new Error('fail')) };

        await handleMentalDespair(message);

        expect(loggerStub.error).to.have.been.called;
    });

});
