const express = require('express');
const ScrapedArticle = require('../db/models/ScrapedArticle');
const Article = require('../db/models/article');

const router = express.Router();

// GET all scraped articles
router.get('/', async (req, res) => {
  try {
    const articles = await ScrapedArticle.findAll();
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching scraped articles' });
  }
});

// POST scraped articles
router.post('/', async (req, res) => {
  try {
    const result = await ScrapedArticle.insertMany(req.body.articles);
    res.status(201).json({
      message: `Successfully added ${result.insertedCount} scraped articles`,
      insertedIds: result.insertedIds
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE all scraped articles
router.delete('/', async (req, res) => {
  try {
    const result = await ScrapedArticle.deleteAll();
    res.json({ message: `Deleted ${result.deletedCount} scraped articles` });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while deleting scraped articles' });
  }
});

// GET all articles from the articles collection and then empty it
router.get('/scrape-and-clear', async (req, res) => {
  try {
    // Get all articles
    const articles = await Article.findAll();

    // Empty the articles collection
    await Article.deleteAll();

    res.json({
      message: `Retrieved ${articles.length} articles and emptied the articles collection`,
      articles: articles
    });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred during scrape and clear operation' });
  }
});

module.exports = router;