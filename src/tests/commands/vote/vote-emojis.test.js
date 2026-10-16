const sinon = require('sinon');
const proxyquire = require('proxyquire');
const { Collection, MessageFlags } = require('discord.js');

describe('Voteemojis command', () => {
    const FIRST_ID = '111111111111111111';
    const SECOND_ID = '222222222222222222';
    const RESTRICTED_ID = '333333333333333333';

    let pollEmojiServiceStub;
    let voteEmojisCommand;

    function serverEmoji(id, name, { roleCount = 0 } = {}) {
        return {
            id,
            name,
            available: true,
            roles: { cache: { size: roleCount } },
            toString: () => `<:${name}:${id}>`,
        };
    }

    function createInteraction(subcommand, emojisInput) {
        const emojis = [
            serverEmoji(FIRST_ID, 'first'),
            serverEmoji(SECOND_ID, 'second'),
            serverEmoji(RESTRICTED_ID, 'restricted', { roleCount: 1 }),
        ];
        const serverEmojis = new Collection(emojis.map(emoji => [emoji.id, emoji]));

        return {
            guildId: 'guild-1',
            guild: { emojis: { fetch: sinon.stub().resolves(serverEmojis) } },
            options: {
                getSubcommand: () => subcommand,
                getString: () => emojisInput,
            },
            reply: sinon.stub().resolves(),
        };
    }

    beforeEach(() => {
        pollEmojiServiceStub = {
            getPollEmojiIds: sinon.stub().resolves(null),
            setPollEmojiIds: sinon.stub().resolves(),
        };

        voteEmojisCommand = proxyquire('../../../commands/vote/vote-emojis.js', {
            '../../services/poll/poll-emoji-service.js': pollEmojiServiceStub,
        });
    });

    describe('set', () => {
        it('saves picked and typed emojis in the order given', async () => {
            const interaction = createInteraction('set', `:second: <:first:${FIRST_ID}>`);

            await voteEmojisCommand.execute(interaction);

            expect(pollEmojiServiceStub.setPollEmojiIds).to.have.been.calledOnceWith('guild-1', [SECOND_ID, FIRST_ID]);
        });

        it('saves a repeated emoji once', async () => {
            const interaction = createInteraction('set', `:first: :second: <:first:${FIRST_ID}>`);

            await voteEmojisCommand.execute(interaction);

            expect(pollEmojiServiceStub.setPollEmojiIds).to.have.been.calledOnceWith('guild-1', [FIRST_ID, SECOND_ID]);
        });

        it('skips what the bot cannot use, saves the rest and says what was skipped', async () => {
            const interaction = createInteraction('set', ':missing: :first: :restricted: hello');

            await voteEmojisCommand.execute(interaction);

            expect(pollEmojiServiceStub.setPollEmojiIds).to.have.been.calledOnceWith('guild-1', [FIRST_ID]);

            const content = interaction.reply.firstCall.args[0].content;
            expect(content).to.include(':missing:').and.include(':restricted:').and.include('hello');
        });

        it('saves nothing and replies privately when nothing can be used', async () => {
            const interaction = createInteraction('set', ':missing: hello');

            await voteEmojisCommand.execute(interaction);

            expect(pollEmojiServiceStub.setPollEmojiIds).not.to.have.been.called;
            expect(interaction.reply.firstCall.args[0]).to.have.property('flags', MessageFlags.Ephemeral);
        });
    });

    it('clear removes the configured emojis', async () => {
        const interaction = createInteraction('clear');

        await voteEmojisCommand.execute(interaction);

        expect(pollEmojiServiceStub.setPollEmojiIds).to.have.been.calledOnceWith('guild-1', null);
    });

    it('show lists the configured emojis in order, skipping ones no longer in the server', async () => {
        pollEmojiServiceStub.getPollEmojiIds.resolves([SECOND_ID, '999999999999999999', FIRST_ID]);
        const interaction = createInteraction('show');

        await voteEmojisCommand.execute(interaction);

        const content = interaction.reply.firstCall.args[0].content;
        expect(content).to.include(`1. <:second:${SECOND_ID}>`);
        expect(content).to.include(`2. <:first:${FIRST_ID}>`);
        expect(content).not.to.include('999999999999999999');
    });

    it('show says none are set when every configured emoji has been deleted', async () => {
        pollEmojiServiceStub.getPollEmojiIds.resolves(['999999999999999999']);
        const interaction = createInteraction('show');

        await voteEmojisCommand.execute(interaction);

        expect(interaction.reply.firstCall.args[0].content).not.to.include('1.');
    });
});
