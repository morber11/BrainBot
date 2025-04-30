const CONSTANTS = {
    EMOJI: {
        BRAIN: "\uD83E\uDDE0",
        REGIONAL_SIGN_B: "\uD83C\uDDE7",
        REGIONAL_SIGN_R: "\uD83C\uDDF7",
        REGIONAL_SIGN_A: "\uD83C\uDDE6",
        REGIONAL_SIGN_I: "\uD83C\uDDEE",
        REGIONAL_SIGN_N: "\uD83C\uDDF3",
        THINKING: "\uD83E\uDD14",
        ONE_HUNDRED: "\uD83D\uDCAF",
    },
    CLIENT: {
        CLIENT_ID: "713026155929665569",
    },
    POINT_VALUES: {
        MAX_DESPAIR: 10,
        DESPAIR_DECREMENT: -2,
    },
    CRON: {
        HANDLE_DESPAIR: "*/5 * * * *",
        PATRIOT_ACT: "16 19 * * *"
    },
    MAGIC_BALL: {
        RESPONSES: [
            { "response_number": 1, "response": "Yes", "category": "Positive" },
            { "response_number": 2, "response": "No", "category": "Negative" },
            { "response_number": 3, "response": "Ask again later", "category": "Neutral" },
            { "response_number": 4, "response": "Cannot predict now", "category": "Neutral" },
            { "response_number": 5, "response": "Very likely", "category": "Positive" },
            { "response_number": 6, "response": "Don't count on it", "category": "Negative" },
            { "response_number": 7, "response": "Yes, definitely", "category": "Positive" },
            { "response_number": 8, "response": "My sources say no", "category": "Negative" },
            { "response_number": 9, "response": "Outlook good", "category": "Positive" },
            { "response_number": 10, "response": "Signs point to yes", "category": "Positive" },
            { "response_number": 11, "response": "Reply hazy, try again", "category": "Neutral" },
            { "response_number": 12, "response": "Most likely", "category": "Positive" },
            { "response_number": 13, "response": "Better not tell you now", "category": "Neutral" },
            { "response_number": 14, "response": "Yes, but not right now", "category": "Neutral" },
            { "response_number": 15, "response": "Very doubtful", "category": "Negative" },
            { "response_number": 16, "response": "Without a doubt", "category": "Positive" },
            { "response_number": 17, "response": "Don't hold your breath", "category": "Negative" },
            { "response_number": 18, "response": "Definitely not", "category": "Negative" },
            { "response_number": 19, "response": "Yes, but it will take time", "category": "Neutral" },
            { "response_number": 20, "response": "The future is unclear", "category": "Neutral" },
            { "response_number": 21, "response": "Ask me again in a few minutes", "category": "Neutral" },
            { "response_number": 22, "response": "All signs point to yes", "category": "Positive" },
            { "response_number": 23, "response": "My reply is no", "category": "Negative" },
            { "response_number": 24, "response": "Cannot say for sure", "category": "Neutral" },
            { "response_number": 25, "response": "Most likely not", "category": "Negative" },
            { "response_number": 26, "response": "The answer is in the stars", "category": "Neutral" },
            { "response_number": 27, "response": "Definitely!", "category": "Positive" },
            { "response_number": 28, "response": "Looks like a no", "category": "Negative" },
            { "response_number": 29, "response": "Very probable", "category": "Positive" },
            { "response_number": 30, "response": "I can't say right now", "category": "Neutral" }
        ]
    }
}
module.exports = CONSTANTS