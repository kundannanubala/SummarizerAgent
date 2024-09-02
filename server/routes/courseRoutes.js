const express = require('express');
const { getDb } = require('../db/connect');
const Course = require('../db/models/course');

const router = express.Router();

// GET all courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.findAll();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching courses' });
  }
});

// POST add dummy courses
router.post('/add-dummy', async (req, res) => {
  try {
    const db = getDb();
    const coursesCollection = db.collection('courses');

    const dummyCourses = [
      {
        title: "Introduction to Node.js",
        description: "Learn the basics of Node.js and server-side JavaScript",
        instructor: "John Doe",
        level: "Beginner",
        topics: ["JavaScript", "Node.js", "Express", "NPM"],
        duration: 240,
        price: 49.99,
        rating: 4.5,
        reviews: [
          {
            user: "Alice",
            comment: "Great introduction to Node.js!",
            rating: 5,
            date: new Date()
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Advanced React Techniques",
        description: "Master advanced concepts in React development",
        instructor: "Jane Smith",
        level: "Advanced",
        topics: ["React", "Hooks", "Redux", "Performance Optimization"],
        duration: 360,
        price: 79.99,
        rating: 4.8,
        reviews: [
          {
            user: "Bob",
            comment: "Excellent deep dive into React!",
            rating: 5,
            date: new Date()
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Python for Data Science",
        description: "Learn Python programming for data analysis and machine learning",
        instructor: "David Johnson",
        level: "Intermediate",
        topics: ["Python", "NumPy", "Pandas", "Matplotlib"],
        duration: 300,
        price: 59.99,
        rating: 4.6,
        reviews: [
          {
            user: "Charlie",
            comment: "Very comprehensive course on Python for data science!",
            rating: 4,
            date: new Date()
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const result = await coursesCollection.insertMany(dummyCourses);
    res.status(201).json({
      message: `Successfully added ${result.insertedCount} dummy courses`,
      insertedIds: result.insertedIds
    });
  } catch (error) {
    console.error("Error adding dummy courses:", error);
    res.status(500).json({ error: 'An error occurred while adding dummy courses' });
  }
});

module.exports = router;