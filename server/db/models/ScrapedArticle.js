const { getDb } = require('../connect');
const scrapedArticleSchema = require('../schemas/scrapedArticleSchema');

class ScrapedArticle {
  constructor(articleData) {
    this.data = this.validate(articleData);
  }

  validate(data) {
    for (const [key, config] of Object.entries(scrapedArticleSchema)) {
      if (config.required && !data[key]) {
        throw new Error(`${key} is required`);
      }
    }
    return data;
  }

  static async save(articleData) {
    const db = getDb();
    articleData.scraped_at = new Date();
    return db.collection('scraped_articles').insertOne(articleData);
  }

  static async findAll() {
    const db = getDb();
    return db.collection('scraped_articles').find({}).toArray();
  }

  static async findToday() {
    const db = getDb();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return db.collection('scraped_articles').find({
      scraped_at: { $gte: today }
    }).toArray();
  }

  static async insertMany(articles) {
    const db = getDb();
    const articlesWithScrapedAt = articles.map(article => ({
      ...article,
      scraped_at: new Date()
    }));
    return db.collection('scraped_articles').insertMany(articlesWithScrapedAt);
  }

  static async deleteAll() {
    const db = getDb();
    return db.collection('scraped_articles').deleteMany({});
  }
}

module.exports = ScrapedArticle;