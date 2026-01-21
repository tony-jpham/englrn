const Word = require("../../models/Word");

const countUsedWords = async () => {
    const count = await Word.countDocuments({
        lastUsed: { $exists: true }
    });
    return count;
};

const updateUsedWords = async (ids) => {
    await Word.updateMany({
        _id: { $in: ids }
    }, {
        $set: { lastUsed: new Date() }
    });
};

const getNextUnusedWords = async (limit) => {
    const words = await Word.find({
        lastUsed: { $exists: false }
    }, {
        _id: 1,
        term: 1,
        meaning_vi: 1
    }).limit(limit);
    return words;
}

module.exports = {
  countUsedWords,
  updateUsedWords,
  getNextUnusedWords
};