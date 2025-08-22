const express = require('express');
const router = express.Router();
const bookmarkController = require('../controllers/controller');

// Create bookmark
router.post('/', bookmarkController.createBookmark);

// Get all bookmarks
router.get('/', bookmarkController.getBookmarks);

// Import bookmarks (bulk insert)
router.post('/import', bookmarkController.importBookmarks);
// Delete bookmark by ID
router.delete('/:id', bookmarkController.deleteBookmark);

module.exports = router;

