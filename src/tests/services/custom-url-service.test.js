const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('custom-url-service', () => {
    let CustomUrlStub;
    let loggerStub;
    let customUrlService;

    beforeEach(() => {
        CustomUrlStub = {
            findAll: sinon.stub(),
            findOrCreate: sinon.stub(),
            create: sinon.stub()
        };

        loggerStub = { error: sinon.stub() };

        customUrlService = proxyquire('../../services/custom-url-service.js', {
            '../dal/models/custom-url.js': CustomUrlStub,
            '../utils/logger.js': loggerStub,
        });
    });

    it('getUrls returns rows for a given type', async () => {
        const rows = [{ url: 'u' }];
        CustomUrlStub.findAll.resolves(rows);

        const res = await customUrlService.getUrls('meditate');

        expect(CustomUrlStub.findAll).to.have.been.calledOnce;
        expect(res).to.equal(rows);
    });

    it('getUrls returns empty array on error', async () => {
        CustomUrlStub.findAll.rejects(new Error('boom'));

        const res = await customUrlService.getUrls('meditate');

        expect(res).to.deep.equal([]);
    });

    it('findRandomUrl selects a random item', async () => {
        const rows = [{ value: 'a' }, { value: 'b' }];
        CustomUrlStub.findAll.resolves(rows);
        sinon.stub(Math, 'random').returns(0.75);

        const one = await customUrlService.findRandomUrl('jimcarrey');

        expect(one).to.equal(rows[1]);
    });
});
