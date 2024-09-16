const { getDb } = require('../connect');
const userSchema = require('../schemas/userSchema');
const bcrypt = require('bcrypt');

class User {
  constructor(userData) {
    this.data = this.validate(userData);
  }

  validate(data) {
    for (const [key, config] of Object.entries(userSchema)) {
      if (config.required && !data[key]) {
        throw new Error(`${key} is required`);
      }
    }
    return data;
  }

  static async save(userData) {
    const db = getDb();
    userData.password = await bcrypt.hash(userData.password, 10);
    return db.collection('users').insertOne(userData);
  }

  static async findByUsername(username) {
    const db = getDb();
    return db.collection('users').findOne({ username });
  }

  static async updatePreferences(username, urls, keywords) {
    const db = getDb();
    return db.collection('users').updateOne(
      { username },
      { $set: { urls, keywords } }
    );
  }
}

module.exports = User;