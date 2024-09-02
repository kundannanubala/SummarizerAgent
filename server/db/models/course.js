const { getDb } = require('../connect');
const courseSchema = require('../schemas/courseSchema');

class Course {
  constructor(courseData) {
    this.data = this.validate(courseData);
  }

  validate(data) {
    // Basic validation (you might want to use a validation library for more complex schemas)
    for (const [key, config] of Object.entries(courseSchema)) {
      if (config.required && !data[key]) {
        throw new Error(`${key} is required`);
      }
      // Add more validation as needed
    }
    return data;
  }

  async save() {
    const db = getDb();
    const result = await db.collection('courses').insertOne(this.data);
    return result;
  }

  static async findAll() {
    const db = getDb();
    return db.collection('courses').find({}).toArray();
  }

  // Add more methods as needed
}

module.exports = Course;