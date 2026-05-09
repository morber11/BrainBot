const sinon = require('sinon');
const proxyquire = require('proxyquire');
const CONSTANTS = require('../../../../../utils/constants');

describe('decrement despair', () => {
    let cronJob;
    let MemberServiceStub;

    beforeEach(() => {
        MemberServiceStub = { findAll: sinon.stub(), update: sinon.stub() };
        cronJob = proxyquire('../../../../../functions/handlers/cron/decrement-despair-cron', {
            '../../../services/member-service': MemberServiceStub,
        });
    });
    it('should decrement despairCount for members with positive despairCount', async () => {
        const mockMembers = [
            { id: 1, despairCount: 5, increment: sinon.stub() },
            { id: 2, despairCount: 3, increment: sinon.stub() },
        ];

        MemberServiceStub.findAll.resolves(mockMembers);

        await cronJob.fireOnTick();

        mockMembers.forEach((member) => {
            if (member.despairCount > 0) {
                sinon.assert.calledWith(member.increment, {
                    despairCount: CONSTANTS.POINT_VALUES.DESPAIR_DECREMENT,
                });
            }
        });
    });

    it('should reset despairCount to 0 for members with negative despairCount', async () => {
        const mockMembers = [
            { id: 3, despairCount: -1, increment: sinon.stub() },
            { id: 4, despairCount: -5, increment: sinon.stub() },
        ];

        MemberServiceStub.findAll.resolves(mockMembers);

        await cronJob.fireOnTick();

        mockMembers.forEach((member) => {
            if (member.despairCount < 0) {
                sinon.assert.calledWith(MemberServiceStub.update, member.id, sinon.match({
                    despairCount: 0,
                    updatedAt: sinon.match.date,
                }));
            }
        });
    });

    it('should handle no members found gracefully', async () => {
        MemberServiceStub.findAll.resolves([]);

        await cronJob.fireOnTick();

        sinon.assert.notCalled(MemberServiceStub.update);
    });
});
