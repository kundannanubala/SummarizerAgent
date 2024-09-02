const { getDb } = require('../connect');
const articleSchema = require('../schemas/articleSchema');

class Article {
  constructor(articleData) {
    this.data = this.validate(articleData);
  }

  validate(data) {
    for (const [key, config] of Object.entries(articleSchema)) {
      if (config.required && !data[key]) {
        throw new Error(`${key} is required`);
      }
      if (key === 'published_date' && config.type === 'date') {
        data[key] = new Date(data[key]);
      }
    }
    return data;
  }
  

  async save() {
    const db = getDb();
    const result = await db.collection('articles').insertOne(this.data);
    return result;
  }

  static async findAll() {
    const db = getDb();
    return db.collection('articles').find({}).toArray();
  }

  static async insertMany(articles) {
    const db = getDb();
    return db.collection('articles').insertMany(articles);
  }
  
  static async deleteAll() {
    const db = getDb();
    return db.collection('articles').deleteMany({});
  }
}

module.exports = Article;