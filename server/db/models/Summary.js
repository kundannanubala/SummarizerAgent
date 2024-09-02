const { getDb } = require('../connect');
const { ObjectId } = require('mongodb');
const summarySchema = require('../schemas/summarySchema');

class Summary {
  constructor(summaryData) {
    this.data = this.validate(summaryData);
  }

  validate(data) {
    for (const [key, config] of Object.entries(summarySchema)) {
      if (config.required && !data[key]) {
        throw new Error(`${key} is required`);
      }
    }
    return data;
  }

  static async save(summaryData) {
    const db = getDb();
    return db.collection('summaries').insertOne(summaryData);
  }

  static async findAll() {
    const db = getDb();
    return db.collection('summaries').find({}).toArray();
  }

  static async insertMany(summaries) {
    const db = getDb();
    return db.collection('summaries').insertMany(summaries);
  }

  static async deleteAll() {
    const db = getDb();
    return db.collection('summaries').deleteMany({});
  }

  static async updateKeywords(summaryId, keywordIds) {
    const db = getDb();
    return db.collection('summaries').updateOne(
      { _id: new ObjectId(summaryId) },
      { $set: { keyword_ids: keywordIds } }
    );
  }
}

module.exports = Summary;