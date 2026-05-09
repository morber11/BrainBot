const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('custom-url-service', () => {
    let CustomUrlStub;
    let customUrlService;

    beforeEach(() => {
        CustomUrlStub = {
            findAll: sinon.stub(),
            findOrCreate: sinon.stub(),
            create: sinon.stub()
        };

        customUrlService = proxyquire('../../services/custom-url-service.js', {
            '../dal/models/custom-url.js': CustomUrlStub
        });
    });

    it('returns rows for a given type', async () => {
        const rows = [{ value: 'a' }];
        CustomUrlStub.findAll.resolves(rows);

        const res = await customUrlService.findAllByType('jimcarrey', ['value']);

        expect(CustomUrlStub.findAll).to.have.been.calledOnce;
        expect(res).to.equal(rows);
    });

    it('createUrl creates and returns record', async () => {
        const attrs = { value: 'x', type: 'jimcarrey' };
        const created = { id: 1, ...attrs };
        CustomUrlStub.create.resolves(created);

        const res = await customUrlService.createUrl(attrs);

        expect(CustomUrlStub.create).to.have.been.calledOnce;
        expect(res).to.equal(created);
    });

    it('findRandomUrl selects a random item', async () => {
        const rows = [{ value: 'a' }, { value: 'b' }];
        CustomUrlStub.findAll.resolves(rows);
        const one = await customUrlService.findRandomUrl('jimcarrey');
        expect(rows).to.include(one);
    });

    it('findOrCreateUrl returns model result and forwards attrs', async () => {
        const attrs = { value: 'x', type: 'jimcarrey' };
        const dbRes = [{ dataValues: attrs }, true];
        CustomUrlStub.findOrCreate.resolves(dbRes);

        const res = await customUrlService.findOrCreateUrl(attrs);

        expect(CustomUrlStub.findOrCreate).to.have.been.calledOnce;
        expect(res).to.equal(dbRes);
    });
});
