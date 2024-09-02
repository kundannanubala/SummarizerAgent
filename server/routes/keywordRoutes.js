const express = require('express');
const Keyword = require('../db/models/Keyword');
const { ObjectId } = require('mongodb');

const router = express.Router();

// GET all keywords
router.get('/', async (req, res) => {
  try {
    const keywords = await Keyword.findAll();
    res.json(keywords);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching keywords' });
  }
});

// GET a specific keyword by ID
router.get('/:id', async (req, res) => {
  try {
    const keyword = await Keyword.findById(req.params.id);
    if (!keyword) {
      return res.status(404).json({ message: 'Keyword not found' });
    }
    res.json(keyword);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching the keyword' });
  }
});

// POST a new keyword
router.post('/', async (req, res) => {
  try {
    const keyword = new Keyword(req.body);
    const result = await Keyword.save(keyword.data);
    res.status(201).json({
      message: 'Keyword added successfully',
      id: result.insertedId
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT (update) a keyword
router.put('/:id', async (req, res) => {
  try {
    const result = await Keyword.update(req.params.id, req.body);
    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'Keyword not found or not modified' });
    }
    res.json({ message: 'Keyword updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE a keyword
router.delete('/:id', async (req, res) => {
  try {
    const result = await Keyword.delete(req.params.id);
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Keyword not found' });
    }
    res.json({ message: 'Keyword deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while deleting the keyword' });
  }
});

// POST multiple new keywords
router.post('/bulk', async (req, res) => {
    try {
      const keywords = req.body.keywords;
      if (!Array.isArray(keywords)) {
        return res.status(400).json({ error: 'Keywords must be provided as an array' });
      }
  
      const validKeywords = keywords.map(k => new Keyword(k).data);
      const result = await Keyword.insertMany(validKeywords);
  
      res.status(201).json({
        message: `Successfully added ${result.insertedCount} keywords`,
        insertedIds: result.insertedIds
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

module.exports = router;