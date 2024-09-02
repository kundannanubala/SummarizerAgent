const express = require('express');
const Article = require('../db/models/article');

const router = express.Router();

// GET all articles
router.get('/', async (req, res) => {
  try {
    const articles = await Article.findAll();
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching articles' });
  }
});

// POST new articles
router.post('/', async (req, res) => {
  try {
    const articles = req.body.articles;
    const result = await Article.insertMany(articles);
    res.status(201).json({
      message: `Successfully added ${result.insertedCount} articles`,
      insertedIds: result.insertedIds
    });
  } catch (error) {
    console.error("Error adding articles:", error);
    res.status(500).json({ error: 'An error occurred while adding articles' });
  }
});

module.exports = router;