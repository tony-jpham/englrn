const moment = require("moment");
const {sendDiscordMessage} = require("./utils/DiscordMessage");
const {
    countUsedWords,
    updateUsedWords,
    getNextUnusedWords
} = require("./utils/WordHandling");

const sendVocab = async () => {
    const numOfWords = process.env.WORD_PER_DAY || 10;
    // Get next words to send and count of used words
    const wordsToSend = await getNextUnusedWords(numOfWords);
    const countUsed = await countUsedWords() + wordsToSend.length;
    
    // Prepare message content
    const timeString = moment().format('DD/MM/YYYY HH:mm');
    const vocabList =  wordsToSend.map((word, idx) => {
        const translateUrl = `https://translate.google.com/?sl=en&tl=vi&text=${encodeURIComponent(word.term)}`;
        return `**${idx + 1} - ${word.term}**: ${word.meaning_vi} ${translateUrl}\nExamples: ${word.examples[0].en}\n-----`;
    }).join('\n');

    const messageContent = `\n\n📚 **Daily Vocabulary - ${timeString}** 📚\n\n${vocabList}\n\n📝 *You have learned ${countUsed} words so far!*\nFight the good fight!`;

    // console.log("Send Message Content:\n", messageContent);

    // Send message to user via Discord webhook
    sendDiscordMessage(messageContent);

    // Update last used date for sent words
    const ids = wordsToSend.map(word => word._id);
    await updateUsedWords(ids);
};

const sendVocabTest = async () => {

};

module.exports = {sendVocab};