const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('keyword-service', () => {
    let KeywordStub;
    let keywordService;

    beforeEach(() => {
        KeywordStub = {
            findAll: sinon.stub(),
        };

        keywordService = proxyquire('../../services/keyword-service.js', {
            '../dal/models/keyword.js': KeywordStub,
            '../utils/logger.js': { error: sinon.stub() },
        });
    });

    it('findAllByType should call Keyword.findAll with raw true and return rows', async () => {
        const rows = [{ name: 'sad', value: 2 }];
        KeywordStub.findAll.resolves(rows);

        const res = await keywordService.findAllByType('despair', ['name', 'value']);

        expect(KeywordStub.findAll).to.have.been.calledWith({ raw: true, where: { type: 'despair' }, attributes: ['name', 'value'] });
        expect(res).to.equal(rows);
    });

    it('findAllByType should return [] on error', async () => {
        KeywordStub.findAll.rejects(new Error('boom'));

        const res = await keywordService.findAllByType('despair', ['name', 'value']);

        expect(res).to.deep.equal([]);
    });
});
