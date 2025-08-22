const express = require('express');
const router = express.Router();
const controller = require('../controllers/controller');

router.get('/news', controller.getNews);

module.exports = router;