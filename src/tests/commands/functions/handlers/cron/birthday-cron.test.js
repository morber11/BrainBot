const sinon = require('sinon');
const proxyquire = require('proxyquire');
const { ChannelType, Collection, RESTJSONErrorCodes } = require('discord.js');

describe('birthday cron', () => {
    let birthdayServiceStub;
    let loggerStub;
    let birthdayCron;

    beforeEach(() => {
        birthdayServiceStub = {
            findBirthdaysOn: sinon.stub().resolves([]),
            removeBirthday: sinon.stub().resolves(),
        };
        loggerStub = { error: sinon.stub(), warn: sinon.stub(), info: sinon.stub() };

        birthdayCron = proxyquire('../../../../../functions/handlers/cron/birthday-cron', {
            '../../../services/birthday-service.js': birthdayServiceStub,
            '../../../utils/logger.js': loggerStub,
        });
    });

    function textChannel(name) {
        return { name, type: ChannelType.GuildText, send: sinon.stub().resolves() };
    }

    function unknownMemberError() {
        return Object.assign(new Error('Unknown Member'), { code: RESTJSONErrorCodes.UnknownMember });
    }

    function createGuild({ id = 'guild-1', channels = [], systemChannel = null } = {}) {
        return {
            id,
            channels: { cache: new Collection(channels.map((channel, i) => [`${i}`, channel])) },
            systemChannel,
            members: { fetch: sinon.stub().resolves({}) },
        };
    }

    function createClient(guilds) {
        return { guilds: { cache: new Collection(guilds.map(guild => [guild.id, guild])) } };
    }

    async function runWith(client) {
        await birthdayCron(client, 'GMT').fireOnTick();
    }

    it('wishes the user happy birthday in the general channel', async () => {
        const general = textChannel('general');
        const guild = createGuild({ channels: [textChannel('memes'), general] });
        birthdayServiceStub.findBirthdaysOn.resolves([{ guildId: 'guild-1', userId: 'user-1' }]);

        await runWith(createClient([guild]));

        expect(general.send).to.have.been.calledOnce;
        expect(general.send.firstCall.args[0]).to.include('<@user-1>');
    });

    it('falls back to the system channel when there is no general channel', async () => {
        const systemChannel = textChannel('welcome');
        const guild = createGuild({ channels: [textChannel('memes')], systemChannel });
        birthdayServiceStub.findBirthdaysOn.resolves([{ guildId: 'guild-1', userId: 'user-1' }]);

        await runWith(createClient([guild]));

        expect(systemChannel.send).to.have.been.calledOnce;
    });

    it('removes the birthday instead of posting when the user has left, even if they are still cached', async () => {
        const general = textChannel('general');
        const guild = createGuild({ channels: [general] });
        guild.members.fetch = sinon.stub().callsFake(async ({ force }) => {
            if (force) {
                throw unknownMemberError();
            }

            return {};
        });
        birthdayServiceStub.findBirthdaysOn.resolves([{ guildId: 'guild-1', userId: 'user-1' }]);

        await runWith(createClient([guild]));

        expect(general.send).to.not.have.been.called;
        expect(birthdayServiceStub.removeBirthday).to.have.been.calledOnceWith('guild-1', 'user-1');
    });

    it('keeps sending the remaining birthdays when one fails', async () => {
        const brokenGeneral = textChannel('general');
        brokenGeneral.send.rejects(new Error('Missing Access'));
        const general = textChannel('general');
        const brokenGuild = createGuild({ id: 'guild-1', channels: [brokenGeneral] });
        const guild = createGuild({ id: 'guild-2', channels: [general] });
        birthdayServiceStub.findBirthdaysOn.resolves([
            { guildId: 'guild-1', userId: 'user-1' },
            { guildId: 'guild-2', userId: 'user-2' },
        ]);

        await runWith(createClient([brokenGuild, guild]));

        expect(general.send).to.have.been.calledOnce;
        expect(loggerStub.error).to.have.been.calledOnce;
        expect(loggerStub.error.firstCall.args[1]).to.include({ guildId: 'guild-1', userId: 'user-1' });
    });
});
