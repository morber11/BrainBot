const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('keyword-service', () => {
    let KeywordStub;
    let keywordService;

    beforeEach(() => {
        KeywordStub = {
            findAll: sinon.stub(),
            findOrCreate: sinon.stub(),
            create: sinon.stub(),
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

    it('findOrCreate should forward to Keyword.findOrCreate', async () => {
        const attrs = { name: 'sad', type: 'despair', value: 2 };
        const dbRes = [{ id: 1 }, true];
        KeywordStub.findOrCreate.resolves(dbRes);

        const res = await keywordService.findOrCreate(attrs);

        expect(KeywordStub.findOrCreate).to.have.been.calledWith({ where: { name: attrs.name, type: attrs.type }, defaults: attrs });
        expect(res).to.equal(dbRes);
    });

    it('create should forward to Keyword.create', async () => {
        const attrs = { name: 'sad', type: 'despair', value: 1 };
        const created = { id: 2 };
        KeywordStub.create.resolves(created);

        const res = await keywordService.create(attrs);

        expect(KeywordStub.create).to.have.been.calledWith(attrs);
        expect(res).to.equal(created);
    });
});
