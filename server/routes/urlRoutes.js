const express = require('express');
const Url = require('../db/models/Url');
const { ObjectId } = require('mongodb'); 

const router = express.Router();

// POST new URL to new_urls collection
router.post('/new', async (req, res) => {
  try {
    const url = new Url(req.body);
    const result = await Url.save('new_urls', url.data);
    res.status(201).json({ message: 'New URL added successfully', id: result.insertedId });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST URL to urls collection
router.post('/', async (req, res) => {
  try {
    const url = new Url(req.body);
    const result = await Url.save('urls', url.data);
    res.status(201).json({ message: 'URL added successfully', id: result.insertedId });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET all URLs from new_urls collection
router.get('/new', async (req, res) => {
  try {
    const urls = await Url.findAll('new_urls');
    res.json(urls);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching new URLs' });
  }
});

// GET all URLs from urls collection
router.get('/', async (req, res) => {
  try {
    const urls = await Url.findAll('urls');
    res.json(urls);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching URLs' });
  }
});

// GET a specific URL from new_urls collection
router.put('/new/:id', async (req, res) => {
    try {
      const result = await Url.update('new_urls', { _id: new ObjectId(req.params.id) }, req.body);
      if (result.modifiedCount === 0) {
        return res.status(404).json({ message: 'URL not found or not modified' });
      }
      res.json({ message: 'URL updated successfully' });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while updating the URL' });
    }
  });

// GET a specific URL from urls collection
router.get('/:id', async (req, res) => {
  try {
    const url = await Url.findOne('urls', { _id: req.params.id });
    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }
    res.json(url);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching the URL' });
  }
});

// UPDATE a URL in new_urls collection
router.put('/new/:id', async (req, res) => {
  try {
    const result = await Url.update('new_urls', { _id: req.params.id }, req.body);
    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'URL not found or not modified' });
    }
    res.json({ message: 'URL updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while updating the URL' });
  }
});

// UPDATE a URL in urls collection
router.put('/:id', async (req, res) => {
  try {
    const result = await Url.update('urls', { _id: req.params.id }, req.body);
    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'URL not found or not modified' });
    }
    res.json({ message: 'URL updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while updating the URL' });
  }
});

// DELETE a URL from new_urls collection
router.delete('/new/:id', async (req, res) => {
    try {
      const result = await Url.delete('new_urls', { _id: req.params.id });
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'URL not found' });
      }
      res.json({ message: 'URL deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while deleting the URL' });
    }
  });

// DELETE a URL from urls collection
router.delete('/:id', async (req, res) => {
  try {
    const result = await Url.delete('urls', { _id: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'URL not found' });
    }
    res.json({ message: 'URL deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while deleting the URL' });
  }
});

// POST multiple URLs to urls collection
router.post('/bulk', async (req, res) => {
    try {
      const urls = req.body.urls.map(url => new Url({ url }).data);
      const result = await Url.insertMany('urls', urls);
      res.status(201).json({ message: 'URLs added successfully', count: result.insertedCount });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

module.exports = router;