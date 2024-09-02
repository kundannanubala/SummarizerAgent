const courseSchema = {
    title: { type: 'string', required: true },
    description: { type: 'string', required: true },
    instructor: { type: 'string', required: true },
    level: { type: 'string', enum: ['Beginner', 'Intermediate', 'Advanced'], required: true },
    topics: { type: 'array', items: { type: 'string' }, required: true },
    duration: { type: 'number', required: true },
    price: { type: 'number', required: true },
    rating: { type: 'number', min: 0, max: 5 },
    reviews: {
      type: 'array',
      items: {
        user: { type: 'string', required: true },
        comment: { type: 'string', required: true },
        rating: { type: 'number', min: 0, max: 5, required: true },
        date: { type: 'date', required: true }
      }
    },
    createdAt: { type: 'date', default: Date.now },
    updatedAt: { type: 'date', default: Date.now }
  };
  
  module.exports = courseSchema;