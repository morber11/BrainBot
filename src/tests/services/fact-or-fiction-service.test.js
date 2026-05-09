const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('fact-or-fiction-service', () => {
    let FactOrFictionStub;
    let factOrFictionService;

    beforeEach(() => {
        FactOrFictionStub = {
            findOrCreate: sinon.stub(),
            update: sinon.stub()
        };

        factOrFictionService = proxyquire('../../services/fact-or-fiction-service.js', {
            '../dal/models/fact-or-fiction.js': FactOrFictionStub
        });
    });

    it('should findOrCreate the entryHash', async () => {
        const dbRes = [{ id: 1, dataValues: { value: 'fact' } }, false];
        FactOrFictionStub.findOrCreate.resolves(dbRes);

        const res = await factOrFictionService.findOrCreate('hashed_value');

        expect(FactOrFictionStub.findOrCreate).to.have.been.calledWith({ where: { entryHash: 'hashed_value' } });
        expect(res).to.equal(dbRes);
    });

    it('should update id and value', async () => {
        const dbRes = [1];
        FactOrFictionStub.update.resolves(dbRes);

        const res = await factOrFictionService.update(1, 'fiction');

        expect(FactOrFictionStub.update).to.have.been.calledWith({ value: 'fiction' }, { where: { id: 1 } });
        expect(res).to.equal(dbRes);
    });
});