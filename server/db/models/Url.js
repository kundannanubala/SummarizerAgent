const { getDb } = require('../connect');
const urlSchema = require('../schemas/urlSchema');
const { ObjectId } = require('mongodb');

class Url {
  constructor(urlData) {
    this.data = this.validate(urlData);
  }

  validate(data) {
    for (const [key, config] of Object.entries(urlSchema)) {
      if (config.required && !data[key]) {
        throw new Error(`${key} is required`);
      }
    }
    return data;
  }

    static async save(collection, urlData) {
        const db = getDb();
        return db.collection(collection).insertOne(urlData);
    }

    static async findAll(collection) {
        const db = getDb();
        return db.collection(collection).find({}).toArray();
    }

    static async findOne(collection, query) {
        const db = getDb();
        return db.collection(collection).findOne(query);
    }

    static async update(collection, query, update) {
        const db = getDb();
        if (query._id && typeof query._id === 'string') {
          query._id = new ObjectId(query._id);
        }
        return db.collection(collection).updateOne(query, { $set: update });
      }

      static async delete(collection, query) {
        const db = getDb();
        if (query._id && typeof query._id === 'string') {
          query._id = new ObjectId(query._id);
        }
        return db.collection(collection).deleteOne(query);
    }

  static async insertMany(collection, urlsData) {
        const db = getDb();
        return db.collection(collection).insertMany(urlsData);
    }
}

module.exports = Url;