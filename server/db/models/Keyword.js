const { getDb } = require('../connect');
const { ObjectId } = require('mongodb');
const keywordSchema = require('../schemas/keywordSchema');

class Keyword {
  constructor(keywordData) {
    this.data = this.validate(keywordData);
  }

  validate(data) {
    for (const [key, config] of Object.entries(keywordSchema)) {
      if (config.required && !data[key]) {
        throw new Error(`${key} is required`);
      }
      if (config.enum && !config.enum.includes(data[key])) {
        throw new Error(`${key} must be one of: ${config.enum.join(', ')}`);
      }
    }
    return data;
  }

  static async save(keywordData) {
    const db = getDb();
    return db.collection('keywords').insertOne(keywordData);
  }

  static async findAll() {
    const db = getDb();
    return db.collection('keywords').find({}).toArray();
  }

  static async findById(id) {
    const db = getDb();
    return db.collection('keywords').findOne({ _id: new ObjectId(id) });
  }

  static async update(id, updateData) {
    const db = getDb();
    return db.collection('keywords').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updated_at: new Date() } }
    );
  }

  static async delete(id) {
    const db = getDb();
    return db.collection('keywords').deleteOne({ _id: new ObjectId(id) });
  }
  
  static async insertMany(keywords) {
    const db = getDb();
    return db.collection('keywords').insertMany(keywords);
  }
}

module.exports = Keyword;