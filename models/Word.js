const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;


const wordSchema = new Schema({
    _id: ObjectId,
    id: String,
    term: String,
    type: String,
    meaning_vi: String,
    tags: [String],
    level: String,
    examples: [Object],
    lastUsed: Date, // Optional field to track when the word was last used/sent
});

module.exports = mongoose.model("word", wordSchema);
