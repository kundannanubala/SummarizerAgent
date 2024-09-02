const express = require('express');
const courseRoutes = require('./courseRoutes');
const articleRoutes = require('./articleRoutes');
const urlRoutes = require('./urlRoutes')
const scrapedArticleRoutes = require('./scrapedArticleRoutes');

const router = express.Router();

router.use('/courses', courseRoutes);
router.use('/articles', articleRoutes);
router.use('/urls', urlRoutes);
router.use('/scraped-articles', scrapedArticleRoutes);

module.exports = router;