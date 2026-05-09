const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('Member service', () => {
    let MemberStub;
    let memberService;

    beforeEach(() => {
        MemberStub = {
            findOrCreate: sinon.stub(),
            findOne: sinon.stub(),
            findAll: sinon.stub(),
            update: sinon.stub(),
            increment: sinon.stub(),
        };

        memberService = proxyquire('../../services/member-service.js', {
            '../dal/models/member.js': MemberStub,
        });
    });

    it('should findOrCreate by id', async () => {
        MemberStub.findOrCreate.resolves(['member', true]);

        const result = await memberService.findOrCreate('user-1');

        expect(MemberStub.findOrCreate).to.have.been.calledWith({ where: { id: 'user-1' } });
        expect(result).to.deep.equal(['member', true]);
    });

    it('should findOne by id with options', async () => {
        MemberStub.findOne.resolves({ despairCount: 1 });

        const result = await memberService.findOne('user-2', { attributes: ['despairCount'] });

        expect(MemberStub.findOne).to.have.been.calledWith({ where: { id: 'user-2' }, attributes: ['despairCount'] });
        expect(result).to.deep.equal({ despairCount: 1 });
    });

    it('should findAll with options', async () => {
        MemberStub.findAll.resolves(['a', 'b']);

        const result = await memberService.findAll({ where: { despairCount: 0 } });

        expect(MemberStub.findAll).to.have.been.calledWith({ where: { despairCount: 0 } });
        expect(result).to.deep.equal(['a', 'b']);
    });

    it('should update by id', async () => {
        MemberStub.update.resolves([1]);

        const result = await memberService.update('user-3', { name: 'test' });

        expect(MemberStub.update).to.have.been.calledWith({ name: 'test' }, { where: { id: 'user-3' } });
        expect(result).to.deep.equal([1]);
    });
});
