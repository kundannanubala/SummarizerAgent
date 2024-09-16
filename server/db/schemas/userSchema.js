const userSchema = {
    username: { type: 'string', required: true, unique: true },
    password: { type: 'string', required: true },
    urls: { type: 'array', default: [] },
    keywords: { type: 'array', default: [] }
  };
  
  module.exports = userSchema;