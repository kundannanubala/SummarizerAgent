const express = require('express');
const Summary = require('../db/models/Summary');

const router = express.Router();

// GET all summaries
router.get('/', async (req, res) => {
  try {
    const summaries = await Summary.findAll();
    res.json(summaries);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching summaries' });
  }
});

// POST new summaries
router.post('/', async (req, res) => {
  try {
    const summaries = req.body.summaries;
    const result = await Summary.insertMany(summaries);
    res.status(201).json({
      message: `Successfully added ${result.insertedCount} summaries`,
      insertedIds: result.insertedIds
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE all summaries
router.delete('/', async (req, res) => {
  try {
    const result = await Summary.deleteAll();
    res.json({ message: `Deleted ${result.deletedCount} summaries` });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while deleting summaries' });
  }
});

// PUT update keywords for a specific summary
router.put('/:id/keywords', async (req, res) => {
  try {
    const result = await Summary.updateKeywords(req.params.id, req.body.keyword_ids);
    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'Summary not found or keywords not modified' });
    }
    res.json({ message: 'Summary keywords updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST trigger keyword mapping for all summaries
router.post('/map-keywords', async (req, res) => {
  try {
    await mapKeywordsToSummaries();
    res.json({ message: 'Keyword mapping process triggered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while mapping keywords to summaries' });
  }
});

module.exports = router;