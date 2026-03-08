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
        MILK: "🥛",
    },
    BRAIN: {
        MAX_BRAINS: 330,
    },
    CLIENT: {
        CLIENT_ID: process.env.CLIENT_ID || "713026155929665569",
    },
    POINT_VALUES: {
        MAX_DESPAIR: 10,
        DESPAIR_DECREMENT: -2,
    },
    CRON: {
        HANDLE_DESPAIR: "*/5 * * * *",
        PATRIOT_ACT: "16 19 * * *",
        PATRIOT_ACT_DELAY_PERIOD: 30000,
        DEBUG: "* * * * *",
    },
    STATS: {
        PATRIOT_ACT: "patriot_act",
        PATRIOT_ACT_FRIENDLY: "salutes given",
        RAVEN: "raven",
        RAVEN_FRIENDLY: "lives lost",
        MILK: "milk",
        MILK_FRIENDLY: "armored cores",
        JIGSAW: "jigsaw",
        JIGSAW_FRIENDLY: "choices made",
        BRAIN: "brain",
        BRAIN_FRIENDLY: "total brains",
        DIDNT_ASK: "didnt_ask",
        DIDNT_ASK_FRIENDLY: "times i didn't ask",
        ASK_FRIENDLY: "times i asked",
        GADGET: "gadget",
        GADGET_FRIENDLY: "gadgets used",
    },
    COMMANDS: {
        PATRIOT_ACT: "patriot_act",
        DIDNT_ASK: "didnt_ask",
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
    },
    FACT_OR_FICTION: {
        VALUES: {
            FACT: "fact",
            FICTION: "fiction"
        },
        RESPONSES: [
            {
                "response": "Is it possible? Maybe. But is it true? Absolutely not. It's fiction",
                "category": "fiction"
            },
            {
                "response": "It's a wild story, but stranger things have happened. True? I'm not so sure. We made this one up.",
                "category": "fiction"
            },
            {
                "response": "Could it be the truth? Not this time. Absolutely no evidence. It's made up.",
                "category": "fiction"
            },
            {
                "response": "That sounds like a tall tale. But then again, truth is stranger than fiction, right? This time however, it's false.",
                "category": "fiction"
            },
            {
                "response": "Did you believe this strange story? You shouldn't. It was a creative story from our writers.",
                "category": "fiction"
            },
            {
                "response": "Is it true? Not this time. We got you.",
                "category": "fiction"
            },
            {
                "response": "Could it have happened? Absolutely. Did it? No. A complete fabrication.",
                "category": "fiction"
            },
            {
                "response": "Hmm. Well, it's a story, that's for sure. One cooked up by our writers.",
                "category": "fiction"
            },
            {
                "response": "A fascinating tale, but it's nothing but smoke and mirrors.",
                "category": "fiction"
            },
            {
                "response": "Could this really have happened? Maybe you heard a similar story, but this ones made up by our writers.",
                "category": "fiction"
            },
            {
                "response": "This one can't be possible right? If you thought this was from the mind of one of our writers, you'd be wrong. It happened.",
                "category": "fact"
            },
            {
                "response": "Did you believe this story? You should have. It's true.",
                "category": "fact"
            },
            {
                "response": "This story has a ring of truth  to it. But is it really fact? Yes. It happened.",
                "category": "fact"
            },
            {
                "response": "Have you heard of this story? you might have, it happened.",
                "category": "fact"
            },
            {
                "response": "Did this really happen? Yes.",
                "category": "fact"
            },
            {
                "response": "Seems impossible right? This story is actually fact. It happened.",
                "category": "fact"
            },
            {
                "response": "It's too absurd to be true, right? If you think this was a lie you'd be wrong, it's fact.",
                "category": "fact"
            },
            {
                "response": "Sounds unbelievable? According to our researchers, it's true.",
                "category": "fact"
            },
            {
                "response": "It has to be false right? Wrong. It's true.",
                "category": "fact"
            },
            {
                "response": "It couldn't have possibly happened. If you thought it did, you'd be right. ",
                "category": "fact"
            }
        ]
    }
}

module.exports = CONSTANTS