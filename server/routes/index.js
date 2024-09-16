const express = require('express');
const courseRoutes = require('./courseRoutes');
const articleRoutes = require('./articleRoutes');
const urlRoutes = require('./urlRoutes')
const scrapedArticleRoutes = require('./scrapedArticleRoutes');
const summaryRoutes = require('./summaryRoutes');
const keywordRoutes = require('./keywordRoutes');
const userRoutes = require('./userRoutes');

const router = express.Router();

router.use('/courses', courseRoutes);
router.use('/articles', articleRoutes);
router.use('/urls', urlRoutes);
router.use('/scraped-articles', scrapedArticleRoutes);
router.use('/summaries', summaryRoutes);
router.use('/keywords', keywordRoutes);
router.use('/users', userRoutes);

module.exports = router;