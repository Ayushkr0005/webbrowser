const mongoose = require('mongoose');

const BookmarkSchema = new mongoose.Schema({
  url: { type: String, required: true, index: true },
  title: { type: String },
  favicon: { type: String },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Bookmark', BookmarkSchema);

