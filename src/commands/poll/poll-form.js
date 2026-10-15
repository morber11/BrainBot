const {
    ModalBuilder,
    LabelBuilder,
    TextInputBuilder,
    TextInputStyle,
    CheckboxGroupBuilder,
    CheckboxGroupOptionBuilder,
    RadioGroupBuilder,
    RadioGroupOptionBuilder,
} = require('discord.js');
const CONSTANTS = require('../../utils/constants.js');

const QUESTION_INPUT_ID = 'question';
const ANSWERS_INPUT_ID = 'answers';
const EXPIRATION_INPUT_ID = 'expiration';
const CHOICE_INPUT_ID = 'choice';
const MULTIPLE_CHOICE = 'multiple';
const SINGLE_CHOICE = 'single';
const SETTINGS_INPUT_ID = 'settings';
const NOTIFY_SETTING = 'notify';
const SERVER_EMOJIS_SETTING = 'server-emojis';
const MIN_ANSWERS = 2;
const MAX_ANSWERS = CONSTANTS.POLL.EMOJIS.length;

function buildPollForm(formId) {
    const questionInput = new TextInputBuilder()
        .setCustomId(QUESTION_INPUT_ID)
        .setStyle(TextInputStyle.Short)
        .setMaxLength(CONSTANTS.POLL.MAX_QUESTION_LENGTH);

    const answersInput = new TextInputBuilder()
        .setCustomId(ANSWERS_INPUT_ID)
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Monday\nTuesday\nWednesday');

    const expirationInput = new TextInputBuilder()
        .setCustomId(EXPIRATION_INPUT_ID)
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setMaxLength(20)
        .setPlaceholder(`${CONSTANTS.POLL.DEFAULT_DURATION_HOURS}h`);

    const choiceInput = new RadioGroupBuilder()
        .setCustomId(CHOICE_INPUT_ID)
        .addOptions(
            new RadioGroupOptionBuilder()
                .setLabel('Multiple choice')
                .setDescription('People can vote for as many answers as they like')
                .setValue(MULTIPLE_CHOICE)
                .setDefault(true),
            new RadioGroupOptionBuilder()
                .setLabel('Single choice')
                .setDescription('Picking a new answer removes the previous vote')
                .setValue(SINGLE_CHOICE),
        );

    const settingsInput = new CheckboxGroupBuilder()
        .setCustomId(SETTINGS_INPUT_ID)
        .setMinValues(0)
        .setRequired(false)
        .addOptions(
            new CheckboxGroupOptionBuilder()
                .setLabel('Ping voters with result')
                .setValue(NOTIFY_SETTING)
                .setDefault(true),
            new CheckboxGroupOptionBuilder()
                .setLabel('Use server emojis')
                .setDescription('Use custom emojis from this server')
                .setValue(SERVER_EMOJIS_SETTING),
        );

    return new ModalBuilder()
        .setCustomId(formId)
        .setTitle('Start a poll')
        .addLabelComponents(
            new LabelBuilder()
                .setLabel('Question')
                .setTextInputComponent(questionInput),
            new LabelBuilder()
                .setLabel('Answers')
                .setDescription(`One answer per line, ${MIN_ANSWERS} to ${MAX_ANSWERS} answers`)
                .setTextInputComponent(answersInput),
            new LabelBuilder()
                .setLabel('Expiration')
                .setDescription('How long the vote stays open, e.g. 30m, 2h, 3 days. Default: 1 day')
                .setTextInputComponent(expirationInput),
            new LabelBuilder()
                .setLabel('Choice')
                .setRadioGroupComponent(choiceInput),
            new LabelBuilder()
                .setLabel('Options')
                .setCheckboxGroupComponent(settingsInput),
        );
}

function readPollForm(fields) {
    const labels = fields.getTextInputValue(ANSWERS_INPUT_ID)
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean);

    const settings = fields.getCheckboxGroup(SETTINGS_INPUT_ID);

    return {
        question: fields.getTextInputValue(QUESTION_INPUT_ID),
        labels,
        expiresIn: fields.getTextInputValue(EXPIRATION_INPUT_ID).trim(),
        singleChoice: fields.getRadioGroup(CHOICE_INPUT_ID) === SINGLE_CHOICE,
        notify: settings.includes(NOTIFY_SETTING),
        useServerEmojis: settings.includes(SERVER_EMOJIS_SETTING),
    };
}

module.exports = {
    MIN_ANSWERS,
    MAX_ANSWERS,
    buildPollForm,
    readPollForm,
};
